"use strict";

let Deferred = require("../../lib/mt-promise");


/**
 * A Task is a wrapper around functions that allows someone to store a function and run it later.
 * The call to .run() will ALWAYS return a promise.
 * Arguments for the function will be accessible via arguments[0].arguments and additional information
 * supplied by run(arg1, arg2) will be available via arguments[0].additional.
 */
class Task {


    /**
     *
     * Creates a task based on the given function, args, and context
     *
     * @param func
     * @param args
     * @param context
     */
    constructor(func, args, context) {

        this.func = !!context ? func.bind(context) : func;

        this.args = Array.isArray(args) ? args : [args];

    }


    /**
     *
     * Run a given task with all provided arguments appended on the original
     * arguments list that is given to the function
     * @param add_args
     * @returns {*}
     */
    run(...add_args) {

        add_args = add_args || [];

        // call the function with the supplied arguments and bonus arguments

        let promise = this.func(...this.args, ...add_args);


        // make sure to always return a promise for consistency
        if (promise instanceof Deferred.Promise) {

            return promise;

        } else {

            let d = new Deferred();

            d.resolve(promise);

            return d.promise;

        }
    }

}


class TaskList {

    /**
     * Quasi-static variable holding the possible states of the task-list
     *
     * @returns {{RUNNING: number, PAUSING: number, STOPPED: number}}
     * @constructor
     */
    static get STATES() {
        return {
            RUNNING: 1,
            PAUSING: 2,
            STOPPED: 3
        }
    }


    /**
     * Creates a new tasklist with the given array of tasks or an empty one
     * @param tasks <optional> array of tasks
     */
    constructor(tasks) {

        this.tasks = Array.isArray(tasks) ? tasks : [];

        this.state = TaskList.STATES.STOPPED;

        this.deferred = null;

    }

    /**
     * @returns {Task|null} the currently active task
     */
    get current_task() {

        return this.tasks.length > 0 ? this.tasks[0] : null;

    }


    /**
     * Adds another task to the tasklist
     * @param tasks
     */
    add_tasks(tasks) {

        tasks = Array.isArray(tasks) ? tasks : [tasks];

        tasks.forEach(task => this.tasks.push(task));

    }


    /**
     * Is guaranteed to be async/next tick
     * Returns a promise that behaves as following:
     *
     * resolves with value: When the tasklist has been completely empties, resolves with the value of the last promise
     * resolves with TaskList.STATES.PAUSING: Indicates that the tasklist has been paused
     * rejects: When a task has failed
     * updates: on every task completion, independent whether it was successful
     *
     *
     * @returns {*}
     */
    start(...additions) {

        // if the thing is already running, return the current promise and warn
        if (this.state === TaskList.STATES.RUNNING) {

            return this.deferred.promise;

        }

        additions = additions || [];

        this.state = TaskList.STATES.RUNNING;

        this.deferred = new Deferred();


        /**
         *
         * @type {function(this:TaskList)}
         */
        let on_next_task = function (...args) {

            this.deferred.update(...args);

            // resolve with pause notice

            if (this.state === TaskList.STATES.PAUSING) {

                this.state = TaskList.STATES.STOPPED;

                let buffer_deferred = this.deferred;

                this.deferred = null;

                buffer_deferred.resolve(TaskList.STATES.PAUSING);

                return;

            }

            // resolve with last value

            if (!this.current_task) {

                this.state = TaskList.STATES.STOPPED;

                let buffer_deferred = this.deferred;

                this.deferred = null;

                buffer_deferred.resolve(...args);

                return;

            }

            // if no abort conditions are met, continue

            this._run_next(...args).then(on_next_task, on_task_failure);

        }.bind(this);

        /**
         *
         * @type {function(this:TaskList)}
         */
        let on_task_failure = function (...args) {

            this.deferred.update(...args);

            this.state = TaskList.STATES.STOPPED;

            let buffer_deferred = this.deferred;

            this.deferred = null;

            buffer_deferred.reject(...args);

        }.bind(this);


        // need to enforce async here because empty task lists would resolve immediately otherwise

        //noinspection JSUnresolvedVariable
        process.nextTick(() => this._run_next(...additions).then(on_next_task, on_task_failure));

        return this.deferred.promise;

    }


    /**
     *
     * @param additions
     * @returns {Deferred.promise}
     * @private
     */
    _run_next(...additions) {

        let def = new Deferred();

        additions = additions || [];

        // fix error when empty tasklist gets started

        if (this.tasks.length === 0) {

            def.resolve();

            return def.promise;

        }


        let p = this.tasks[0].run(...additions);

        p.then((...args) => {

            this.tasks.shift();

            def.resolve(...args);

        }, (...args) => {

            this.tasks.shift();

            def.reject(...args);

        });

        return def.promise;
    }


    /**
     * Removes all tasks and returns a promise that resolves once the task has been aborted
     * @returns {Promise} promise that is guaranteed to resolve async
     */
    clear() {

        this.tasks.length = 0;

        if (this.deferred) return this.deferred.promise;

        let d = new Deferred();

        //noinspection JSUnresolvedVariable
        process.nextTick(() => d.resolve());

        return d.promise;

    }


}


module.exports = {
    TaskList: TaskList,
    Task: Task
};

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
     * @param func
     * @param args
     * @param context
     */
    constructor(func, args, context) {

        this.func = !!context ? func.bind(context) : func;

        this.args = Array.isArray(args) ? args : [];

    }


    /**
     *
     * @param add_args
     * @returns {*}
     */
    run(add_args) {
        
        // call the function with the supplied arguments and extra values from run
        let promise = this.func({
            arguments: this.args,
            additions: add_args
        });

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
    get STATES() {
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

        this.state = this.STATES.STOPPED;

    }


    /**
     * @returns {Task|null} the currently active task
     */
    get current_task() {

        return this.tasks.length > 0 ? this.tasks[0] : null;

    }


    /**
     * Adds another task to the tasklist
     * @param task
     */
    add_task(task) {

        this.tasks.push(task);

    }


    /**
     *
     * @param val
     * @returns {Deferred.promise}
     * @private
     */
    _run_next(val) {

        let def = new Deferred();

        let p = this.tasks[0].run(val);

        p.then((...args) => {

            this.tasks.shift();
            def.resolve(args);

        }, (...args) => {

            this.tasks.shift();
            def.reject(args);

        });

        return def.promise;
    }


    /**
     * Returns a promise that behaves as following:
     *
     * resolves with value: When the tasklist has been completely empties, resolves with the value of the last promise
     * resolves with this.STATES.PAUSING: Indicates that the tasklist has been paused
     * rejects: When a task has failed
     * updates: on every task completion, independent whether it was successful
     *
     *
     * @returns {*}
     */
    start(additions) {

        this.state = this.STATES.RUNNING;

        let def = new Deferred();


        /**
         *
         * @type {function(this:TaskList)}
         */
        let on_next_task = function (args) {

            def.update(args);

            // resolve with pause notice
            if (this.state === this.STATES.PAUSING) {

                this.state = this.STATES.STOPPED;

                def.resolve(this.STATES.PAUSING);

                return;

            }

            // resolve with last value
            if (!this.current_task) {

                this.state = this.STATES.STOPPED;

                def.resolve(args);

                return;

            }

            // if no abort conditions are met, continue
            this._run_next(args).then(on_next_task, on_task_failure);

        }.bind(this);

        /**
         *
         * @type {function(this:TaskList)}
         */
        let on_task_failure = function (args) {

            def.update(args);

            this.state = this.STATES.STOPPED;

            def.reject(args);

        }.bind(this);

        this._run_next(additions).then(on_next_task, on_task_failure);

        return def.promise;
    }

    /**
     * Pauses the execution of the tasklist at the next possible moment
     */
    pause() {

        if (this.state === this.STATES.PAUSING || this.state == this.STATES.STOPPED) {

            throw new EvalError("#Tasklist: Can't pause task that is already", this.state);

        }

        this.state = this.STATES.PAUSING;
    }


}

module.exports = TaskList;

//let testTasklist = function () {
//
//    let a = [];
//    for (let i = 0; i < 100; i++) {
//        if(i%10 === 0){
//            let b = (function (val) {
//                return function (task_info) {
//                    let prev = task_info.additions;
//                    console.log("SPECIAL TASK", val, "and i have the add val", prev);
//                    return "ASDASDASDASD";
//                };
//            })(i);
//            a.push(b);
//        }else {
//            let b = (function (val) {
//                return function (task_info) {
//                    let d = new Deferred();
//                    let prev = task_info.additions;
//                    window.setTimeout(function () {
//                        console.log("I am task number", val, "and i have the add val", prev);
//                        d.resolve(i);
//                    }, 20);
//                    return d.promise;
//                };
//            })(i);
//            a.push(b);
//        }
//    }
//
//    let tasks = a.map(f => new Task(f, []));
//    let t = new TaskList(tasks);
//    t.start("x");
//    window.setTimeout(function(){
//        t.pause();
//        window.setTimeout(function(){
//            t.start();
//        },2000)
//    },2000)
//
//};




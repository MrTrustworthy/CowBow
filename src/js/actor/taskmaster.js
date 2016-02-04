"use strict";

var TaskList = require("../common/tasklist").TaskList;
var Task = require("../common/tasklist").Task;
let Tween = require("../common/tween");
let Deferred = require("../../lib/mt-promise");

/**
 * Helper class for actor movement
 */
class Taskmaster {


    /**
     *
     * @param actor
     * @param target {MapNode}
     * @param map
     */
    static send(actor, target, map) {

        Taskmaster.move(actor, target, map);
    }

    /**
     *
     * @param actor
     * @param target
     * @param map
     */
    static move(actor, target, map) {


        let task_list,
            tasks,
            task,
            nodes;

        nodes = Taskmaster._get_clean_path(actor, target, map);

        nodes.shift();

        // create a task for each node-to-node move action required

        tasks = nodes.map(node => {

            return new Task(Taskmaster._actor_move_task, [node], actor);

        });

        actor.task_list.clear();

        actor.task_list.add_tasks(tasks);

        actor.task_list.start();


    }

    static _get_clean_path(actor, target, map){

        let nodes;

        try {

            // get the path

            nodes = map.get_path(actor.node.point, target.point);

            nodes = Array.from(nodes).slice(1);

        } catch (e) {

            // abort if the target field is already locked or generally unpassable
            // because honestly, this will happen often

            if (e instanceof EvalError || e instanceof RangeError) {

                console.info("#Taskmaster: Can't find path", e);

                return null;

            } else {

                // something unexpected happened, in that case

                throw e;

            }
        }

        return nodes;
    }

    /**
     * Moves to a neighbouring node
     * @param target MAKE SURE ITS A NEIGHBOUR OR IT'LL LOOK WEIRD
     * @returns promise that resolves when target is reaches and rejects if it's impossible
     */
    static _actor_move_task(args){

        let def = new Deferred();

        let target = args.arguments[0];

        // guard statements
        if (this.__abort_request || this.busy || target.locked) {

            let reasons = {
                aborted: this.__abort_request,
                busy: this.busy,
                locked: target.locked
            };

            // reset abortion flag
            this.__abort_request = false;

            def.reject(reasons);
            return def.promise;
        }

        //if not, proceed

        this.busy = true;

        this.busy_with = def.promise;

        // lock target so nobody else tries to walk there

        target.lock(this);

        // get the tweening points

        let points = new Tween(

            this.node.point,

            target.point,

            this.node.point.distance_to(target.point) * 10

        );

        points = Array.from(points);

        // put the move-function into the current hooks
        var update_func = function () {

            let current = points.shift();

            this.mesh.position.x = current.x;
            this.mesh.position.y = current.y;
            this.mesh.position.z = current.z;

            if (points.length === 0) {

                // stop moving
                this.removeEventListener("scene_updated", update_func);

                // unlock the old node and set the current node to the new position
                this.node.unlock();
                this.node = target;

                // not busy anymore
                this.busy = false;
                this.busy_with = null;

                def.resolve();
            }
        }.bind(this);


        this.addEventListener("scene_updated", update_func);

        return def.promise;
    }

    //
    ///**
    // * Singletons are evil
    // *
    // * @param actor
    // * @param target
    // * @param map
    // */
    //static move(actor, target, map) {
    //
    //    let nodes;
    //
    //    try {
    //
    //        // get the path
    //
    //        nodes = map.get_path(actor.node.point, target.point);
    //
    //        nodes = Array.from(nodes).slice(1);
    //
    //    } catch (e) {
    //
    //        // abort if the target field is already locked or generally unpassable
    //        // because honestly, this will happen often
    //
    //        if (e instanceof EvalError || e instanceof RangeError) {
    //
    //            console.info("#Taskmaster: Can't find path", e);
    //
    //            return;
    //
    //        } else {
    //
    //            // something unexpected happened, in that case
    //
    //            throw e;
    //        }
    //    }
    //
    //
    //    var handle_move_error = function (error) {
    //
    //        if (error.aborted) {
    //
    //            // do nothing if aborted except not moving any further
    //
    //            console.info("#Taskmaster: Actor movement was aborted:", error);
    //
    //        } else if (error.busy) {
    //
    //            // if busy, abort current movement then try again
    //
    //            actor.abort().then(() => Taskmaster.move(actor, target, map));
    //
    //        } else if (error.locked) {
    //
    //            // if locked, try again
    //
    //            Taskmaster.move(actor, target, map);
    //
    //        }
    //    };
    //
    //
    //    var move_func = function () {
    //
    //        let next = nodes.shift();
    //
    //        if (!next) return;
    //
    //        actor.move_to(next).then(
    //            move_func,
    //
    //            handle_move_error
    //        );
    //
    //    };
    //
    //    move_func();
    //}

}

module.exports = Taskmaster;

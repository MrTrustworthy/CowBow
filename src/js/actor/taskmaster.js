"use strict";

var TaskList = require("../common/tasklist").TaskList;
var Task = require("../common/tasklist").Task;
let Tween = require("../common/tween");
let Deferred = require("../../lib/mt-promise");
let MapError = require("../common/errors").MapError;
let PathError = require("../common/errors").PathError;


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


        let tasks,
            nodes;





        actor.task_list.clear().then(()=>{

            nodes = Taskmaster._get_clean_path(actor, target, map);

            // create a task for each node-to-node move action required

            tasks = nodes.map(node => {

                return new Task(Taskmaster._actor_move_task, [node], actor);

            });

            actor.task_list.add_tasks(tasks);

            actor.task_list.start();
            //    .then(
            //    () => {
            //    },
            //    () => setTimeout(Taskmaster.move.bind(null, actor, target, map), 100)
            //);
        });




    }

    /**
     *
     * @param actor
     * @param target
     * @param map
     * @returns {*}
     * @private
     */
    static _get_clean_path(actor, target, map) {

        let nodes;

        try {

            // get the path

            nodes = map.get_path(actor.node.point, target.point);

            nodes = Array.from(nodes).slice(1);

            // remove the starting node

            nodes.shift();

        } catch (e) {

            // abort if the target field is already locked or generally unpassable
            // because honestly, this will happen often

            if (e instanceof PathError) {

                console.info("#Taskmaster: Can't find path", e);

                return [];

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
    static _actor_move_task(target) {

        let def = new Deferred();

        try {

            target.lock(this);

        } catch (e) {

            // if locking is not possible because something already is there, abort

            if (!(e instanceof MapError)) throw e;

            def.reject();

            return def.promise;

        }

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

                def.resolve();
            }
        }.bind(this);

        this.addEventListener("scene_updated", update_func);

        return def.promise;
    }


}

module.exports = Taskmaster;

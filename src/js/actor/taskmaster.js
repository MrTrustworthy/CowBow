"use strict";

let TaskList = require("../common/tasklist");

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
    static send(actor, target, map){

        Taskmaster.move(actor,target, map);

    }


    /**
     * Singletons are evil
     *
     * @param actor
     * @param target
     * @param map
     */
    static move(actor, target, map) {

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
                return;
            } else {
                // something unexpected happened, in that case
                throw e;
            }
        }


        var handle_move_error = function (error) {
            if (error.aborted) {
                // do nothing if aborted except not moving any further
                console.info("#Taskmaster: Actor movement was aborted:", error);
            } else if (error.busy) {
                // if busy, abort current movement then try again
                actor.abort().then(() => Taskmaster.move(actor, target, map));
            } else if (error.locked) {
                // if locked, try again
                Taskmaster.move(actor, target, map);
            }
        };


        var move_func = function () {
            let next = nodes.shift();
            if (!next) return;

            actor.move_to(next).then(
                move_func,
                handle_move_error
            );
        };

        move_func();
    }

}

module.exports = Taskmaster;

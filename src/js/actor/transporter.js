"use strict";

/**
 * Helper class for actor movement
 */
class Transporter {


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
                console.info("#Transporter: Can't find path", e);
                return;
            } else {
                // something unexpected happened, in that case
                throw e;
            }
        }


        var handle_move_error = function (error) {
            if (error.aborted) {
                // do nothing if aborted except not moving any further
                console.info("#Transporter: Actor movement was aborted:", error);
            } else if (error.busy) {
                // if busy, abort current movement then try again
                actor.abort().then(() => Transporter.move(actor, target, map));
            } else if (error.locked) {
                // if locked, try again
                Transporter.move(actor, target, map);
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

module.exports = Transporter;

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

        // abort if the target field is already locked
        try{
            nodes = map.get_path(actor.node.point, target.point);
            nodes = Array.from(nodes).slice(1);
        } catch(e){
            console.warn("#Transporter: Can't find path", e);
            return;
        }


        var func = function () {
            let next = nodes.shift();
            if (!next) return;

            actor.move_to(next).then(
                func,
                    err => {

                    if (err.aborted) {
                        // do nothing if aborted except not moving any further
                        console.warn("#Transporter: Actor movement was aborted:", err);
                    } else if (err.busy) {
                        // if busy, abort current movement then try again
                        actor.abort().then(() => Transporter.move(actor, target, map));
                    } else if(err.locked) {
                        // if locked, try again
                        Transporter.move(actor, target, map);
                    }
                }
            );

        };

        func();
    }

}

module.exports = Transporter;

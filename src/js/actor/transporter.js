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
    static move(actor, target, map){

        var nodes = map.get_path(actor.node.point, target.point);
        nodes = Array.from(nodes).slice(1);


        var func = function(){
            let next = nodes.shift();
            if(!next) return;

            let p = actor.move_to(next);

            p.then(function(){
                func();
            }, function(err){
                console.warn("#MC: Can't move actor further:", err);
            })

        };

        func();
    }

}

module.exports = Transporter;

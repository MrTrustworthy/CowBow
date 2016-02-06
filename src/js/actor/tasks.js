"use strict";

let Tween = require("../common/tween");
let MapError = require("../common/errors").MapError;
let Deferred = require("../../lib/mt-promise");

/**
 * This class contains "tasks" for the actor.
 * Tasks are functions that are executed with the context of the actor to perform specific actions.
 */






/**
 * Moves to a neighbouring node
 * @param target MAKE SURE ITS A NEIGHBOUR OR IT'LL LOOK WEIRD
 * @returns promise that resolves when target is reaches and rejects if it's impossible
 */
function move_task(target) {

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


/**
 *
 * @param resource
 * @returns {*}
 */
function gather_task(resource, abort){

    let def = new Deferred();


    let finish_gathering = function(){

        this.mesh.rotation.z = 0;

        this.removeEventListener("scene_updated", update_func);

        debugger;

        def.resolve();

    }.bind(this);


    // put the move-function into the current hooks
    var update_func = function () {

        // play animation
        // FIXME you know why

        this.mesh.rotateZ(0.05);

        // get resource

        let res =  resource.work_on();

        if(!res) finish_gathering();

        let has_inventory_space = this.inventory.add(res);

        if(!has_inventory_space) finish_gathering();


    }.bind(this);

    this.addEventListener("scene_updated", update_func);

    return def.promise;

}



module.exports = {
    move_task: move_task,
    gather_task: gather_task
};

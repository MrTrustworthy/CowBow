"use strict";

var GameObject = require("../common/gameobject");
var THREE = require("../../lib/three");
var Point = require("../common/point");
var Tween = require("../common/tween");
var Deferred = require("../../lib/mt-promise");

class Actor extends GameObject {

    /**
     *
     * @param node MapNode
     */
    constructor(node) {

        super();

        node.lock();
        this.node = node; // mapnode


        this.mesh = this.generate_model();
        this.mesh.userData = this;

        // function that should be executed when the actor gets updated
        // get/set via this.update_hook
        this.__update_hook = null;

    }

    /**
     * Prevents stacking hook functions
     * @param func
     */
    set update_hook(func) {
        if (func && this.__update_hook) throw new EvalError("#Actor: Can't add new update hook if one already exists!");
        this.__update_hook = func;
    }

    /**
     * Getter
     * @returns {null|*}
     */
    get update_hook() {
        return this.__update_hook;
    }

    /**
     * For when we need to check if the actor is already moving or something
     * @returns {boolean}
     */
    get busy() {
        return !!this.update_hook;
    }


    /**
     * FIXME TODO: Replace this call with a this.handleEvent or something and dispatch it in the animation
     */
    progress() {
        if (this.update_hook) this.update_hook.call(this);
    }

    /**
     * Moves to a neighbouring node
     * @param target MAKE SURE ITS A NEIGHBOUR OR IT'LL LOOK WEIRD
     * @returns promise that resolves when target is reaches and rejects if it's impossible
     */
    move_to(target) {
        let def = new Deferred();

        // guard statements
        if (this.busy) {
            def.reject("#Actor: Actor is already moving!");
            return def.promise;
        }
        if (target.locked) {
            def.reject("#Actor: Target position currently locked!");
            return def.promise;
        }

        // lock target so nobody else tries to walk there
        target.lock(); 

        // get the tweening points
        let points = new Tween(this.node.point, target.point, 10);
        points = Array.from(points);

        // put the move-function into the current hooks
        this.update_hook = function () {

            let current = points.shift();

            this.mesh.position.x = current.x;
            this.mesh.position.y = current.y;
            this.mesh.position.z = current.z;

            if (points.length === 0) {
                // stop moving
                this.update_hook = null;
                // unlock the old node and set the current node to the new position
                this.node.unlock();
                this.node = target;
                def.resolve();
            }
        }.bind(this);


        return def.promise;
    }


    /**
     *
     * @returns {THREE.Mesh}
     */
    generate_model() {
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.MeshLambertMaterial({color: 0xff0000});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = this.node.point.x;
        mesh.position.y = this.node.point.y;
        mesh.position.z = this.node.point.z;
        return mesh;
    }

}


module.exports = Actor;

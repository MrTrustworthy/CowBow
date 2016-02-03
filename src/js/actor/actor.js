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

        this.node = node; // mapnode
        this.node.lock(this);


        this.mesh = this.generate_model();
        this.mesh.userData = this;


        this.busy = false; // will be "true" if moving
        this.busy_with = null; // promise of movement that resolves/rejects

        // call this.abort() this to force cancelling the current moving after next field
        this.__abort_request = false;

    }

    /**
     * Aborts the current movement after the next step and returns a promise
     * that resolves when the movement has ended.
     *
     * Also resolves if the movement hasn't been force-ended if it coincidentally ends on the next step
     *
     * @returns {null|*}
     */
    abort() {
        let def = new Deferred();
        this.__abort_request = true;

        this.busy_with.then(
            () => def.resolve(),
            () => def.resolve()
        );
        return def.promise;
    }


    /**
     * Moves to a neighbouring node
     * @param target MAKE SURE ITS A NEIGHBOUR OR IT'LL LOOK WEIRD
     * @returns promise that resolves when target is reaches and rejects if it's impossible
     */
    move_to(target) {
        let def = new Deferred();

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
        let points = new Tween(this.node.point, target.point, 10);
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

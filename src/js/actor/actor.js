"use strict";

let GameObject = require("../common/gameobject");
let THREE = require("../../lib/three");
let Point = require("../common/point");
let Tween = require("../common/tween");
let Deferred = require("../../lib/mt-promise");
let TaskList = require("../common/tasklist").TaskList;

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

        this.task_list = new TaskList();


        //this.busy = false; // will be "true" if moving
        //this.busy_with = null; // promise of movement that resolves/rejects
        //
        //// call this.abort() this to force cancelling the current moving after next field
        //this.__abort_request = false;

    }

    /**
     * Aborts the current movement after the next step and returns a promise
     * that resolves when the movement has ended.
     *
     * Also resolves if the movement hasn't been force-ended if it coincidentally ends on the next step
     *
     * @returns {null|*}
     */
    //abort() {
    //    let def = new Deferred();
    //    this.__abort_request = true;
    //
    //    this.busy_with.then(
    //        () => def.resolve(),
    //        () => def.resolve()
    //    );
    //    return def.promise;
    //}




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

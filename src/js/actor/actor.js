"use strict";

let GameObject = require("../common/gameobject");
let THREE = require("../../lib/three");
let Point = require("../common/point");
let Tween = require("../common/tween");
let Deferred = require("../../lib/mt-promise");
let TaskList = require("../common/tasklist").TaskList;
let Inventory = require("./inventory");

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

        // describes items

        this.inventory = new Inventory();

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

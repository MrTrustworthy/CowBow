"use strict";

var InputHandler = require("./inputhandler");
var THREE = require("../../lib/three");
var Map = require("../map/map");
var MapNode = require("../map/mapnode");
var Actor = require("../actor/actor");
var Transporter = require("../actor/transporter");
var GameObject = require("../common/gameobject");
var Path = require("../map/path");






class MainController {

    constructor(animation, map, actors) {
        this.animation = animation;
        this.map = map;
        this.actors = actors;

        this.selection = null;

        this.input_handler = new InputHandler(animation.camera, animation.scene);

        window.onclick = this.handle_click.bind(this);
        window.oncontextmenu = this.handle_click.bind(this);


    }

    handle_click(event) {

        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();

        mouse.x = ( event.clientX / this.animation.renderer.domElement.width ) * 2 - 1;
        mouse.y = -( event.clientY / this.animation.renderer.domElement.height ) * 2 + 1;
        raycaster.setFromCamera(mouse, this.animation.camera);

        let obj = raycaster.intersectObjects(this.animation.scene.children)[0];

        if (obj.object.userData instanceof Map) this.handle_map_click(obj);
        else if (obj.object.userData instanceof Actor) this.handle_actor_click(obj);
        else if (obj.object.userData instanceof GameObject) this.handle_object_click(obj);

        // dont bubble squirtle!
        return false;

    }

    /**
     * Handles the click on an actor
     * @param obj
     */
    handle_actor_click(obj) {
        this.selection = obj.object.userData;
    }


    handle_map_click(obj) {
        console.log("Map click");


        // determine the vertices based on the clicked face
        let verts = [
            obj.object.geometry.vertices[obj.face.a],
            obj.object.geometry.vertices[obj.face.b],
            obj.object.geometry.vertices[obj.face.c]
        ];
        // get the corresponding map-nodes
        let map_nodes = verts.map(v => this.map.structure.get(v.x, v.y));

        // check for passable nodes only
        let valid = map_nodes.filter(n => n.passable);

        if (valid.length === 0) throw new RangeError("#MainController: can't work with unpassable map nodes!");

        let target = valid.pop();

        // move actor w
        if (this.selection instanceof Actor) {
            Transporter.move(this.selection, target, this.map)
        }

    }


}

module.exports = MainController;

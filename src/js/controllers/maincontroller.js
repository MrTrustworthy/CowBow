"use strict";

var InputHandler = require("./inputhandler");
var THREE = require("../../lib/three");
var Map = require("../map/map");
var MapNode = require("../map/mapnode");
var Actor = require("../actor/actor");
var Transporter = require("../actor/transporter");
var GameObject = require("../common/gameobject");
var Path = require("../map/path");
var MouseHandler = require("./mousehandler");


class MainController {

    constructor(animation, map, actors) {
        this.animation = animation;
        this.map = map;
        this.actors = actors;

        this.selection = [];

        this.input_handler = new InputHandler(animation.camera, animation.scene);
        this.mouse_handler = new MouseHandler(animation, map, actors);

        this.mouse_handler.on("click", this.handle_click.bind(this));
        this.mouse_handler.on("selection", this.handle_select.bind(this));
        this.mouse_handler.on("rightclick", this.handle_rightclick.bind(this));


    }

    /**
     *
     * @param clicked Object{object, face, point, ...)
     */
    handle_click(clicked) {
        console.log("#MC: click", clicked);

        let obj = clicked.object;

        if (obj.userData instanceof Actor) this.selection = [obj.userData];
        else this.selection.length = 0;

    }

    /**
     *
     * @param selections Array<Actor>
     */
    handle_select(selections) {
        console.log("#MC: select", selections);
        this.selection.length = 0;
        this.selection.push.apply(this.selection, selections);
    }

    /**
     * If actors are selected, will send them to the target field
     *
     * @param clicked Object{object, face, point, ...)
     */
    handle_rightclick(clicked) {
        console.log("#MC: rightclick", clicked);

        if(this.selection.length === 0) return;

        let geo_verts = clicked.object.geometry.vertices;

        this.selection.forEach( actor => {

            // determine the vertices based on the clicked face
            let verts = [
                geo_verts[clicked.face.a],
                geo_verts[clicked.face.b],
                geo_verts[clicked.face.c]
            ];
            // get the corresponding map-nodes
            let map_nodes = verts.map(v => this.map.structure.get(v.x, v.y));

            // check for passable nodes only
            let valid = map_nodes.filter(n => n.passable);

            if (valid.length === 0) throw new RangeError("#MainController: can't work with unpassable map nodes!");

            let target = valid.pop();

            // transporter will handle all other stuff
            Transporter.move(actor, target, this.map)

        });

    }


}

module.exports = MainController;

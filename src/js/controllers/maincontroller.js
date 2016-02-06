"use strict";

let InputHandler = require("./inputhandler");
let THREE = require("../../lib/three");
let Map = require("../map/map");
let MapNode = require("../map/mapnode");
let Actor = require("../actor/actor");
let Taskmaster = require("../actor/taskmaster");
let GameObject = require("../common/gameobject");
let Path = require("../map/path");
let MouseHandler = require("./mousehandler");
let Point = require("../common/point");

/**
 *
 */
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
     * Returns the map-node closest for a given click-event
     *
     * @param clicked
     * @returns {*}
     */
    get_closest_node(clicked){

        let point = Point.from(clicked.point);

        // determine the vertices (and thereby the possible positions) based on the clicked face

        let all_vertices = clicked.object.geometry.vertices;

        let vertices = [
            all_vertices[clicked.face.a],
            all_vertices[clicked.face.b],
            all_vertices[clicked.face.c]
        ];

        // find out which point is the closest via Point.distance_to

        let distances = vertices.map(p =>  point.distance_to(Point.from(p)) );

        let smallest_dist = Math.min.apply(Math, distances);

        // get the closest vertice

        let closest_point = vertices[distances.indexOf(smallest_dist)];

        return this.map.structure.get(closest_point.x, closest_point.y);

    }

    /**
     * If actors are selected, will send them to the target field
     *
     * @param clicked Object{object, face, point, ...)
     */
    handle_rightclick(clicked) {

        // rightclick only does stuff when we have something selected

        if(this.selection.length === 0) return;

        clicked = clicked.filter(evt => evt.object.userData instanceof Map)[0];

        // get the target node

        let target = this.get_closest_node(clicked);

        // move each actor somewhere

        this.selection.forEach( actor => Taskmaster.send(actor, target, this.map) );

    }


}

module.exports = MainController;

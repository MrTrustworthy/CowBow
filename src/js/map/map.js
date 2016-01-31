"use strict";

var GameObject = require("../common/gameobject");
var THREE = require("../../lib/three");
var List2D = require("../common/list2d");
var Point = require("../common/point");
var Structure = require("./structure");
var Model = require("./model");
var Path = require("./path");


class Map extends GameObject {

    /**
     *
     * @param properties: Map with keys: size_x, size_y
     */
    constructor(properties) {
        super();

        this.properties = properties || Map._get_default_properties();

        // structure is a List2D filled with MapNodes
        this.structure = Structure.create_random(this.properties);


        this.mesh = Model.generate_model(this.properties, this.structure);
        this.mesh.userData = this;

    }


    /**
     * Determines the best possible path between two points
     * @param from
     * @param to
     * @returns {Path|exports|module.exports}
     */
    get_path(from, to){

        if(!from.x || !from.y || !to.x || !to.y) throw new TypeError("#Map: Need to pass two points with x/y val!");

        return new Path(from, to, this.structure);
    };


    /**
     * Returns default properties for when none have been provided
     * @private
     */
    static _get_default_properties() {
        return {
            size_x: 100,
            size_y: 100,
            structure: null,
            groundwater: -0.8,
            mountain: 1,
            highlight_chance: 300 // 1000 means 1 in 1000
        };
    }


}

module.exports = Map;

"use strict";

let GameObject = require("../common/gameobject");
let THREE = require("../../lib/three");
let List2D = require("../common/list2d");
let Point = require("../common/point");
let StructureBuilder = require("./structurebuilder");
let MapError = require("../common/errors").MapError;
let Model = require("./model");
let Path = require("./path");


let default_properties = {
    size_x: 100,
    size_y: 100,
    structure: null,
    groundwater: -0.8,
    mountain: 1,
    highlight_chance: 300 // 1000 means 1 in 1000
};

class Map extends GameObject {

    /**
     *
     * @param properties: Map with keys: size_x, size_y
     */
    constructor(properties) {

        super();

        this.properties = properties || default_properties;

        // structure is a List2D filled with MapNodes

        this.structure = StructureBuilder.create_random(this.properties);

        this.mesh = Model.generate_model(this.properties, this.structure);

        this.mesh.userData = this;


        // generate the resources

        this.resources = StructureBuilder.calculate_resources(this.structure);

        // place the resources on the nodes
        // FIXME Make sure that two resources can't overlap!

        this.resources.forEach(resource => {

            resource.fields.forEach(field =>{

                let node = this.structure.get(field.x, field.y);

                node.lock(resource);

            })

        })


    }


    /**
     * Adds a resource to this map
     * @param resource
     */
    add_resource(resource){
        this.resources.push(resource);
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


}

module.exports = Map;

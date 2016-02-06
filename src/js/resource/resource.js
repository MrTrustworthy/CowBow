"use strict";

let GameObject = require("../common/gameobject");
let THREE = require("../../lib/three");


let default_properties = {
    res: "WOOD",
    amount: 10,
    fields: [
        {x: 20, y: 40},
        {x: 20, y: 41},
        {x: 21, y: 40},
        {x: 21, y: 41}
    ]
};


class Resource extends GameObject {

    constructor(properties) {

        super();

        properties = properties || default_properties;

        this.type = Resource.RES[properties.res];

        this.amount = properties.amount;

        this.fields = properties.fields;

        this.mesh = this.generate_mesh();

    }

    static get RES(){

        return {
            "WOOD": "WOOD",
            "STONE": "STONE"
        }

    }


    generate_mesh() {

        // generate the geometry
        let geometry = this.fields.map(field => {

            // create a geometry object for each field this resource is on
            let geo = new THREE.BoxGeometry(0.25, 0.25, 5);
            geo.vertices.forEach(vert => {
                vert.x += field.x;
                vert.y += field.y;
            });
            return geo;

            // merge all those geometries into one
        }).reduce((prev, curr) => {
            if (prev) curr.merge(prev);
            return curr;
        });

        let material = new THREE.MeshLambertMaterial({color: 0xffffff});
        return new THREE.Mesh(geometry, material);

    }


    work_on() {

        return "WOOD";

    }

}

module.exports = Resource;

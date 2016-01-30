"use strict";

var GameObject = require("../common/gameobject");
var THREE = require("../../lib/three");
var List2D = require("../common/list2d");
var Point = require("../common/point");
var Structure = require("./structure");


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


        this.mesh = this._create_mesh();

        window.a = this;

    }


    /**
     * Returns default properties for when none have been provided
     * @private
     */
    static _get_default_properties() {
        return {
            size_x: 100,
            size_y: 100,
            structure: null,
            groundwater: -0.5
        };
    }

    _create_mesh() {


        let geometry = new THREE.Geometry();

        let width = this.structure.width;
        let length = this.structure.length;


        // 0: ground, 1: earth
        let materials = new THREE.MeshFaceMaterial([
            new THREE.MeshLambertMaterial({color: 0x00ff00}),
            new THREE.MeshLambertMaterial({color: 0x0000ff})
        ]);


        // create vertices based on the structure
        this.structure.for_each(function (node, x, y) {
            // add the vertices for each point
            let vert = new THREE.Vector3(node.point.x, node.point.y, node.height);
            geometry.vertices.push(vert);
        }.bind(this));


        // create 2 faces for each point, excluding the points at the corners
        this.structure.for_each(function (node, x, y) {

            // no faces if we are at the right or bottom border
            if (x === width - 1 || y === length - 1) return;

            // determine which faces are above the water
            let water = this.properties.groundwater;
            let face1_material = this.structure.get(x, y).height <= water ? 1 : 0;
            let face2_material = this.structure.get(x+1, y+1).height <= water ? 1 : 0;

            if(this.structure.get(x+1, y).height <= water || this.structure.get(x, y+1).height <= water){
                face1_material = face2_material = 1;
            }


            // add faces
            let face1 = new THREE.Face3(
                x + y * width,
                x + 1 + y * width,
                x + (y + 1) * width,
                null,
                null,
                face1_material
            );
            let face2 = new THREE.Face3(
                x + (y + 1) * width,
                x + 1 + y * width,
                x + 1 + (y + 1) * width,
                null,
                null,
                face2_material
            );

            geometry.faces.push(face1, face2);


        }.bind(this));


        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();

        return new THREE.Mesh(geometry, materials);
    }

}

module.exports = Map;
"use strict";

var THREE = require("../../lib/three");

class Model {


    /**
     * Creates the rather complex map-mesh including textures
     *
     * @returns {THREE.Mesh}
     * @private
     */
    static generate_model(properties, structure) {


        let geometry = new THREE.Geometry();

        let width = structure.width;
        let length = structure.length;


        // 0: water, 1: earth, 2: mountaintop
        let materials = new THREE.MeshFaceMaterial([
            new THREE.MeshLambertMaterial({color: 0x0000ff}),
            new THREE.MeshLambertMaterial({color: 0x00ff00}),
            new THREE.MeshLambertMaterial({color: 0xf4a460})
        ]);


        // create vertices based on the structure
       structure.for_each(function (node, x, y) {
            // add the vertices for each point
            let vert = new THREE.Vector3(node.point.x, node.point.y, node.point.z);
            geometry.vertices.push(vert);
        });


        // create 2 faces for each point, excluding the points at the corners
       structure.for_each(function (node, x, y) {

            // no faces if we are at the right or bottom/top(?) border
            if (x === width - 1 || y === length - 1) return;


            // determine which faces are water and mountains
            let water = properties.groundwater;
            let mountain = properties.mountain;


            let face1_vals = [
                structure.get(x, y).point.z,
                structure.get(x + 1, y).point.z,
                structure.get(x, y + 1).point.z
            ];

            let face2_vals = [
                structure.get(x + 1, y + 1).point.z,
                structure.get(x + 1, y).point.z,
                structure.get(x, y + 1).point.z
            ];

            // get dem materials right
            let face1_material = face1_vals.some(x => x <= water) ? 0 : face1_vals.some(x => x >= mountain) ? 2 : 1;
            let face2_material = face2_vals.some(x => x <= water) ? 0 : face2_vals.some(x => x >= mountain) ? 2 : 1;


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


        });


        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();

        return new THREE.Mesh(geometry, materials);
    }

}

module.exports = Model;
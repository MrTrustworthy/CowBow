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

        // determine which faces are water and mountains
        let water = properties.groundwater;
        let mountain = properties.mountain;


        let material = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});


        // 0: water, 1: earth, 2: mountaintop
        let vertice_colors = [
            new THREE.Color(0x229CE4),
            new THREE.Color(0x006400),
            new THREE.Color(0xf4a460)
        ];




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


            // calculate the index of the corresponding vertices/vertix/vertixes??
            let face1_coords = {
                a: x + y * width,
                b: x + 1 + y * width,
                c: x + (y + 1) * width
            };

            // determine the vertice colors by cross-checking their values with the threshholds
            let face1_colors = ["a", "b", "c"].map(mat_coord => {
                let vert = geometry.vertices[face1_coords[mat_coord]];
                let i = vert.z <= water ? 0 : vert.z >= mountain ? 2: 1;
                return vertice_colors[i];
            });

            let face1 = new THREE.Face3(
                face1_coords.a,
                face1_coords.b,
                face1_coords.c,
                null,
                face1_colors
            );

            //++++++++++++++

            // calculate the index of the corresponding vertices/vertix/vertixes??
            let face2_coords = {
                a: x + (y + 1) * width,
                b: x + 1 + y * width,
                c: x + 1 + (y + 1) * width
            };

            // determine the vertice colors by cross-checking their values with the threshholds
            let face2_colors = ["a", "b", "c"].map(mat_coord => {
                let vert = geometry.vertices[face2_coords[mat_coord]];
                let i = vert.z <= water ? 0 : vert.z >= mountain ? 2: 1;
                return vertice_colors[i];
            });


            let face2 = new THREE.Face3(
                face2_coords.a,
                face2_coords.b,
                face2_coords.c,
                null,
                face2_colors
            );

            geometry.faces.push(face1, face2);


        });


        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();
        //geometry.colorsNeedUpdate = true;

        return new THREE.Mesh(geometry, material);
    }

}

module.exports = Model;

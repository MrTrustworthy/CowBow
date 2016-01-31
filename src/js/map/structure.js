"use strict";

var List2D = require("../common/list2d");
var MapNode = require("./mapnode");
var Point = require("../common/point");

/**
 * Helper class for map structures
 */
class Structure {

    /**
     * Create random structure
     * @param properties
     * @returns {List2D|exports|module.exports}
     */
    static create_random(properties) {



        let l2d = new List2D(properties.size_x, properties.size_y);

        // fill each point with a random height
        l2d.for_each(function (elem, x, y) {

            let height = Math.random() * 10 - 5;

            // chance for highlight:
            if(Math.random()* properties.highlight_chance < 1) height *= 10;

            let point = new Point(x, y, height);

            let node = new MapNode(point, true);
            l2d.set(x, y, node);

        });


        // smooth the heights to get a natural looking map
        let clean_runs = 20;
        for(let i = 0; i < clean_runs; i++){

            // harmonize each node with the surrounding nodes
            l2d.for_each(function (elem, x, y) {

                let surrounding = l2d.get_surrounding(x, y);
                let avg = surrounding.reduce((val, elem) => val + elem.point.z, 0) / surrounding.length;

                // change the.point.z to be 20% closer to the average
                elem.point.z = ( elem.point.z * 4 + avg ) / 5

            });
        }

        // block water/mountain fields
        l2d.for_each(function (elem) {
            if(elem.point.z <= properties.groundwater || elem.point.z >= properties.mountain) elem.passable = false;
        });



        return l2d;
    }

}


module.exports = Structure;

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

        let clean_runs = 20;

        let l2d = new List2D(properties.size_x, properties.size_y);

        // fill each point with a random height
        l2d.for_each(function (elem, x, y) {

            let height = Math.random() * 10 - 5,
                point = new Point(x, y);

            // chance for highlight:
            if(Math.random()* 1000 < 1) height *= 10;


            let node = new MapNode(point, height, true);
            l2d.set(x, y, node);

        });



        for(let i = 0; i < clean_runs; i++){

            l2d.for_each(function (elem, x, y) {

                let surrounding = l2d.get_surrounding(x, y);
                let avg = surrounding.reduce((val, elem) => val + elem.height, 0) / surrounding.length;
                // change the hight to be 33% closer to the average
                elem.height = ( elem.height * 4 + avg ) / 5

            });
        }





        return l2d;
    }

}


module.exports = Structure;
"use strict";

let List2D = require("../common/list2d");
let MapNode = require("./mapnode");
let Point = require("../common/point");
let Resource = require("../resource/resource");

/**
 * Helper class for map structures
 */
class StructureBuilder {

    /**
     * Create random structure
     * @param properties
     * @returns {List2D|exports|module.exports}
     */
    static create_random(properties) {

        let l2d = StructureBuilder.get_basic_structure(properties);

        StructureBuilder.refine(l2d, 20);

        StructureBuilder.block_areas(l2d, properties);

        return l2d;
    }

    /**
     *
     * @param properties
     * @returns {List2D|exports|module.exports}
     */
    static get_basic_structure(properties) {

        let l2d = new List2D(properties.size_x, properties.size_y);

        // fill each point with a random height
        l2d.for_each(function (elem, x, y) {

            let height = Math.random() * 10 - 5;

            // chance for highlight:

            if (Math.random() * properties.highlight_chance < 1) height *= 10;

            let point = new Point(x, y, height);

            let node = new MapNode(point, true);

            l2d.set(x, y, node);

        });

        return l2d;
    }


    /**
     *
     * @param l2d
     * @param clean_runs
     */
    static refine(l2d, clean_runs) {

        clean_runs = clean_runs || 5;

        // smooth the heights to get a natural looking map

        for (let i = 0; i < clean_runs; i++) {

            // harmonize each node with the surrounding nodes

            l2d.for_each(function (elem, x, y) {

                let surrounding = l2d.get_surrounding(x, y);

                let avg = surrounding.reduce((val, elem) => val + elem.point.z, 0) / surrounding.length;

                // change the.point.z to be 20% closer to the average

                elem.point.z = ( elem.point.z * 4 + avg ) / 5

            });

        }

        return l2d;

    }


    /**
     *
     * @param l2d
     */
    static block_areas(l2d, properties) {

        // block water/mountain fields

        l2d.for_each(function (elem) {

            if (elem.point.z <= properties.groundwater ||
                elem.point.z >= properties.mountain)

                elem.passable = false;

        });

    }


    /**
     *
     * @param l2d
     */
    static calculate_resources(l2d, amount) {

        amount = amount || 1;

        let resources = [];

        for (let i = 0; i < amount; i++) {

            // generate a spot of random, free resources

            let random = l2d.get_random();

            while (!random.passable) random = l2d.get_random();

            let spot = l2d.get_surrounding(random.point.x, random.point.y);

            spot = spot.filter(node => node.passable);

            spot.push(random);

            // calculate the positions of the resource

            let coords = spot.map(node => {
                return {
                    x: node.point.x,
                    y: node.point.y
                }
            });

            let res = new Resource({
                res: Resource.RES.WOOD,
                amount: 10,
                fields: coords
            });

            resources.push(res);
        }

        return resources;

    }

}


module.exports = StructureBuilder;

"use strict";


/**
 * Usage:
 *
 * let a = new Tween({x: 0}, {x: 10}, 4);
 * for(var i of a){
 *   console.log(i);
 * }
 *
 */
class Tween {

    constructor(from, to, steps) {

        let keys = Object.keys(from);

        let current_step = 0;
        let current_val = {};
        let step_size = {};

        keys.forEach(function (key) {
            current_val[key] = from[key];
            step_size[key] = (to[key] - from[key]) / steps;
        });


        this[Symbol.iterator] = function* () {

            while (current_step < steps) {
                current_step++;
                keys.forEach(key => current_val[key] += step_size[key]);

                // clone and return object
                let clone = {};
                keys.forEach(key=> clone[key] = current_val[key]);

                yield clone;
            }
        }


    }

}


module.exports = Tween;

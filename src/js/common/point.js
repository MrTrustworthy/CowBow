"use strict";

var THREE = require("../../lib/three");

class Point {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z || 0;
    }

    static from(vec){
        return new Point(vec.x, vec.y, vec.z);
    }

    to_vector(){
        return new THREE.Vector3(this.x, this.y, this.z);
    }

    /**
     * Calculates the distance between two points
     * @param other
     * @param include_z
     * @returns {number}
     */
    distance_to(other, include_z){

        include_z = include_z || false;
        if(include_z) throw new ReferenceError("#Point: Distance based on Z not implemented!");

        return Math.sqrt(Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2));

    };

    equals(other){
        return this.x === other.x && this.y === other.y;
    }

    /**
     * Pretty prints
     * @returns {*}
     */
    toString(){
        return `(${this.x}:${this.y}:${this.z})`;
    }

}

module.exports = Point;

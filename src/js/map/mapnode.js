"use strict";

let MapError = require("../common/errors").MapError;

class MapNode {

    constructor(point, passable) {
        this.point = point;
        this.passable = passable || false;

        this.__lock_object = null;
    }

    lock(lock_obj) {
        if (!!this.__lock_object) throw new MapError("#Mapnode: Node is already locked!");
        this.__lock_object = lock_obj;
    }

    unlock() {
        this.__lock_object = null;
    }

    get locked() {
        return !!this.__lock_object;
    }

    get object(){
        return this.__lock_object;
    }

    toString() {
        return `(${this.point.x}:${this.point.y}) ${this.point.z.toString().substring(0, 3)} ${this.passable ? "o" : "x"}`;
    }

}

module.exports = MapNode;

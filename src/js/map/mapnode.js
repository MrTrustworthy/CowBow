"use strict";

class MapNode {

    constructor(point, passable) {
        this.point = point;
        this.passable = passable || false;

        this.__locked = false;
    }

    lock() {
        if (this.__locked) throw new RangeError("#Mapnode: Node is already locked!");
        this.__locked = true;
    }

    unlock() {
        this.__locked = false;
    }

    get locked() {
        return this.__locked;
    }

    toString() {
        return `(${this.point.x}:${this.point.y}) ${this.point.z.toString().substring(0, 3)} ${this.passable ? "o" : "x"}`;
    }

}

module.exports = MapNode;

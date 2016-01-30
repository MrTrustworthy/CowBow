"use strict";

class MapNode {

    constructor(point, height, passable){
        this.point = point;
        this.height = height;
        this.passable = passable;
    }

    toString(){
        return `(${this.point.x}:${this.point.y}) ${this.height.toString().substring(0,3)} ${this.passable ? "o" : "x"}`;
    }

}

module.exports = MapNode;
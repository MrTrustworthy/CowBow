"use strict";

let GameObject = require("../common/gameobject");


let RES = {
    "WOOD": 1,
    "STONE": 2
};

let default_properties = {
    res: "WOOD",
    amount: 10,
    fields: [
        {x: 20, y: 40},
        {x: 20, y: 41},
        {x: 21, y: 40},
        {x: 21, y: 41}
    ]
};


class Resource extends GameObject {

    constructor(properties) {

        super();

        properties = properties || default_properties;

        this.type = RES[properties.res];
        this.amount = properties.amount;
        this.fields = properties.fields;

        //this.model = this.generate_models();

    }

    generate_models() {

    }


    /**
     *
     * @param tool
     */
    work(tool) {

    }

}

module.exports = Resource;

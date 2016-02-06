"use strict";

class Inventory {


    constructor(capacity) {
        this.capacity = capacity || 10;
        this.__items = [];
    }

    /**
     * Adds the items
     * @param items
     * @returns {boolean} whether it's still possible to carry more
     */
    add(items) {

        items = Array.isArray(items) ? items : [items];

        if(this.__items.length >= this.capacity){

            return false;

        } if (items.length + this.__items.length >= this.capacity) {

            let to_add = items.slice(0, this.capacity - this.__items.length + 1);

            this.__items.push(...to_add);

            return false;

        } else {

            this.__items.push(...items);

            return true;
        }

    }


}

module.exports = Inventory;

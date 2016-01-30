"use strict";

var listSymbol = Symbol();

/**
 * A simple 2d-list class
 *
 * TODO: maybe invert rows/cols in the data structure because we have to query rows more often
 * and it's currently more expensive
 */
class List2D {

    /**
     * initializes an empty 2d list with null-values
     * @param width: first value, akin to X in a screen coordinate system
     * @param length: second value, akin to Y in a screen coordinate system
     */
    constructor(width, length) {

        this.width = this.columns = width || 1;
        this.length = this.rows = length || this.width;

        let col_array = new Array(this.length);
        col_array.fill(null);

        this[listSymbol] = [];
        for (let i = 0; i < this.width; i++) {
            this[listSymbol][i] = col_array.slice(0);
        }

    }

    get(x, y) {

        return this[listSymbol][x][y];
    }

    /**
     * returns all surrounding points of a point x:y
     * @param x
     * @param y
     */
    get_surrounding(x, y) {

        let list = [];

        for (let xi = x - 1; xi <= x + 1; xi++) {
            for (let yi = y - 1; yi <= y + 1; yi++) {

                if (xi === x && yi === y) continue;
                if (xi < 0 || xi >= this.width || yi < 0 || yi >= this.length) continue;

                let elem = this.get(xi, yi);
                if(!elem) debugger;
                list.push(elem);

            }
        }
        return list;
    }

    set(x, y, value) {
        return this[listSymbol][x][y] = value;
    }

    /**
     * foreach goes from top-left to bottom-right
     * @param callback
     */
    for_each(callback) {
        for (let i = 0; i < this.rows; i++) {
            this.get_row(i).forEach((elem, j) => callback(elem, j, i));
        }
    }


    get_row(index) {
        return this[listSymbol].map(sublist => sublist[index]);
    }

    get_col(index) {
        return this[listSymbol][index].slice(0);
    }


    /**
     * prints the list from top-left to bottom-right;
     */
    print() {
        let output = "";
        let current_row = 0;
        this.for_each(function (elem, x, y) {
            if (y > current_row) output += "\n";
            output += " | " + String(elem) + " | ";
            current_row = y;
        });
        console.log(output);
    }


}

module.exports = List2D;
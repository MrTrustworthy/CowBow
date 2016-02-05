"use strict";

class MapError extends Error{

    constructor(...args){
        super(args)
    }

}

class PathError extends Error{

    constructor(...args){
        super(args)
    }

}


module.exports = {
    MapError: MapError,
    PathError: PathError
};

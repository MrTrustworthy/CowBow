"use strict";

// just for fun; need a git-hook or something that throws errors if it sees "getownpropertysymbols"
var meshSymbol = Symbol();

/**
 * Parent class for all Gameobjects which guarantees availability of common gameobject-properties like meshes
 */
class GameObject {

    /**
     * we __NEED__ to call this in all subclasses!
     */
    constructor(){

    }


    /**
     * returns the mesh if asked for it
     * @returns {*}
     */
    get mesh(){
        return this[meshSymbol];
    }

    /**
     * make sure we can not overwrite the mesh
     * @param mesh
     */
    set mesh(mesh){
        if (this[meshSymbol]) throw new ReferenceError("Can't overwrite existing meshes!");
        this[meshSymbol] = mesh;
    }

}

module.exports = GameObject;
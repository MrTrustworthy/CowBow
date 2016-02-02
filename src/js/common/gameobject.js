"use strict";

var THREE = require("../../lib/three");

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
        THREE.EventDispatcher.prototype.apply(this);

    }

    /**
     * Overwrite!
     */
    progress(){

    }

    /**
     * returns the mesh if asked for it
     * @returns {*}
     */
    get mesh(){
        if (this[meshSymbol]) return this[meshSymbol];
        else{
            let geometry = new THREE.BoxGeometry(1, 1, 1);
            let material = new THREE.MeshLambertMaterial({color: 0xffffff});
            return new THREE.Mesh(geometry, material);
        }
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

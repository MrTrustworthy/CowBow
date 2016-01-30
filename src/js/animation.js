"use strict";

var THREE = require("../lib/three");

/**
 * This class is responsible for the renderer, scene etc.
 * It basically handles all the animation-related stuff
 *
 * TODO: Handle window resize here
 */
class Animation {

    /**
     * Creates new Animation-Object and sets up the surrounding (everything but the bodies themselves)
     */
    constructor() {

        THREE.EventDispatcher.prototype.apply(this);
        this.canvas = document.getElementById("main_canvas");


        this.context = this.canvas.getContext("webgl");

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            context: this.context,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.scene = new THREE.Scene();


        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.x = 50;
        this.camera.position.y = 50;
        this.camera.position.z = 50;


        var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 0, 6, 12 );
        this.scene.add( directionalLight );


    }


    /**
     * Adds an element to the scene
     *
     * @param obj
     */
    add_element(obj) {
        this.scene.add(obj.mesh);
    }


    /**
     * Starts the animation
     */
    start() {
        // recursive call
        requestAnimationFrame(this.start.bind(this));
        // this way we can hook tweens and stuff like that on each frame
        this.dispatchEvent({type: "scene_updated"});
        this.renderer.render(this.scene, this.camera);
    }



}

module.exports = Animation;
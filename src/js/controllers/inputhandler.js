"use strict";

var THREE = require("../../lib/three");

class InputHandler {

    constructor(camera, scene){

        THREE.EventDispatcher.call(this);

        this.camera = camera;
        this.scene = scene;

        window.onkeydown = this.handle_keydown.bind(this);
        window.onmousewheel = this.handle_mousewheel.bind(this);
    }




    handle_mousewheel(evt){
        this.camera.position.z += evt.wheelDelta > 0 ? -1 : 1;
    }

    handle_keydown(evt){
        let keybinds = {
            D: [1, 0],
            S: [0, -1],
            A:  [-1, 0],
            W: [0, 1]
        };

        let key = evt.code.substring(3);

        if(!keybinds[key]){
            return;
        }

        let delta = keybinds[key];

        this.camera.position.x += delta[0] * 4;
        this.camera.position.y += delta[1] * 4;

    }





}

module.exports = InputHandler;

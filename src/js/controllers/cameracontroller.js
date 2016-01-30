"use strict";

class CameraController {

    constructor(camera){
        this.camera = camera;

        this.load_hooks();
    }

    load_hooks(){


        let keybinds = {
            D: [1, 0],
            S: [0, -1],
            A:  [-1, 0],
            W: [0, 1]
        };

        window.onkeydown = function(evt){

            let key = evt.code.substring(3);

            if(!keybinds[key]){
                return;
            }

            let delta = keybinds[key];

            this.camera.position.x += delta[0] * 4;
            this.camera.position.y += delta[1] * 4;

        }.bind(this);

        window.onmousewheel = function(evt){

            let x = evt.wheelDelta > 0 ? -1 : 1;
            this.camera.position.z += x;

        }.bind(this);

    }

}

module.exports = CameraController;
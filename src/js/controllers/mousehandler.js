"use strict";

let THREE = require("../../lib/three");
let Evented = require("../../lib/mt-event");


class MouseHandler {


    /**
     *
     * @param animation
     * @param map
     */
    constructor(animation, map, actors) {

        Evented.makeEvented(this);

        this.click_delay = 0.2 * 1000;

        this.animation = animation;
        this.map = map;
        this.actors = actors;

        this.mousedown = false;
        this.mousedown_evt = null;
        this.mousedown_obj_buffer = null;
        this.mousedown_time = null;


        // special three js mesh that we use to display selection
        this.selection_model = this.load_selection_model();
        this.animation.scene.add(this.selection_model);

        this.load_hooks();

    }

    /**
     *
     */
    load_hooks() {

        window.onmousedown = this.onmousedown.bind(this);
        window.onmouseup = this.onmouseup.bind(this);
        window.oncontextmenu = this.oncontextmenu.bind(this);
        window.onmousemove = this.onmousemove.bind(this);

    }


    /**
     *
     * @param evt
     */
    onmousedown(evt) {
        // in the case of rightclicks:
        if (evt.button !== 0) return;

        this.mousedown = true;
        this.mousedown_evt = evt;
        this.mousedown_time = Date.now();
    }

    /**
     *
     * @param evt
     */
    onmousemove(evt) {

        if (!this.mousedown || this.mousedown_time + this.click_delay > Date.now()) return;

        let geometry = this.selection_model.geometry;

        if (!this.mousedown_obj_buffer) this.mousedown_obj_buffer = this._get_object(this.mousedown_evt);


        let p1 = this.mousedown_obj_buffer.point;
        let p4 = this._get_object(evt).point;
        var p2, p3;

        // need to switch vertices in top-right and bottom-left quadrants
        // so we can make sure that faces always face upwards

        // if in top-left or bottom-right quadrant:
        if ((p4.x > p1.x && p4.y < p1.y) || (p4.x < p1.x && p4.y > p1.y)) {
            p2 = p1.clone();
            p2.x = p4.x;
            p3 = p1.clone();
            p3.y = p4.y;
        } else {
            p3 = p1.clone();
            p3.x = p4.x;
            p2 = p1.clone();
            p2.y = p4.y;
        }

        [p1, p2, p3, p4].forEach((p, i) => {
            geometry.vertices[i].x = p.x;
            geometry.vertices[i].y = p.y;
            geometry.vertices[i].z = 5;
        });

        geometry.verticesNeedUpdate = true;

        this.selection_model.visible = true;


    }


    /**
     *
     * @param evt
     */
    onmouseup(evt) {

        // in the case of rightclicks:
        if (evt.button !== 0) return;

        if (this.mousedown_time + this.click_delay > Date.now()) {
            this.emit("click", this._get_object(evt));
        } else {
            this._calculate_selection();
        }

        // cleanup the mess
        this.mousedown = false;
        this.mousedown_evt = null;
        this.mousedown_time = null;
        this.mousedown_obj_buffer = null;
        this.selection_model.visible = false;

    }


    /**
     *
     * @param evt
     * @returns {boolean}
     */
    oncontextmenu(evt) {
        this.emit("rightclick", this._get_object(evt));
        return false;
    }


    /**
     *
     * @param evt
     * @returns {*}
     * @private
     */
    _get_object(evt) {
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();

        mouse.x = ( evt.clientX / this.animation.renderer.domElement.width ) * 2 - 1;
        mouse.y = -( evt.clientY / this.animation.renderer.domElement.height ) * 2 + 1;
        raycaster.setFromCamera(mouse, this.animation.camera);

        return raycaster.intersectObjects(this.animation.scene.children)[0];
    }


    /**
     * Calculates all gameobjects inside of the current selection
     * @private
     */
    _calculate_selection() {

        this.selection_model.geometry.vertices.forEach(v => v.z = 0);

        let bounding_box_height = 100; // FIXME: should be safe
        let bbox = new THREE.Box3().setFromObject(this.selection_model);

        // calculate all intersecting actors
        let hits = this.actors.filter(x => {
            let b = new THREE.Box3().setFromObject(x.mesh);
            // change the actors bounding boxes to go pretty high in the Z-axis
            // so the selection model will definitely intersect it
            b.expandByVector(new THREE.Vector3(0, 0, bounding_box_height));

            return bbox.isIntersectionBox(b);
        });

        this.emit("selection", hits);

    }


    /**
     *
     * @returns {THREE.Mesh}
     */
    load_selection_model() {

        let geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
        geometry.faces.push(new THREE.Face3(0, 2, 1), new THREE.Face3(2, 3, 1));


        let material = new THREE.MeshLambertMaterial({color: 0xff0000});
        material.transparent = true;
        material.opacity = 0.5;

        let mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;

        window.m = mesh;
        return mesh;
    }
}

module.exports = MouseHandler;

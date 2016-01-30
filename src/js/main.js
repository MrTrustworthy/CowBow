"use strict";

var Animation = require("./animation");
var Map = require("./map/map");
var CameraController = require("./controllers/cameracontroller");






var a = new Animation();

var map = new Map();

a.add_element(map);


var c = new CameraController(a.camera);

a.start();




console.log("loaded");
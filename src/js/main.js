"use strict";

let Animation = require("./animation");
let Map = require("./map/map");
let MainController = require("./controllers/maincontroller");
let Actor = require("./actor/actor");





let animation = new Animation();

let map = new Map();
animation.add_element(map);



let actors = [new Actor(map.structure.get(20, 20))];
animation.add_element(actors[0]);

let c = new MainController(animation, map, actors);
animation.start();




console.log("loaded");

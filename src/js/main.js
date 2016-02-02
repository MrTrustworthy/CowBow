"use strict";

let Animation = require("./animation");
let Map = require("./map/map");
let MainController = require("./controllers/maincontroller");
let Actor = require("./actor/actor");
let Resource = require("./resource/resource");




let animation = new Animation();

let map = new Map();

let resource = new Resource();
map.add_resource(resource);





animation.load_map(map);



let actors = [new Actor(map.structure.get(20, 20)), new Actor(map.structure.get(30, 20))];
animation.add_element(actors[0]);
animation.add_element(actors[1]);



let c = new MainController(animation, map, actors);
animation.start();




console.log("loaded");

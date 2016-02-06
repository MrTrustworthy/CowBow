"use strict";

let TaskList = require("../common/tasklist").TaskList;
let Task = require("../common/tasklist").Task;
let Deferred = require("../../lib/mt-promise");
let MapError = require("../common/errors").MapError;
let PathError = require("../common/errors").PathError;
let Resource = require("../resource/resource");
let ActorTasks = require("./tasks");


/**
 * Helper class for actor movement
 */
class Taskmaster {


    /**
     *
     * @param actor
     * @param target {MapNode}
     * @param map
     */
    static send(actor, target, map) {

        console.log("#Obj:", target.__lock_object);

        if (!target.passable) {

            // can't do anything there, abort

            //noinspection UnnecessaryReturnStatementJS
            return

        } else if (!target.object) {

            // if no object is there, just move the actor

            Taskmaster.move(actor, target, map);

        } else if (target.object instanceof Resource) {

            // if an object is on this field

            Taskmaster.occupy(actor, target, map);

        }

    }


    /**
     *
     * @param actor
     * @param target
     * @param map
     */
    static occupy(actor, target, map) {

        // step 1: find best field to go to

        let surrounding = map.structure.get_surrounding(target.point.x, target.point.y);

        let possible_nodes = surrounding.filter(node => node.passable && !node.locked);

        // abort if target can't be reached

        if(possible_nodes.length === 0){

            console.warn("#Taskmaster: Can't find a way to reach this resource, doing nothing");

            return;

        }

        // sort to find closest

        possible_nodes.sort((a, b) => a.point.distance_to(actor.node.point) - b.point.distance_to(actor.node.point));

        let move_target = possible_nodes[0];


        // create tasks to move actor there

        actor.task_list.clear().then(()=> {

            let nodes = Taskmaster._get_clean_path(actor, move_target, map);

            // create a task for each node-to-node move action required

            let move_tasks = nodes.map(node => {

                return new Task(ActorTasks.move_task, [node], actor);

            });

            actor.task_list.add_tasks(move_tasks);


            // create task for resource gathering

            let gather_task =  new Task(ActorTasks.gather_task, target.object, actor);

            actor.task_list.add_tasks(gather_task);

            // start running the tasklist. if it fails, try again
            // TODO FIXME need some way to limit the re-trys
            // currently, it's only working because a new path can't be calculated so it's aborted the 2nd time

            actor.task_list.start().then(
                () => {
                },
                () => setTimeout(Taskmaster.occupy.bind(null, actor, target, map), 100)
            );

        });

    }


    /**
     *
     * @param actor
     * @param target
     * @param map
     */
    static move(actor, target, map) {

        let tasks,
            nodes;

        actor.task_list.clear().then(()=> {

            nodes = Taskmaster._get_clean_path(actor, target, map);

            // create a task for each node-to-node move action required

            tasks = nodes.map(node => {

                return new Task(ActorTasks.move_task, [node], actor);

            });

            actor.task_list.add_tasks(tasks);

            // start running the tasklist. if it fails, try again
            // TODO FIXME need some way to limit the re-trys
            // currently, it's only working because a new path can't be calculated so it's aborted the 2nd time

            actor.task_list.start().then(
                () => {
                },
                () => setTimeout(Taskmaster.move.bind(null, actor, target, map), 100)
            );
        });


    }

    /**
     *
     * @param actor
     * @param target
     * @param map
     * @returns {*}
     * @private
     */
    static _get_clean_path(actor, target, map) {

        let nodes;

        try {

            // get the path

            nodes = map.get_path(actor.node.point, target.point);

            nodes = Array.from(nodes).slice(1);

            // remove the starting node

            nodes.shift();

        } catch (e) {

            // abort if the target field is already locked or generally unpassable
            // because honestly, this will happen often

            if (e instanceof PathError) {

                console.info("#Taskmaster: Can't find path", e);

                return [];

            } else {

                // something unexpected happened, in that case

                throw e;

            }
        }

        return nodes;
    }




}

module.exports = Taskmaster;

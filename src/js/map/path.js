"use strict";


/**
 * Helper class to encapsulate the distance/heuristics values
 */
class PathNode {

    constructor(node, distance, heuristics, parent) {
        this.node = node;
        this.d = distance;
        this.h = heuristics;
        this.parent = parent;
    }
}


/**
 * Creates a path between two points based on a given structure
 */
class Path {

    /**
     * Creates a path between two points and makes the path-instance an iterable
     *
     * @param from
     * @param to
     * @param structure
     */
    constructor(from, to, structure) {

        // sanitize input
        from = structure.get(from.x, from.y);
        to = structure.get(to.x, to.y);


        // throw error if impossible
        if(!from.passable || !to.passable){
            throw new EvalError("#Path: Can't determine a path because either origin or target isn't passable");
        }



        let current,
            surrounding = [],
            candidates = [],
            path = [],
            known = [];


        // before the first iteration, we'll set the current point to the start node
        current = new PathNode(from, 0, from.point.distance_to(to.point), null);

        while (!current.node.point.equals(to.point)) {

            // determine surrounding nodes
            surrounding = structure.get_surrounding(current.node.point.x, current.node.point.y);

            // filter alread known ones
            surrounding = surrounding.filter(elem => known.indexOf(elem) === -1);
            // add the new ones to the known-list
            known = known.concat(surrounding);
            // filter blocked ones
            surrounding = surrounding.filter(elem => elem.passable && !elem.locked);

            // determine distances and turn them into PathNodes
            // concat with previous candidates to we'll more easily be able to switch paths if needed
            candidates = candidates.concat(
                surrounding.map(elem => new PathNode(
                    elem,
                    current.d + current.node.point.distance_to(elem.point),
                    elem.point.distance_to(to.point),
                    current
                ))
            );

            // sort list so the lowest index has the best expected value
            candidates.sort((a, b) => (a.d + a.h) - (b.d + b.h));

            current = candidates.shift();

            if(!current) throw new EvalError("#Path: Can't find a path to the target!");
        }


        // go back to collect the chosen nodes
        while(current !== null){
            path.unshift(current.node);
            current = current.parent;
        }


        // make it iterable
        this[Symbol.iterator] = function* () {
            while (path.length > 0){
                yield path.shift();
            }
        }


    }


}


module.exports = Path;

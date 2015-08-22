"use strict";

var helpers = {};

helpers.getGlobalDisplacementAtPoint = function (x, y, rng) {
    return (rng.perlin2(-y / 1425, x / 1389) * 330.)
};

module.exports = helpers;

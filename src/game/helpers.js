"use strict";

var helpers = {};

helpers.getGlobalDisplacementAtPoint = function (x, y, rng) {
    return (rng.perlin2(-y / 1825, x / 1789) * 500.)
};

module.exports = helpers;

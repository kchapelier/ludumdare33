"use strict";

var collection = require('./../lib/objectCollection'),
    renderer = require('./renderer');

collection.on('add.player', function (element) {
    renderer.addToScene(element.group);
});

collection.on('remove.player', function (element) {
    renderer.addToScene(element.group);
});

collection.on('add.playerShot', function (element) {
    renderer.addToScene(element.group);
});

collection.on('remove.playerShot', function (element) {
    renderer.removeFromScene(element.group);
});

collection.on('add.enemy', function (element) {
    renderer.addToScene(element.group);
});

collection.on('remove.enemy', function (element) {
    renderer.removeFromScene(element.group);
});

module.exports = collection;

"use strict";

var collection = require('./../lib/objectCollection'),
    renderer = require('./renderer');

collection.on('add.player', function (element) {
    renderer.addElement(element.sprite);
});

collection.on('remove.player', function (element) {
    renderer.removeElement(element.sprite);
});

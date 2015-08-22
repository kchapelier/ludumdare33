"use strict";

var GameLoop = require('migl-gameloop'),
    input = require('./input'),
    renderer = require('./renderer'),
    sound = require('./sound'),
    objectCollection = require('./objectCollection'),
    textureCollection = require('./textureCollection');

var loadSounds = function loadSounds () {};

var loadTextures = function loadTextures () {};

var init = function init () {

    renderer.infectDom('game');


    var loop = new GameLoop();


    console.log(input);

    loop.update = function (dt) {
        input.update(dt);

    };

    loop.postUpdate = function (dt) {

    };

    loop.render = function (dt) {
        renderer.render(dt);
    };

    loop.start();
};

var game = {
    initialize: function () {
        loadSounds();
        loadTextures();
        init();
    }
};

module.exports = game;

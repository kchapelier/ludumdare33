"use strict";

var THREE = require('three'),
    GameLoop = require('migl-gameloop'),
    rng = require('migl-rng').create((new Date()).toISOString()),
    Ground = require('./entities/ground'),
    input = require('./input'),
    renderer = require('./renderer');

var loadSounds = function loadSounds () {};

var loadTextures = function loadTextures () {};

var init = function init () {

    var pointLight = new THREE.PointLight(0x777777, 1, 500);
    pointLight.position.y = 200;
    renderer.infectDom('game');
    renderer.addToScene(new THREE.HemisphereLight(0x777777, 0x222222, 1.5));
    renderer.addToScene(pointLight);
    var ground = new Ground(rng);
    ground.group.position.y = - 1000;

    for (var x = -3; x <= 3; x++) {
        for (var y = -3; y <= 3; y++) {
            ground.addTile(x,y);
        }
    }

    var loop = new GameLoop();
    renderer.addToScene(ground.group);

    renderer.lockCamera(ground.group);

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

"use strict";

var THREE = require('three'),
    GameLoop = require('migl-gameloop'),
    rng = require('migl-rng').create((new Date()).toISOString()),
    Ground = require('./entities/ground'),
    Player = require('./entities/player'),
    Nest = require('./entities/nest'),
    input = require('./input'),
    renderer = require('./renderer'),
    helpers = require('./helpers');

var loadSounds = function loadSounds () {};

var loadTextures = function loadTextures () {};

var init = function init () {

    var player = new Player();

    player.position.y = helpers.getGlobalDisplacementAtPoint(0, 0, rng);;


    var nest = new Nest();
    nest.position.x = 0;
    nest.position.z = 200;
    nest.position.y = helpers.getGlobalDisplacementAtPoint(0, 200, rng);

    renderer.infectDom('game');
    renderer.addToScene(new THREE.HemisphereLight(0x777777, 0x222222, 1.1));
    renderer.addToScene(nest.group);

    var ground = new Ground(rng);

    var waterGeometry = new THREE.PlaneGeometry();

    for (var x = -10; x <= 10; x++) {
        for (var y = -3; y <= 3; y++) {
            ground.addTile(x,y);
        }
    }



    var loop = new GameLoop();
    renderer.addToScene(ground.group);
    renderer.addToScene(player.group);

    renderer.lockCamera(player.group);

    loop.update = function (dt) {
        input.update(dt);
        player.update(dt);
        nest.update(dt);
    };

    loop.postUpdate = function (dt) {
        player.postUpdate(dt);
        player.position.y = 225 + helpers.getGlobalDisplacementAtPoint(player.position.x, player.position.z, rng);
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

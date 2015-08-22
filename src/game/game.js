"use strict";

var THREE = require('three'),
    GameLoop = require('migl-gameloop'),
    rng = require('migl-rng').create((new Date()).toISOString()),
    Ground = require('./entities/ground'),
    Player = require('./entities/player'),
    Enemy = require('./entities/enemy'),
    Nest = require('./entities/nest'),
    input = require('./input'),
    renderer = require('./renderer'),
    objectCollection = require('./objectCollection'),
    helpers = require('./helpers');

var loadSounds = function loadSounds () {};

var loadTextures = function loadTextures () {};

var rayCaster = new THREE.Raycaster();

var init = function init () {

    var player = new Player(rng);

    player.position.y = helpers.getGlobalDisplacementAtPoint(0, 0, rng);;

    var playerShots = objectCollection.getArray('playerShot'),
        enemies = objectCollection.getArray('enemy')

    var nest = new Nest();
    nest.position.x = 0;
    nest.position.z = 200;
    nest.position.y = helpers.getGlobalDisplacementAtPoint(0, 200, rng);

    renderer.infectDom('game');
    renderer.addToScene(new THREE.HemisphereLight(0x777777, 0x222222, 1.1));
    renderer.addToScene(nest.group);

    var ground = new Ground(rng);

    var waterGeometry = new THREE.PlaneGeometry();

    for (var x = -5; x <= 5; x++) {
        for (var y = -5; y <= 5; y++) {
            ground.addTile(x,y);
        }
    }

    for (var i = 0; i < 100; i++) {
        var x = (Math.random() - 0.5) * 2 * 5000,
            y = (Math.random() - 0.5) * 2 * 3000;

        var enemy = new Enemy();

        enemy.position.x = x;
        enemy.position.z = y;
        enemy.position.y = helpers.getGlobalDisplacementAtPoint(x, y, rng);

        objectCollection.add('enemy', enemy);
    }



    var loop = new GameLoop();
    renderer.addToScene(ground.group);
    renderer.addToScene(player.group);

    renderer.lockCamera(player.group);

    loop.update = function (dt) {
        input.update(dt);
        player.update(dt);
        nest.update(dt);

        var collisionsForPlayerShots = enemies.map(function (enemy) {
            return enemy.group;
        });

        collisionsForPlayerShots.push(ground.group);


        var toRemove = [];
        for (var i = 0; i < playerShots.length; i++) {
            rayCaster.ray.origin.copy(playerShots[i].position);
            rayCaster.ray.direction.copy(playerShots[i].direction).normalize();
            rayCaster.near = 0;
            rayCaster.far = playerShots[i].direction.length() * dt;

            var collisions = rayCaster.intersectObjects(collisionsForPlayerShots, true);

            if (collisions.length) {
                if (collisions[0].object.userData.element) {
                    var enemy = collisions[0].object.userData.element;

                    enemy.takeDamage(10);
                    renderer.shakeCamera(10, 15);
                } else {
                    console.log('ground !');
                    toRemove.push(playerShots[i]);
                }
            }

            playerShots[i].update(dt, rng);

            if (playerShots[i].isDead()) {
                toRemove.push(playerShots[i]);
            }
        }

        for (var i = 0; i < toRemove.length; i++) {
            objectCollection.remove('playerShot', toRemove[i]);
        }

        var toRemove = [];
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].update(dt, rng);

            if (enemies[i].isDead()) {
                toRemove.push(enemies[i]);
            }
        }

        for (var i = 0; i < toRemove.length; i++) {
            objectCollection.remove('enemy', toRemove[i]);
        }
    };

    loop.postUpdate = function (dt) {
        player.postUpdate(dt);

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

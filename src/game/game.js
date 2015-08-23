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
    sound = require('./sound'),
    objectCollection = require('./objectCollection'),
    helpers = require('./helpers');

var loadSounds = function loadSounds () {
    sound.load('music', 'music/chromad-ozone', 1, true, true);
    sound.load('hit01', 'effects/chord01', 0.7, false, false);
    sound.load('hit02', 'effects/chord02', 0.7, false, false);
    sound.load('hit03', 'effects/clay01', 0.7, false, false);
    sound.load('hit04', 'effects/clay02', 0.7, false, false);
    sound.load('wood01', 'effects/wood01', 0.3, false, false);
    sound.load('wood02', 'effects/wood02', 0.3, false, false);
    sound.load('wood03', 'effects/wood03', 0.3, false, false);
    sound.load('wood04', 'effects/wood04', 0.3, false, false);
};

var loadTextures = function loadTextures () {};

var rayCaster = new THREE.Raycaster();

var init = function init () {

    var player = new Player(rng);

    player.position.y = helpers.getGlobalDisplacementAtPoint(0, 0, rng);

    var playerShots = objectCollection.getArray('playerShot'),
        enemyShots = objectCollection.getArray('enemyShot'),
        enemies = objectCollection.getArray('enemy');

    var nest = new Nest();
    nest.position.x = 0;
    nest.position.z = 0;
    nest.position.y = helpers.getGlobalDisplacementAtPoint(0, 0, rng);

    renderer.infectDom('game');
    renderer.addToScene(new THREE.HemisphereLight(0x303030, 0x202020, 1.05));
    renderer.addToScene(nest.group);

    var ground = new Ground(rng);

    var waterGeometry = new THREE.PlaneGeometry();

    var mapSize = 8;

    for (var x = -mapSize; x <= mapSize; x++) {
        for (var y = -mapSize; y <= mapSize; y++) {
            ground.addTile(
                x,
                y,
                x === -mapSize,
                x === mapSize,
                y === -mapSize,
                y === mapSize
            );
        }
    }

    for (var i = 0; i < 10; i++) {
        var x = (Math.random() - 0.5) * 2 * 8000,
            y = (Math.random() - 0.5) * 2 * 8000;

        var enemy = new Enemy();

        enemy.position.x = x;
        enemy.position.z = y;
        enemy.position.y = helpers.getGlobalDisplacementAtPoint(x, y, rng);

        objectCollection.add('enemy', enemy);
    }

    var musicPlaying = sound.play('music');

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

        var collisionsForEnemyShots = [ground.group, player.group];

        var toRemove = [];
        for (var i = 0; i < playerShots.length; i++) {
            rayCaster.ray.origin.copy(playerShots[i].position);
            rayCaster.ray.direction.copy(playerShots[i].direction).normalize();
            rayCaster.near = 0;
            rayCaster.far = playerShots[i].direction.length() * dt;

            var collisions = rayCaster.intersectObjects(collisionsForPlayerShots, true);

            if (collisions.length) {
                if (collisions[0].object.userData.enemy) {
                    var collidedEnemy = collisions[0].object.userData.enemy;

                    collidedEnemy.takeDamage(1);
                    collidedEnemy.applyKnockback(playerShots[i].direction, 25);
                    sound.play(Math.random() > 0.5 ? 'wood03' : 'wood04');
                } else {
                    //console.log('ground !');
                }

                toRemove.push(playerShots[i]);
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
        for (var i = 0; i < enemyShots.length; i++) {
            rayCaster.ray.origin.copy(enemyShots[i].position);
            rayCaster.ray.direction.copy(enemyShots[i].direction).normalize();
            rayCaster.near = 0;
            rayCaster.far = enemyShots[i].direction.length() * dt;

            var collisions = rayCaster.intersectObjects(collisionsForEnemyShots, true);

            if (collisions.length) {
                if (collisions[0].object.userData.player) {
                    var collidedPlayer = collisions[0].object.userData.player;
                    renderer.shakeCamera(10, 15);
                    sound.play('hit02');
                } else {
                    //console.log('ground !');
                }

                toRemove.push(enemyShots[i]);
            }

            enemyShots[i].update(dt, rng);

            if (enemyShots[i].isDead()) {
                toRemove.push(enemyShots[i]);
            }
        }

        for (var i = 0; i < toRemove.length; i++) {
            objectCollection.remove('enemyShot', toRemove[i]);
        }

        var toRemove = [];
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].update(dt, rng, player);

            if (enemies[i].isDead()) {
                toRemove.push(enemies[i]);
            }
        }

        for (var i = 0; i < toRemove.length; i++) {
            objectCollection.remove('enemy', toRemove[i]);
            sound.play('hit01');
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

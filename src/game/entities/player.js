"use strict";

var THREE = require('three'),
    PlayerShot = require('./playerShot'),
    objectCollection = require('./../objectCollection'),
    enemies = objectCollection.getArray('enemy'),
    input = require('./../input'),
    helpers = require('./../helpers');

var leftCommand = input.commands.left,
    rightCommand = input.commands.right,
    upCommand = input.commands.up,
    downCommand = input.commands.down,
    actionCommand = input.commands.action,
    rollCommand = input.commands.roll;

var Player = function (rng) {
    this.life = 3;
    this.rng = rng;
    this.timer = 0;
    this.group = new THREE.Group();

    //shortcuts for ease of use
    this.position = this.group.position;
    this.rotation = this.group.rotation;

    this.direction = new THREE.Vector3(0,0,-3);
    this.intentAngle = 0;
    this.moveAngle = 0;

    this.fireTimer = 0;
    this.stopTimer = 0;
    this.rollingTimer = 0;
    this.rolling = false;
    this.rollingDirection = 0;

    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(100, 100, 100),
        new THREE.MeshNormalMaterial()
    );

    cube.userData.player = this;

    this.group.add(cube);

    this.light = new THREE.PointLight(0x882200, 1.3, 850);
    this.group.add(this.light);
};

Player.prototype.handleInputs = function (dt) {
    this.firing = actionCommand.active;

    if (this.rollingTimer <= 0) {
        this.rolling = this.stopTimer <= 0 && (rollCommand.active && (leftCommand.active || rightCommand.active));

        if (this.rolling) {
            this.rollingDirection = leftCommand.active ? -1 : 1;
            this.rollingTimer = 400;
            //stopping the rotation on y
            this.moveAngle = this.moveAngle * 0.5;
            //keeping the previous speed seems more usable
            //this.decelerating = false;
            //this.accelerating = false;
        } else {
            var newMoveAngle;

            if (leftCommand.active) {
                newMoveAngle = leftCommand.value * dt / 200;
            } else if (rightCommand.active) {
                newMoveAngle = -rightCommand.value * dt / 200;
            } else {
                newMoveAngle = 0;
            }

            this.moveAngle = this.moveAngle * 0.85 + newMoveAngle * 0.15;

            this.decelerating = false;
            this.accelerating = false;

            if (upCommand.active) {
                this.accelerating = true;
            } else if (downCommand.active) {
                this.decelerating = true;
            }
        }
    } else {
        this.rollingTimer-= dt;
    }
};

var xAxis = new THREE.Vector3(1, 0, 0),
    yAxis = new THREE.Vector3(0, 1, 0),
    zAxis = new THREE.Vector3(0, 0, 1);

Player.prototype.move = function (dt) {
    if (this.stopTimer > 0) {
        this.stopTimer -= dt;
    } else if (this.rolling) {
        var vectorRoll = new THREE.Vector3(this.rollingDirection * 2 * dt, 0, 0);
        vectorRoll.applyMatrix4(new THREE.Matrix4().makeRotationY(this.intentAngle));
        this.position.add(vectorRoll);

        if (this.rollingTimer <= 0) {
            this.stopTimer = 250;
        }
    }

    /* */
    var speed = 9;

    if (this.accelerating) {
        speed+=6.3;
    } else if(this.decelerating) {
        speed-=14;
    }
    /*/

    var speed = 0;

    if (this.accelerating) {
        speed+=12;
    } else if(this.decelerating) {
        speed-=12;
    }
    /* */

    this.intentAngle = this.intentAngle + this.moveAngle;

    this.direction.set(0,0,-1);
    this.direction.applyAxisAngle(yAxis, this.intentAngle);
    this.direction.multiplyScalar(speed);

    this.position.add(this.direction);

    this.rotation.x = 0;
    this.rotation.y = (this.intentAngle);
    this.rotation.z = (Math.cos(this.timer / 3037) * 0.02);

    if (this.rolling) {
        this.rotation.z = Math.pow(Math.abs(Math.sin((this.rollingTimer - 400) / 400 * Math.PI)), 0.4) * this.rollingDirection / -4.; // yeah, seems about right.
    } else {
        this.rotation.z += this.moveAngle * 2.;
    }

    this.position.y = Math.sin(this.timer / 1537) * 13 + 232 + helpers.getGlobalDisplacementAtPoint(this.position.x, this.position.z, this.rng);

};

Player.prototype.fire = function (dt) {
    var self = this;

    if (this.firing && this.fireTimer <= 0) {

        // autotargeting, find the closest enemy relative to the aim

        var minWeight = 0.5,
            target = null;

        enemies.forEach(function (enemy) {
            var distance,
                angle;

            distance = enemy.position.distanceTo(self.position);

            if (distance < 4000) {
                var vectorToEnemy = enemy.position.clone().sub(self.position),
                    normalShotDirection = new THREE.Vector3(0,0,-1).applyMatrix4(new THREE.Matrix4().makeRotationY(self.intentAngle));

                var angleDifference = vectorToEnemy.angleTo(normalShotDirection);

                if (angleDifference < 1) {
                    var weight = angleDifference + distance / 8000;

                    if (weight < minWeight) {
                        minWeight = weight;
                        target = enemy;
                    }
                }
            }
        });

        var shot = new PlayerShot();

        shot.position.copy(this.position);
        shot.position.y -= 40;

        if (target) {
            shot.direction.copy(target.position).sub(shot.position).setLength(4)
        } else {
            shot.direction.set(0,0.05,-4);
            shot.direction.applyMatrix4(new THREE.Matrix4().makeRotationY(this.intentAngle));
        }

        objectCollection.add('playerShot', shot);

        this.fireTimer = 120;
    }

    this.fireTimer -= dt;
};

Player.prototype.update = function (dt) {
    this.timer += dt;
    this.handleInputs(dt);
    this.fire(dt);
    this.move(dt);
    this.light.intensity = 0.5 + Math.pow((1 + Math.cos(this.timer / 400)) / 2, 3) * 6.5;

    //quick hack

    if (this.position.x > 8300) {
        this.position.x = 8300;
    }

    if (this.position.x < -8300) {
        this.position.x = -8300;
    }

    if (this.position.z > 8300) {
        this.position.z = 8300;
    }

    if (this.position.z < -8300) {
        this.position.z = -8300;
    }
};

Player.prototype.postUpdate = function (dt) {

};

Player.prototype.isDead = function (dt) {
    return this.life < 0;
};

module.exports = Player;

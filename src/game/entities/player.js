"use strict";

var THREE = require('three'),
    input = require('./../input');

var leftCommand = input.commands.left,
    rightCommand = input.commands.right,
    upCommand = input.commands.up,
    downCommand = input.commands.down;

var Player = function () {
    this.timer = 0;
    this.group = new THREE.Group();

    //shortcuts for ease of use
    this.position = this.group.position;
    this.rotation = this.group.rotation;

    this.direction = new THREE.Vector3(0,0,-3);
    this.intentAngle = 0;

    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.MeshNormalMaterial()
    );

    this.group.add(cube);

    this.light = new THREE.PointLight(0x882200, 1.3, 1000);
    this.group.add(this.light);
};

Player.prototype.handleInputs = function (dt) {
    if (leftCommand.active) {
        this.intentAngle+= leftCommand.value * dt / 200;
    } else if (rightCommand.active) {
        this.intentAngle+= -rightCommand.value * dt / 200;
    } else {
        //this.intentAngle = this.intentAngle * 0.85;
    }

    this.decelerating = false;
    this.accelerating = false;

    if (upCommand.active) {
        this.accelerating = true;
    } else if (downCommand.active) {
        this.decelerating = true;
    }
};

var yAxis = new THREE.Vector3(0, 1, 0);

Player.prototype.move = function (dt) {
    /*
    var speed = 9;

    if (this.accelerating) {
        speed+=5.5;
    } else if(this.decelerating) {
        speed-=12;
    }
    */

    var speed = 0;

    if (this.accelerating) {
        speed+=12;
    } else if(this.decelerating) {
        speed-=12;
    }

    this.direction.set(0,0,-1);
    this.direction.applyAxisAngle(yAxis, this.intentAngle);
    this.direction.multiplyScalar(speed);

    this.position.add(this.direction);

    this.rotation.x = 0;
    this.rotation.y = (this.intentAngle);
};

Player.prototype.update = function (dt) {
    this.timer += dt;
    this.handleInputs(dt);
    this.move(dt);
    this.light.intensity = 0.5 + Math.pow((1 + Math.cos(this.timer / 400)) / 2, 3) * 5.5;
};

Player.prototype.postUpdate = function (dt) {

};

module.exports = Player;

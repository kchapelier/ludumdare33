"use strict";

var THREE = require('three'),
    lerp = require('mathp/functions/lerp'),
    followNothing = 0,
    followOneTargetMode = 1;

var Camera = function (ratio, baseAngle, baseDistance) {
    THREE.PerspectiveCamera.call(this, 50, ratio, 10, 5000);

    this.baseAngle = baseAngle;
    this.angle = baseAngle;
    this.baseDistance = baseDistance;
    this.distance = baseDistance;

    this.mode = 0;

    this.target = null;

    this.targetAngle = null;
    this.currentPosition = 1;
    this.speed = new THREE.Vector3(0, 0, 0);
};

Camera.prototype = Object.create(THREE.PerspectiveCamera.prototype);
Camera.prototype.constructor = Camera;

Camera.prototype.baseAngle = null;
Camera.prototype.angle = null;
Camera.prototype.baseDistance = null;
Camera.prototype.distance = null;
Camera.prototype.speed = null;
Camera.prototype.offsetY = null;
Camera.prototype.offsetZ = null;

Camera.prototype.mode = null;
Camera.prototype.target = null;

Camera.prototype.targetAngle = 0;
Camera.prototype.currentPosition = 1;

Camera.prototype.calculateOffsets = function () {
    this.angle = this.baseAngle + Math.min(10, this.speed.z) / 500;
    this.distance = this.baseDistance + Math.min(50,  this.speed.z) * 1.5;

    this.fov = 60 + this.angle * 180 / Math.PI;

    this.offsetY = Math.sin(this.angle) * this.distance;
    this.offsetZ = Math.cos(this.angle) * this.distance;
    this.offsetX = this.speed.x * 3;
    this.rotation.y = -this.speed.x / 175;
    this.rotation.z = -this.speed.x / 400;

    this.updateProjectionMatrix();
};

Camera.prototype.stopFollowing = function () {
    this.mode = followNothing;
    this.target = null;
    this.targetAngle = 0;
    this.currentPosition = 0;
};

Camera.prototype.followOneTarget = function (target) {
    this.mode = followOneTargetMode;
    this.target = target;
    this.targetAngle = 0;
    this.currentPosition = 0;
};

Camera.prototype.setSpeed = function (speed) {
    this.speed = speed;
};

Camera.prototype.update = function () {
    this.calculateOffsets();

    this.rotation.x = -this.angle;
    this.position.z = this.offsetZ;
    this.position.y = this.offsetY;

    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.shakeOffsetZ = 0;

    if (this.mode === followOneTargetMode) {
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.shakeOffsetZ = Math.floor(Math.random() * 10) * this.shakeStrength / 10 - this.shakeStrength / 2;
            this.shakeOffsetX = Math.floor(Math.random() * 10) * this.shakeStrength / 10 - this.shakeStrength / 2;
            this.shakeOffsetY = Math.floor(Math.random() * 10) * this.shakeStrength / 10 - this.shakeStrength / 2;
        } else {
            this.shakeOffsetZ = 0;
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        this.position.z = this.target.position.z + this.offsetZ;
        this.position.y = this.target.position.y / 1.2 + this.offsetY + this.shakeOffsetY; // should probably be positionned relative to the ground level instead of the target level
        this.position.x = this.target.position.x + this.offsetX + this.shakeOffsetX;
    }
};

Camera.prototype.shake = function (duration, strength) {
    this.shakeDuration = duration;
    this.shakeStrength = strength;
};

module.exports = Camera;

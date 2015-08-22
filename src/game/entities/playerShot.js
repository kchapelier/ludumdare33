"use strict";

var THREE = require('three'),
    helpers = require('./../helpers');

var geometry = new THREE.SphereGeometry(20, 10, 10);

var material = new THREE.MeshLambertMaterial({
    color: 0x55FF22,
    emissiveColor: 0xFFFF00,
    shading: THREE.SmoothShading,
    fog: false
});

var PlayerShot = function () {
    this.timer = 0;
    this.group = new THREE.Group();
    this.position = this.group.position;
    this.direction = new THREE.Vector3(0,0,0);

    var mesh = new THREE.Mesh(geometry, material);

    this.group.add(mesh);

    /*
    this.light = new THREE.PointLight(0x882200, 10.3, 1000);
    this.group.add(this.light);
    */
};

PlayerShot.prototype.update = function (dt, rng) {
    this.timer += dt;

    this.position.set(
        this.position.x + this.direction.x * dt,
        this.position.y + this.direction.y * dt,
        this.position.z + this.direction.z * dt
    );

    //this.position.y = 100 + helpers.getGlobalDisplacementAtPoint(this.position.x, this.position.z, rng);
};

PlayerShot.prototype.isDead = function () {
    return this.timer >= 1000;
};

module.exports = PlayerShot;

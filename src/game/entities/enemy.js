"use strict";

var THREE= require('three');

var geometry = new THREE.BoxGeometry(100, 3000, 100);

var material = new THREE.MeshNormalMaterial(material);

var Enemy = function () {
    this.life = 10;
    this.group = new THREE.Group();
    this.position = this.group.position;

    var mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);

    mesh.userData.element = this;
};

Enemy.prototype.takeDamage = function (points) {
    this.life -= points;
};

Enemy.prototype.update = function (dt) {

};

Enemy.prototype.isDead = function () {
    return this.life <= 0;
};

module.exports = Enemy;

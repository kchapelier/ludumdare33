"use strict";

var THREE= require('three'),
    PlayerShot = require('./playerShot'),
    objectCollection = require('./../objectCollection'),
    helpers = require('./../helpers');

var jsonLoader = new THREE.JSONLoader();

var geometry = jsonLoader.parse(require('./../models/ldjam02'), null).geometry;

var material = new THREE.MeshPhongMaterial({
    color: 0x00FF33,
    specular:0x00FF88,
    shading: THREE.NoShading,
    shininess: 100,
    metal: true
});

var Enemy = function () {
    this.timer = 0;
    this.life = 3;
    this.group = new THREE.Group();
    this.position = this.group.position;
    this.intentAngle = 0;
    this.knockback = new THREE.Vector3(0, 0, 0);

    var mesh = new THREE.Mesh(geometry, material);
    this.group.add(mesh);
    mesh.userData.enemy = this;
    mesh.scale.set(40,40,40)
};

Enemy.prototype.applyKnockback = function (direction, multiplier) {
    direction = direction.clone().multiplyScalar(multiplier).applyMatrix4(new THREE.Matrix4().makeRotationY((Math.random() - 0.5) * 1.7));
    this.knockback.add(direction);
};

Enemy.prototype.takeDamage = function (points) {
    this.life -= points;
};

Enemy.prototype.shot = function (playerPosition, playerDirection) {
    var shot = new PlayerShot();
    shot.position.copy(this.position);

    shot.direction.copy(playerDirection).multiplyScalar(Math.random() * 30).add(playerPosition).sub(this.position).normalize().multiplyScalar(2);

    objectCollection.add('enemyShot', shot);
};

Enemy.prototype.update = function (dt, rng, player) {
    this.timer += dt;

    var playerDistance = this.position.distanceTo(player.position);

    if (playerDistance < 5000 && this.timer % 1200 < dt) {
        this.shot(player.position, player.direction);
    }

    /*

    var direction = new THREE.Vector3(-this.position.x,0,-this.position.z).normalize().multiplyScalar(5);

    this.intentAngle = rng.perlin2(this.position.x / 270 + this.timer / 233333, this.position.y / 270 + this.timer / 213333);

    direction.applyMatrix4(new THREE.Matrix4().makeRotationY(this.intentAngle));

    this.group.position.add(direction);

    for (var i = 0; i < this.meshes.length; i++) {
        this.meshes[i].position.x = direction.x * i * -10.;
        this.meshes[i].position.z = direction.z * i * -10.;
        this.meshes[i].position.y = Math.cos(this.timer / (100 + i * 2)) * 20. + helpers.getGlobalDisplacementAtPoint(
            this.group.position.x + this.meshes[i].position.x,
            this.group.position.z + this.meshes[i].position.z,
            rng
        ) ;
    }
    */

    this.group.position.x += this.knockback.x;
    this.group.position.z += this.knockback.z;
    this.group.rotation.x += this.knockback.x / 75;
    this.group.rotation.y += this.knockback.y / 75;
    this.group.rotation.z += this.knockback.z / 75;
    this.knockback.multiplyScalar(0.85);

    this.group.position.y = 230 + helpers.getGlobalDisplacementAtPoint(this.group.position.x, this.group.position.z, rng);


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

Enemy.prototype.isDead = function () {
    return this.life <= 0;
};

module.exports = Enemy;

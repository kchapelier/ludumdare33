var THREE = require('three'),
    groundGeometry = require('../geometries/groundGeometry');


var tileWidth = 1000,
    tileHeight = 1000;

var groundMaterial = new THREE.MeshLambertMaterial({
    //vertexColors: THREE.FaceColors,
    color: 'white',
    fog: true,
    shading: THREE.NoShading,
    side: THREE.DoubleSide //FIXME this should not be used, this is a bug in groundGeometry
});

var Ground = function (rng) {
    this.rng = rng;
    this.group = new THREE.Group();
};



Ground.prototype.addTile = function (x, y, walls) {
    var geometry = groundGeometry.generate(tileWidth, tileHeight, x * tileWidth, y * tileHeight, this.rng, walls);

    var tile = new THREE.Mesh(
        geometry,
        groundMaterial
    );

    tile.position.x = x * tileWidth;
    tile.position.z = y * tileHeight;
    tile.rotation.x = -Math.PI / 2;

    this.group.add(tile);
};

module.exports = Ground;

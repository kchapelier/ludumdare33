"use strict";

//TODO optimize

var THREE = require('three'),
    chroma = require('chroma-js')

module.exports = {
    generate: function (width, height, x, y, rng) {
        var geometry = new THREE.PlaneGeometry(width, height, 7, 7);

        for(var i = 0; i < geometry.vertices.length; i++) {
            var vertex = geometry.vertices[i];
            var vx = vertex.x + x,
                vy = vertex.y - y;

            vertex.add(new THREE.Vector3(
                (rng.perlin2(vx / 17, vy / 21)) * 10.,
                (rng.perlin2(vx / 31, vy / 11)) * 10.,
                (1 + rng.perlin2(vy / 729, vx / 703) * 2.) * Math.pow(rng.perlin2(vy / 327, vx / 333), 2) * 400.
            ));
        }

        geometry.computeFaceNormals();

        for (var i = 0; i < geometry.faces.length; i++) {
            var disp = Math.abs(rng.perlin2(Math.random() / 10 + geometry.faces[i].normal.x * 77., Math.random() / 10 + geometry.faces[i].normal.y * 77.));
            geometry.faces[i].color.setStyle(chroma('brown').darken(disp * 0.75).saturate((1-disp) * 0.75 + 1).hex());
        }

        geometry.colorsNeedUpdate = true;

        return geometry;
    }
};


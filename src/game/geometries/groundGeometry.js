"use strict";

var THREE = require('three'),
    chroma = require('chroma-js')

//TODO optimize the hell out of it

module.exports = {
    generate: function (width, height, x, y, rng) {
        var geometry = new THREE.PlaneGeometry(width, height, 7, 7),
            geometryClone = geometry.clone();

        for(var i = 0; i < geometry.vertices.length; i++) {
            var vertex = geometry.vertices[i],
                cloneVertex = geometryClone.vertices[i];

            var vx = vertex.x + x,
                vy = vertex.y - y;

            var mirroredDisp = (1 + rng.perlin2(vy / 729, vx / 703) * 2.),
                globalDisp = (rng.perlin2(vy / 1825, vx / 1789) * 500.);

            vertex.add(new THREE.Vector3(
                (rng.perlin2(vx / 17, vy / 21)) * 30.,
                (rng.perlin2(vx / 31, vy / 11)) * 30.,
                globalDisp + mirroredDisp * Math.pow(rng.perlin2(vy / 327, vx / 333), 2) * 350.
            ));

            cloneVertex.add(new THREE.Vector3(
                (rng.perlin2(vx / 21, vy / 17)) * 30.,
                (rng.perlin2(vx / 11, vy / 31)) * 30.,
                globalDisp + mirroredDisp * Math.pow(rng.perlin2(vy / 333, vx / 327), 2) * 450 * -1.
            ));
        }
        geometryClone.doubleSided = true;

        geometry.computeFaceNormals();
        geometryClone.computeFaceNormals();

        for (var i = 0; i < geometry.faces.length; i++) {
            var disp = Math.abs(rng.perlin2(Math.random() / 10 + geometry.faces[i].normal.x * 77., Math.random() / 10 + geometry.faces[i].normal.y * 77.));
            geometry.faces[i].color.setStyle(chroma('#288850').darken(disp * 0.75).saturate((1-disp) * 0.75 + 1).hex());
            geometryClone.faces[i].color.setStyle(chroma('#288850').darken(disp * 0.75).saturate((1-disp) * 0.75 + 1).hex());
        }

        geometry.colorsNeedUpdate = true;
        geometryClone.colorsNeedUpdate = true;

        geometryClone.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,500));
        geometry.merge(geometryClone);

        return geometry;
    }
};


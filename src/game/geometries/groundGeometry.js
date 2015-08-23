"use strict";

var THREE = require('three'),
    chroma = require('chroma-js')

//TODO optimize the hell out of it

module.exports = {
    generate: function (width, height, x, y, rng, wallOnLeft, wallOnRight, wallOnFront, wallOnBottom) {
        var details = 8,
            geometry = new THREE.PlaneGeometry(width, height, details - 1, details - 1),
            geometryClone = geometry.clone();

        for(var i = 0; i < geometry.vertices.length; i++) {
            var vertex = geometry.vertices[i],
                cloneVertex = geometryClone.vertices[i];

            var vx = vertex.x + x,
                vy = vertex.y - y;

            var mirroredDisp = (1 + rng.perlin2(vy / 729, vx / 703) * 2.),
                globalDisp = (rng.perlin2(vy / 1825, vx / 1789) * 500.),
                wallCoeff = 0,
                wallDisp;

            var wallSharpness = 5;

            if (wallOnLeft) {
                wallCoeff+= Math.pow((details - 1 - (i % details)) / (details - 1), wallSharpness);
            }

            if (wallOnRight) {
                wallCoeff += Math.pow((i % details) / (details - 1), wallSharpness);
            }

            if (wallOnFront) {
                wallCoeff += Math.pow((details - 1 - Math.floor(i / details)) / (details - 1), wallSharpness);
            }

            if (wallOnBottom) {
                wallCoeff += Math.pow(Math.floor(i / details) / (details - 1), wallSharpness);
            }

            wallCoeff = Math.min(1, wallCoeff);

            wallDisp = (250) * wallCoeff;

            var upDisp = mirroredDisp * Math.pow(rng.perlin2(vy / 333, vx / 327), 2) * 450 * -1 ,
                downDisp = mirroredDisp * Math.pow(rng.perlin2(vy / 327, vx / 333), 2) * 350;


            vertex.add(new THREE.Vector3(
                (rng.perlin2(vx / 17, vy / 21)) * 70. * (1 - wallCoeff),
                (rng.perlin2(vx / 31, vy / 11)) * 30. * (1 - wallCoeff),
                globalDisp + wallDisp + downDisp * Math.min(1, 1.5 - wallCoeff)
            ));

            cloneVertex.add(new THREE.Vector3(
                (rng.perlin2(vx / 21, vy / 17)) * 30. * (1 - wallCoeff),
                (rng.perlin2(vx / 11, vy / 31)) * 70. * (1 - wallCoeff),
                globalDisp + wallDisp * -1 + upDisp * Math.min(1, 1.5 - wallCoeff)
            ));
        }
        geometryClone.doubleSided = true;

        geometry.computeFaceNormals();
        geometryClone.computeFaceNormals();

        for (var i = 0; i < geometry.faces.length; i++) {
            var disp = Math.abs(rng.perlin2(Math.random() / 10 + geometry.faces[i].normal.x * 77., Math.random() / 10 + geometry.faces[i].normal.y * 77.));
            geometry.faces[i].color.setStyle(chroma('#388865').darken(disp * 0.5).saturate((1-disp) * 0.75 + 1).hex());
            geometryClone.faces[i].color.setStyle(chroma('#388865').darken(disp * 0.5).saturate((1-disp) * 0.75 + 1).hex());
        }

        geometry.colorsNeedUpdate = true;
        geometryClone.colorsNeedUpdate = true;

        geometryClone.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,500));
        geometry.merge(geometryClone);

        return geometry;
    }
};


"use strict";

var THREE = require('three'),
    Camera = require('./camera'),
    isArray = require('is-array'),
    baseWidth = 800,
    baseHeight = 600,
    pixelRatio = (typeof window.devicePixelRatio !== 'undefined' ? window.devicePixelRatio : 1);

var renderer = new THREE.WebGLRenderer({ antialias: true }),
    camera = new Camera(baseWidth / baseHeight, Math.PI / 10.5, 0),
    hudCamera = new THREE.OrthographicCamera( - baseWidth / 2, baseWidth / 2, baseHeight / 2, - baseHeight / 2, 1, 10 ),
    scene = new THREE.Scene(),
    hudScene = new THREE.Scene();

hudCamera.position.z = 10;

renderer.setPixelRatio(pixelRatio);
renderer.setSize(baseWidth, baseHeight);
renderer.autoClear = false;
renderer.shadowMapType = THREE.PCFSoftShadowMap;
renderer.shadowMapEnabled = false;
renderer.shadowMapCullFace = THREE.CullFaceBack;

scene.fog = new THREE.FogExp2( 0x000000, 0.00045 );

module.exports = {
    screenWidth: baseWidth,
    screenHeight: baseHeight,
    pixelRation: pixelRatio,
    infectDom: function (domElement) {
        if (typeof domElement === 'string') {
            domElement = document.getElementById(domElement);
        }

        domElement.appendChild(renderer.domElement);
    },
    addMultipleToScene: function (objects) {
        for(var i = 0; i < objects.length; i++) {
            scene.add(objects[i]);
        }
    },
    addToScene: function (object) {
        if (isArray(object)) {
            this.addMultipleToScene(object);
        } else {
            scene.add(object);
        }
    },
    render: function () {
        camera.update();
        renderer.clear();
        renderer.render( scene, camera );
        renderer.clearDepth();
        renderer.render( hudScene, hudCamera );
    },
    shakeCamera: function (duration, strength) {
        camera.shake(duration, strength);
    },
    lockCamera: function (object) {
        camera.followOneTarget(object);
    },
    unlockCamera: function () {
        camera.stopFollowing();
    }
};

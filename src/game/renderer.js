"use strict";

var THREE = require('three'),
    Camera = require('./camera'),
    isArray = require('is-array'),
    baseWidth = 800,
    baseHeight = 600,
    pixelRatio = (typeof window.devicePixelRatio !== 'undefined' ? window.devicePixelRatio : 1);

var EffectComposer = require('../lib/three-postprocessing/effectComposer'),
    RenderPass = require('../lib/three-postprocessing/renderPass'),
    ShaderPass = require('../lib/three-postprocessing/shaderPass'),
    EdgeShader2 = require('../lib/three-postprocessing/shaders/edgeShader2'),
    VibranceShader = require('../lib/three-postprocessing/shaders/vibranceShader'),
    GammaShader = require('../lib/three-postprocessing/shaders/gammaShader'),
    FXAAShader = require('../lib/three-postprocessing/shaders/fxaaShader');

var renderer = new THREE.WebGLRenderer({ antialias: true, maxLights: 10 }),
    camera = new Camera(baseWidth / baseHeight, Math.PI / 10.5, 0),
    hudCamera = new THREE.OrthographicCamera( - baseWidth*pixelRatio / 2, baseWidth*pixelRatio / 2, baseHeight*pixelRatio / 2, - baseHeight*pixelRatio / 2, 0.1, 100),
    scene = new THREE.Scene(),
    hudScene = new THREE.Scene();

var composer = new EffectComposer( renderer );
composer.setSize(baseWidth * pixelRatio, baseHeight * pixelRatio);
var pass = new RenderPass( scene, camera );
composer.addPass( pass );


var effect = new ShaderPass( VibranceShader );
effect.uniforms[ 'amount' ].value = -0.8;
composer.addPass( effect );

var effect = new ShaderPass( FXAAShader );
effect.uniforms[ 'resolution' ].value = new THREE.Vector2(1/(baseWidth * pixelRatio), 1/(baseHeight * pixelRatio));
effect.renderToScreen = true;
composer.addPass( effect );

hudCamera.position.z = 10;

renderer.setPixelRatio(pixelRatio);
renderer.setSize(baseWidth, baseHeight);
renderer.autoClear = false;

var aimMaterial = new THREE.SpriteMaterial({
    map: THREE.ImageUtils.loadTexture( "assets/images/aim.png" ),
    color: 0xFFFFFF,
    fog: false
});

var sprite = new THREE.Sprite(aimMaterial);
sprite.position.set(0, 0, 3);
sprite.scale.x = 16;
sprite.scale.y = 16;
hudScene.add(sprite);

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
    removeFromScene: function (object) {
        scene.remove(object);
    },
    render: function () {
        camera.update();
        /* /
        composer.render();
        /*/
        renderer.clear();
        renderer.render( scene, camera );
        /* */
        renderer.clear(false, true, false);
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

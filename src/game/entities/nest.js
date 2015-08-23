"use strict";

var THREE = require('three'),
    SPE = require('./../../lib/shaderParticleEngine/shaderParticleEngine');

var shaderMaterial = new THREE.ShaderMaterial({
    attributes: {},
    uniforms: {
        time: { type: "f", value: 1.0 }
    },
    vertexShader: `

        uniform float time;
        varying vec2 vUv;

        void main()
        {
            vUv = uv;
            float rotation = 0.0;

            vec3 alignedPosition = vec3(position.x, position.y, position.z);

            vec2 pos = alignedPosition.xy;

            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

            vec4 finalPosition;

            finalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            finalPosition.xy += rotatedPosition;
            finalPosition = projectionMatrix * finalPosition;

            gl_Position =  finalPosition;
        }

    `,
    fragmentShader: `

uniform float time;

varying vec2 vUv;
varying float vPlaneIndex;

//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
    -0.577350269189626,  // -1.0 + 2.0 * C.x
    0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
+ i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main( void ) {
    vec2 position = (vUv - vec2(0.5, 0.5)) * 2.;

    float dist = pow(pow(position.y, 2.) + pow(position.x, 2.), 0.5);

    float noise = snoise(vec2(
        cos(position.y * 6. + time / 2000.) * (dist + sin(position.x) / 1.),
        cos(position.x * 6. + time / 2000.) * (dist + sin(position.y) / 1.)
    )) * 0.75;

    noise = noise/snoise(vec2(position.y * 10. + cos(time / 2000.), position.x * 10. + sin(time / 2000.)));

    float grey = (1. - dist * 2.) * clamp(pow(noise * 1.4, 0.85), 0.0, 1.0) * 2.;

    gl_FragColor = vec4(0.2 * grey, 1. * grey, 0.6 * grey, pow(clamp(.5 - dist, 0., 1.) * 2., 0.21));

}

    `,
    side: THREE.DoubleSide,
    shading: THREE.NoShading,
    blending: THREE.NormalBlending,
    transparent: true
} );

var Nest = function () {
    this.timer = 0;
    this.group = new THREE.Group();
    this.position = this.group.position;

    var pointLight = new THREE.PointLight(0x00FF66, 15., 650);
    pointLight.position.y = 200;
    this.group.add(pointLight);

    var geometry = new THREE.PlaneGeometry(550, 550, 2, 2);
    geometry.doubleSided = true;
    var mesh = new THREE.Mesh(geometry, shaderMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.y = 200;
    this.group.add(mesh);

    /*
    this.particles = new SPE.Group({
        texture: THREE.ImageUtils.loadTexture('./assets/images/particle.png'),
        maxAge: 200,
        hasPerspective: true,
        colorize: true
    });

    this.particles.addEmitter(new SPE.Emitter({
        position: new THREE.Vector3(0, 0, -400),
        positionSpread: new THREE.Vector3( 0, 0, 0 ),
        acceleration: new THREE.Vector3(0, -0.1, 0),
        accelerationSpread: new THREE.Vector3( 0.1, 0, 0.1 ),
        velocity: new THREE.Vector3(0, 5, 0),
        velocitySpread: new THREE.Vector3(2, 1, 2),
        colorStart: new THREE.Color('white'),
        colorEnd: new THREE.Color('blue'),
        sizeStart: 100,
        sizeEnd: 100,
        particleCount: 2000
    }));

    this.group.add(this.particles.mesh);
    this.particles.mesh.frustumCulled = false;
    */

    //this.group.add(new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 9999, 0), 9999));
};

Nest.prototype.positionBetween = function (position1, position2) {
    this.position.copy(position1).add(position2).divideScalar(2);
};

Nest.prototype.update = function (dt) {
    this.timer += dt;
    shaderMaterial.uniforms.time.value = this.timer;
    this.particles.tick(dt / 100);
};

module.exports = Nest;

"use strict";

var game = require('./game/game');

var button = document.getElementById('playButton'),
    intro = document.getElementById('startGame');


button.addEventListener('click', function () {
    intro.style.display = 'none';
    game.initialize();
});

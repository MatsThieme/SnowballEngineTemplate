import { Game } from '../Game.js';

if ((<any>window).cordova) document.addEventListener('deviceready', () => new Game());
else new Game();
import { Game } from '../Game.js';
import * as it from './Input/InputType.js';

it.default; // load module

if (window.cordova) document.addEventListener('deviceready', () => new Game());
else new Game();
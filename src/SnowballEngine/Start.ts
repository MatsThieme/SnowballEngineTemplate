import { Game } from '../Game.js';
import { Client } from './Client.js';
import { AudioListener } from './GameObject/Components/AudioListener.js';
import * as it from './Input/InputType.js';

Client.start();
AudioListener.start();

it.default; // load module

if (window.cordova) document.addEventListener('deviceready', () => new Game());
else new Game();
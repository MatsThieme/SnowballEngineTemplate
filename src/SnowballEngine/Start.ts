import * as PIXI from 'pixi.js';
import projectConfig from '../../SnowballEngineConfig.json';
import { Game } from '../Game';
import { Client } from './Client';
import { D } from './Debug';
import { AudioListener } from './GameObject/Components/AudioListener';
import { Input } from './Input/Input';

window.project = projectConfig;

window.PIXI = PIXI;
PIXI.utils.skipHello();

D.init();

Input.start();

AudioListener.start();

Client.init();


if (window.cordova) document.addEventListener('deviceready', () => new Game());
else new Game();

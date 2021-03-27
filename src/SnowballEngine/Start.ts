import * as PIXI from 'pixi.js';
import projectConfig from '../../SnowballEngineConfig.json';
import { Game } from '../Game';
import { Client } from './Client';
import { D } from './Debug';
import { AudioListener } from './GameObject/Components/AudioListener';
import { Input } from './Input/Input';
import { UIFonts } from './UI/UIFonts';


PIXI.utils.skipHello(); // don't show PIXIs hello in console
if (projectConfig.build.isDevelopmentBuild) (<any>window).PIXI = PIXI; // for the chrome pixijs developer tools

D.init(); // add global error handlers

Client.init();

Input.start(); // listen for user input

UIFonts.init(); // create default fonts

AudioListener.start(); // create audio context


if (window.cordova) document.addEventListener('deviceready', () => new Game());
else new Game();

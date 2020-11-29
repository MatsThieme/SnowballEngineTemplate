import projectConfig from '../../SnowballEngineConfig.json';
import { Game } from '../Game';
import { Client } from './Client';
import { AudioListener } from './GameObject/Components/AudioListener';
import { createENUM } from './Helpers';
import { Input } from './Input/Input';

(<any>window).project = projectConfig;
(<any>window).InputType = createENUM<InputType>();

Input.start();

Client.start();

AudioListener.start();


if (window.cordova) document.addEventListener('deviceready', () => new Game());
else new Game();

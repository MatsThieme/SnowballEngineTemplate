import projectConfig from "Config";
import { Component } from "GameObject/Components/Component";
import { GameObject } from "GameObject/GameObject";
import { Input } from "Input/Input";
import { Common } from "matter-js";
import * as PIXI from "pixi.js";
import { Ticker } from "pixi.js";
import * as poly_decomp from "poly-decomp";
import { Game } from "../Game";
import { Scene } from "./Scene";
import { SceneManager } from "./SceneManager";

PIXI.utils.skipHello(); // don't show PIXIs hello in console
Ticker.system.autoStart = false;

if (projectConfig.build.debugMode) {
    (window as any).PIXI = PIXI; // for the chrome pixijs developer tools
    (window as any).GameObject = GameObject;
    (window as any).Component = Component;
    (window as any).Scene = Scene;
}

Common.setDecomp(poly_decomp);

Input.start(); // listen for user input

if (window.cordova) {
    document.addEventListener("deviceready", () => startGame());
} else {
    startGame();
}

function startGame() {
    new Game().initialize(new SceneManager("se-root"));
}

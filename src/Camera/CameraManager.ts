import { Camera } from "GameObject/Components/Camera";
import { Component } from "GameObject/Components/Component";
import { GameObject } from "GameObject/GameObject";
import { Client } from "Client";
import { Debug } from "Debug";
import { Color } from "Utility/Color";
import { Vector2 } from "Utility/Vector2";
import { PIXI } from "./PIXI";

/** @category Camera */
export class CameraManager {
    public readonly cameras: Camera[];
    public renderScale: number;

    private readonly _gameObjects: Partial<Record<number, GameObject>>;
    private readonly _PIXI: PIXI;

    private readonly _backgroundColor: Color;

    public constructor(domElement: HTMLCanvasElement) {
        this.cameras = [];

        this.renderScale = 1;

        this._PIXI = new PIXI(domElement, Client.resolution.x, Client.resolution.y);

        this._gameObjects = {};

        this._backgroundColor = this.backgroundColor = Color.deepskyblue.clone;
    }

    public get canvas(): HTMLCanvasElement {
        return this._PIXI.canvas;
    }

    public get backgroundColor(): Readonly<Color> {
        this._backgroundColor.rgb = this._PIXI.renderer.backgroundColor;

        return this._backgroundColor;
    }
    public set backgroundColor(val: Readonly<Color>) {
        this._PIXI.renderer.backgroundColor = val.rgb;
    }

    public getRenderResolution(): Vector2 {
        return Client.resolution.clone.scale(this.renderScale).round();
    }

    /**
     * @internal
     */
    public addCamera(camera: Camera): void {
        this.cameras.push(camera);
    }

    /**
     * @internal
     */
    public removeCamera(camera: Camera): void {
        const i = this.cameras.findIndex((c) => c.componentID == camera.componentID);

        if (i === -1) return;

        this.cameras.splice(i, 1);
    }

    /**
     * Stage a GameObject
     * @internal
     */
    public addGameObject(gameObject: GameObject): void {
        if (this._gameObjects[gameObject.id] !== undefined)
            return Debug.warn("GameObject.container is already staged");

        this._PIXI.container.addChild(gameObject.container);

        this._gameObjects[gameObject.id] = gameObject;
    }

    /**
     * Unstage a GameObject
     * @internal
     */
    public removeGameObject(gameObject: GameObject): void {
        if (this._gameObjects[gameObject.id] === undefined) return Debug.warn("GameObject not found");

        this._PIXI.container.removeChild(gameObject.container);

        delete this._gameObjects[gameObject.id];
    }

    public update(): void {
        if (!this.cameras.filter((c) => c.active)) return Debug.warn("No active camera");

        const canvasSize = this.getRenderResolution();
        this._PIXI.resize(canvasSize.x, canvasSize.y);

        this._PIXI.renderer.clear();

        for (const camera of this.cameras.sort((a, b) => a.zIndex - b.zIndex)) {
            if (camera.active) {
                for (const component of Component.components) {
                    component.dispatchEvent("prerender", camera);
                }

                camera.render(this._PIXI);

                for (const component of Component.components) {
                    component.dispatchEvent("postrender", camera);
                }
            }
        }
    }

    public destroy(): void {
        this._PIXI.destroy();
    }
}

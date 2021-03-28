import { Destroyable } from 'SnowballEngine/GameObject/Destroy';
import { Scene } from 'SnowballEngine/Scene';
import { Color } from 'SnowballEngine/Utilities/Color';
import { Client } from '../Client';
import { Debug } from '../Debug';
import { Camera } from '../GameObject/Components/Camera';
import { ComponentType } from '../GameObject/ComponentType';
import { GameObject } from '../GameObject/GameObject';
import { Vector2 } from '../Utilities/Vector2';
import { PIXI } from './PIXI';

export class CameraManager implements Destroyable {
    public readonly cameras: Camera[];
    public renderScale: number;

    private readonly _gameObjects: Map<number, GameObject>;
    private readonly _PIXI: PIXI;

    public constructor() {
        this.cameras = [];

        this.renderScale = 1;

        this._PIXI = new PIXI(Client.resolution.x, Client.resolution.y);

        this._gameObjects = new Map();

        this._PIXI.uiContainer = Scene.currentScene.ui.container;


        this.backgroundColor = Color.lightblue;
    }

    public get canvas(): HTMLCanvasElement {
        return this._PIXI.canvas;
    }

    public get backgroundColor(): Color {
        const color = new Color();

        color.rgb = this._PIXI.renderer.backgroundColor;

        return color;
    }
    public set backgroundColor(val: Color) {
        this._PIXI.renderer.backgroundColor = val.rgb;
    }

    /**
     * 
     * @internal 
     * 
     */
    public addCamera(camera: Camera): void {
        this.cameras.push(camera);
    }

    /**
     * 
     * @internal 
     * 
     */
    public removeCamera(camera: Camera): void {
        const i = this.cameras.findIndex(c => c.componentId == camera.componentId);

        if (i === -1) return;

        this.cameras.splice(i, 1);
    }


    /**
     * 
     * Stage a GameObject
     * @internal
     * 
     */
    public addGameObject(gameObject: GameObject): void {
        if (this.hasGameObject(gameObject)) return Debug.warn('GameObject.container is already staged');

        this._PIXI.container.addChild(gameObject.container);

        this._gameObjects.set(gameObject.id, gameObject);
    }

    /**
     * 
     * Unstage a GameObject
     * @internal
     * 
     */
    public removeGameObject(gameObject: GameObject): void {
        if (!this.hasGameObject(gameObject)) return Debug.warn('GameObject not found');

        this._PIXI.container.removeChild(gameObject.container);

        this._gameObjects.delete(gameObject.id);
    }

    public hasGameObject(gameObject: GameObject): boolean {
        return this._gameObjects.has(gameObject.id);
    }


    public update(): void {
        if (!this.cameras.filter(c => c.active)) return Debug.warn('No active camera');


        const canvasSize = (<Vector2>Client.resolution).clone.scale(this.renderScale).round();
        this._PIXI.resize(canvasSize.x, canvasSize.y);

        this._PIXI.renderer.clear();


        const gameObjects = [...this.cameras[0].gameObject.scene.gameObjects.values()];
        const components = gameObjects.flatMap(gameObject => gameObject.getComponents(ComponentType.Component));


        for (const camera of this.cameras.sort((a, b) => a.zIndex - b.zIndex)) {
            if (camera.active) {
                for (const component of components) {
                    if (component.onPreRender)
                        component.onPreRender(camera);
                }


                camera.update(this._PIXI);


                for (const component of components) {
                    if (component.onPostRender)
                        component.onPostRender(camera);
                }
            }
        }

        this._PIXI.uiContainer.scale.set(canvasSize.x / 100, canvasSize.y / 100);

        this._PIXI.renderUI();
    }

    public destroy(): void {
        this._PIXI.destroy();
    }
}
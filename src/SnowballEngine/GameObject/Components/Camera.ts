import { Graphics } from 'pixi.js';
import { PIXI } from '../../Camera/PIXI';
import { Client } from '../../Client';
import { D } from '../../Debug';
import { Color } from '../../Utilities/Color';
import { clamp } from '../../Utilities/Helpers';
import { Vector2 } from '../../Utilities/Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

export class Camera extends Component {
    /**
    *
    * camera position in vw and vh.
    *
    */
    public screenPosition: Vector2;

    /**
     * 
     * higher value -> later drawn
     * 
     */
    public zIndex: number;

    /**
     * 
     * Backgroundcolor if not transparent
     * 
     */
    public backgroundColor: Color;

    private _screenSize: Vector2;
    private _size: Vector2;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Camera);

        this.screenPosition = new Vector2();
        this.zIndex = 0;
        this.backgroundColor = Color.lightblue;


        this._screenSize = new Vector2(100, 100);
        this._size = Client.aspectRatio;


        this.gameObject.scene.cameraManager.addCamera(this);
    }

    /**
    *
    * size in world units to display.
    *
    */
    public get size(): Vector2 {
        return this._size.clone;
    }
    public set size(val: Vector2) {
        this._size = val;
    }

    /**
     * 
     * view size in vw and vh.
     * 
     */
    public get screenSize(): Vector2 {
        return this._screenSize.clone;
    }
    public set screenSize(val: Vector2) {
        this._screenSize = new Vector2(clamp(0.0001, 100, val.x), clamp(0.0001, 100, val.y));
        if (val.x !== this._screenSize.x || val.y !== this._screenSize.y) D.warn(`Camera(${this.gameObject.name}).screenSize was clamped to 0.0001-100`);
    }

    public update(pixi: PIXI): void {
        if (!this.active) return;


        pixi.renderer.backgroundColor = this.backgroundColor.rgb;

        const globalTransform = this.gameObject.transform.toGlobal();

        pixi.container.scale.copyFrom(new Vector2(pixi.canvas.width / this.size.x / (100 / this.screenSize.x), pixi.canvas.height / this.size.y / (100 / this.screenSize.y)).scale(globalTransform.scale));
        pixi.container.position.copyFrom(this.worldToCameraPoint(globalTransform.position).add(new Vector2(pixi.canvas.width / (100 / this.screenPosition.x), pixi.canvas.height / (100 / this.screenPosition.y))));
        pixi.container.rotation = -globalTransform.rotation.radian;


        (<Graphics>pixi.container.mask).clear();

        (<Graphics>pixi.container.mask)
            .beginFill(0)
            .drawRect(pixi.canvas.width / (100 / this.screenPosition.x), pixi.canvas.height / (100 / this.screenPosition.y), pixi.canvas.width / (100 / this.screenSize.x), pixi.canvas.height / (100 / this.screenSize.y))
            .endFill();


        pixi.render();
    }

    public worldToCamera(vec: Vector2): Vector2 {
        return new Vector2(vec.x * (<any>this.gameObject.scene.cameraManager)._PIXI.canvas.width / this.size.x / (100 / this.screenSize.x), vec.y * (<any>this.gameObject.scene.cameraManager)._PIXI.canvas.height / this.size.y / (100 / this.screenSize.y));
    }

    public worldToCameraPoint(point: Vector2): Vector2 {
        return this.worldToCamera(new Vector2(-point.x + this.size.x / 2, point.y + this.size.y / 2)).floor();
    }

    public destroy(): void {
        this.gameObject.scene.cameraManager.removeCamera(this);

        super.destroy();
    }
}
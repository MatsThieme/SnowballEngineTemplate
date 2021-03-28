import { Graphics } from '@pixi/graphics';
import { PIXI } from 'SnowballEngine/Camera/PIXI';
import { Client } from 'SnowballEngine/Client';
import { Debug } from 'SnowballEngine/Debug';
import { AABB } from 'SnowballEngine/Physics/AABB';
import { clamp } from 'Utility/Helpers';
import { Vector2 } from 'Utility/Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';

/**
 * @category Component
 * @category Camera 
 */
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

    private _screenSize: Vector2;
    private _size: Vector2;
    private _aabb?: AABB;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Camera);

        this.screenPosition = new Vector2();
        this.zIndex = 0;


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
        if (val.x !== this._screenSize.x || val.y !== this._screenSize.y) Debug.warn(`Camera(${this.gameObject.name}).screenSize was clamped to 0.0001-100`);
    }

    public get aabb(): AABB {
        if (this._aabb) return this._aabb;

        const globalTransform = this.gameObject.transform.toGlobal();

        const size = this.size.scale(globalTransform.scale);

        return this._aabb = new AABB(size, globalTransform.position.clone.sub(Vector2.divide(size, 2)));
    }

    public update(pixi: PIXI): void {
        if (!this.active) return;

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

        this._aabb = undefined;
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
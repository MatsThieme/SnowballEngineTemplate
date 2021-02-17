import { PIXI } from '../../Camera/PIXI';
import { Client } from '../../Client';
import { Color } from '../../Color';
import { D } from '../../Debug';
import { clamp } from '../../Helpers';
import { Vector2 } from '../../Vector2';
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
    private _resolution: number;
    private _px: Vector2;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Camera);

        this.screenPosition = new Vector2();
        this.zIndex = 0;
        this.backgroundColor = Color.lightblue;


        this._screenSize = new Vector2(100, 100);
        this._size = Client.aspectRatio;
        this._resolution = 1;
        this._px = this.calculatePX();


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
    }

    public get resolution(): number {
        return this._resolution;
    }
    public set resolution(val: number) {
        this._resolution = clamp(0, 2.5, val);
    }

    /**
     * 
     * cameras canvas size
     * 
     */
    public get px(): Vector2 {
        return this._px;
    }

    /**
     * 
     * calculate and set this.px
     * 
     */
    public calculatePX(): Vector2 {
        return this._px = new Vector2(~~(this.screenSize.x / 100 * Client.resolution.x * this.resolution), ~~(this.screenSize.y / 100 * Client.resolution.y * this.resolution));
    }

    public update(pixi: PIXI): void {
        if (!this.active) return;

        this.calculatePX();


        // TODO: better way of rendering multiple cameras, switching cameras shouldn't take >5 times longer than rendering
        if (pixi.canvas.width !== this._px.x || pixi.canvas.height !== this._px.y) pixi.resize(this._px.x, this._px.y);


        pixi.renderer.backgroundColor = this.backgroundColor.rgb;

        const globalTransform = this.gameObject.transform.toGlobal();

        pixi.container.scale.copyFrom(new Vector2(this._px.x / this.size.x * globalTransform.scale.x, this._px.y / this.size.y * globalTransform.scale.y));
        pixi.container.position.copyFrom(this.worldToCameraPoint(globalTransform.position));
        pixi.container.rotation = -globalTransform.rotation.radian;


        pixi.render();
    }

    public worldToCamera(vec: Vector2): Vector2 {
        return new Vector2(vec.x * this._px.x / this.size.x, vec.y * this._px.y / this.size.y);
    }

    public worldToCameraPoint(point: Vector2): Vector2 {
        return this.worldToCamera(new Vector2(-point.x + this.size.x / 2, point.y + this.size.y / 2)).floor();
    }

    public destroy(): void {
        this.gameObject.scene.cameraManager.removeCamera(this);

        super.destroy();
    }
}
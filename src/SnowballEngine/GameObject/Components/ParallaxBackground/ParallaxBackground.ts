import { Container } from 'pixi.js';
import { AssetType } from '../../../Assets/AssetType';
import { D } from '../../../Debug';
import { ComponentType } from '../../ComponentType';
import { GameObject } from '../../GameObject';
import { Camera } from '../Camera';
import { Renderable } from '../Renderable';
import { BackgroundLayer, BackgroundLayerAsset } from './BackgroundLayer';

/**
 * 
 * ParallaxBackground's GameObject or parent GameObjects should not be scaled or rotated
 * 
 */
export class ParallaxBackground extends Renderable {
    public cameras: Camera[];

    public scrollSpeed: number;

    private readonly _backgroundLayers: BackgroundLayer[];

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.ParallaxBackground);
        this.sprite = new Container();

        this.cameras = [];
        this.scrollSpeed = 1;

        this._backgroundLayers = [];
    }

    public onPreRender(camera: Camera): void {
        const i = this.cameras.findIndex(c => c.componentId === camera.componentId);

        if (i === -1) return;

        // TODO: test whether the background is in the viewport before calculating
        this.calculateBackgroundForCamera(camera);
    }

    public addBackground(speed: number, asset: BackgroundLayerAsset): void {
        const i = this._backgroundLayers.findIndex(b => b.speed === speed);

        if (i !== -1) return D.error('could not add backgroundLayer: found background of same speed');

        if (asset.asset.type !== AssetType.Image) return D.error('could not add backgroundLayer: one or more assets are not of type Image');


        this._backgroundLayers.push(new BackgroundLayer(speed, asset, this.sprite!, this));

        this.sprite?.sortChildren();
    }

    public calculateBackgroundForCamera(camera: Camera): void {
        for (const backgroundLayer of this._backgroundLayers) {
            backgroundLayer.updateSpriteForCamera(camera);
        }
    }

}
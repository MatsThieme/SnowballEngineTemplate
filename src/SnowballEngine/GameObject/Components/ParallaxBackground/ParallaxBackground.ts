import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { AssetType } from 'Assets/AssetType';
import { ComponentType } from 'GameObject/ComponentType';
import { Dispose } from 'GameObject/Dispose';
import { GameObject } from 'GameObject/GameObject';
import { AABB } from 'Utility/AABB';
import { Angle } from 'Utility/Angle';
import { ParallaxBackgroundEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Camera } from '../Camera';
import { Renderable } from '../Renderable';
import { Transform } from '../Transform/Transform';
import { BackgroundLayer } from './BackgroundLayer';
import { BackgroundLayerAsset } from './BackgroundLayerAsset';

/** @category Component */
export class ParallaxBackground extends Renderable<ParallaxBackgroundEventTypes> {
    public cameras: Camera[];
    public scrollSpeed: number;

    private readonly _backgroundLayers: BackgroundLayer[];

    private _aabb: AABB;

    /**
     * 
     * ParallaxBackground's GameObject or parent GameObjects should not be scaled or rotated
     * 
     */
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.ParallaxBackground);
        this.sprite = new Container();

        this.cameras = [...gameObject.scene.cameraManager.cameras];
        this.scrollSpeed = 1;

        this._aabb = new AABB(new Vector2(), new Vector2());

        this._backgroundLayers = [];

        this.sprite!.mask = new Graphics();
        this.sprite!.addChild(this.sprite!.mask);
    }


    protected override onPreRender(camera: Camera): void {
        const i = this.cameras.findIndex(c => c.componentID === camera.componentID);

        if (i === -1 || !this._aabb.intersects(camera.aabb)) return;

        this.calculateBackgroundForCamera(camera);
    }

    private recalculateAABB(): void {
        let top = 0;
        let bot = 0;
        let right = 0;
        let left = 0;

        for (const bg of this._backgroundLayers) {
            let t = bg.backgroundLayerSprite.spriteCenter.y + bg.backgroundLayerSprite.size.y / 2;
            if (top < t) top = t;

            t = bg.backgroundLayerSprite.spriteCenter.y - bg.backgroundLayerSprite.size.y / 2;
            if (bot > t) bot = t;

            t = bg.backgroundLayerSprite.spriteCenter.x + bg.backgroundLayerSprite.size.x / 2;
            if (right < t) right = t;

            t = bg.backgroundLayerSprite.spriteCenter.x - bg.backgroundLayerSprite.size.x / 2;
            if (left > t) left = t;
        }


        const t = Transform.toGlobal(Transform.createTransformable(new Vector2(left, bot), new Vector2(1, 1), new Angle(), this.gameObject.transform));

        this._aabb.setHalfExtents({ x: (right - left) / 2 * t.scale.x, y: (top - bot) / 2 * t.scale.y });
        this._aabb.setPosition(Vector2.add(t.position, this._aabb.halfExtents));
    }

    public addBackground(speed: number, asset: BackgroundLayerAsset): void {
        if (asset.asset?.type !== AssetType.Image) throw new Error(`Could not add background: Asset is not of type Image (${asset.asset?.path})`);

        this._backgroundLayers.push(new BackgroundLayer(speed, asset, this.sprite!, this));

        this.sprite!.sortChildren();

        this.recalculateAABB();


        (<Graphics>this.sprite!.mask).clear()
            .beginFill(0)
            .drawRect(this._aabb.left, this._aabb.bottom, this._aabb.width, this._aabb.height)
            .endFill();
    }

    public calculateBackgroundForCamera(camera: Camera): void {
        for (const backgroundLayer of this._backgroundLayers) {
            backgroundLayer.updateSpriteForCamera(camera);
        }
    }

    public override destroy(): void {
        this._backgroundLayers.forEach(l => Dispose(l));

        super.destroy();
    }
}
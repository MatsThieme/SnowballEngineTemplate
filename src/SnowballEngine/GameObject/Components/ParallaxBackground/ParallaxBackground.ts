import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { AssetType } from '../../../Assets/AssetType';
import { AABB } from '../../../Physics/AABB';
import { Angle } from '../../../Utilities/Angle';
import { Vector2 } from '../../../Utilities/Vector2';
import { ComponentType } from '../../ComponentType';
import { GameObject } from '../../GameObject';
import { Camera } from '../Camera';
import { Renderable } from '../Renderable';
import { Transform } from '../Transform/Transform';
import { BackgroundLayer } from './BackgroundLayer';
import { BackgroundLayerAsset } from './BackgroundLayerAsset';

/**@category Component */
export class ParallaxBackground extends Renderable {
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


    public onPreRender(camera: Camera): void {
        const i = this.cameras.findIndex(c => c.componentId === camera.componentId);

        if (i === -1 || !camera.aabb.intersects(this._aabb)) return;

        this.calculateBackgroundForCamera(camera);
    }

    public recalculateAABB(): void {
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


        const t = Transform.toGlobal({
            position: new Vector2(left, bot),
            scale: new Vector2(1, 1),
            rotation: new Angle(),
            id: -1,
            parent: this.gameObject.transform
        });


        this._aabb.position.copy(t.position);
        this._aabb.size.set(right - left, top - bot).scale(t.scale);
    }

    public addBackground(speed: number, asset: BackgroundLayerAsset): void {
        if (asset.asset?.type !== AssetType.Image) throw new Error(`Could not add background: Asset is not of type Image (${asset.asset?.path})`);

        this._backgroundLayers.push(new BackgroundLayer(speed, asset, this.sprite!, this));

        this.sprite!.sortChildren();

        this.recalculateAABB();


        (<Graphics>this.sprite!.mask).clear()
            .beginFill(0)
            .drawRect(this._aabb.position.x, this._aabb.position.y, this._aabb.size.x, this._aabb.size.y)
            .endFill();
    }

    public calculateBackgroundForCamera(camera: Camera): void {
        for (const backgroundLayer of this._backgroundLayers) {
            backgroundLayer.updateSpriteForCamera(camera);
        }
    }
}
import { Container, TilingSprite } from 'pixi.js';
import { clamp, clearObject } from '../../../Utilities/Helpers';
import { Vector2 } from '../../../Utilities/Vector2';
import { Camera } from '../Camera';
import { Transform } from '../Transform/Transform';
import { BackgroundLayerAsset } from './BackgroundLayerAsset';
import { BackgroundLayerSprite } from './BackgroundLayerSprite';
import { ParallaxBackground } from './ParallaxBackground';

export class BackgroundLayer {
    /** speed from 0 to 1, 0 == near(no movement), 1 == far(camera speed) */
    public readonly speed: number;

    public readonly backgroundLayerSprite: BackgroundLayerSprite;

    private readonly _container: Container;

    private readonly _parallaxBackground: ParallaxBackground;

    public constructor(speed: number, backgroundLayerAsset: BackgroundLayerAsset, container: Container, parallaxBackground: ParallaxBackground) {
        this.speed = clamp(0.000001, 1, speed);

        this._container = container;

        this._parallaxBackground = parallaxBackground;


        if (!backgroundLayerAsset.offset) backgroundLayerAsset.offset = new Vector2();


        this.backgroundLayerSprite = this.toSprite(<BackgroundLayerSprite>backgroundLayerAsset);

        this._container.addChild(this.backgroundLayerSprite.sprite);
    }

    private toSprite(asset: BackgroundLayerSprite): BackgroundLayerSprite {
        const pxScale = asset.size.y / asset.asset.image!.size.y;

        const sprite = asset.sprite = new TilingSprite(asset.asset.getPIXITexture()!, asset.size.x * 2, asset.size.y - pxScale);
        sprite.anchor.set(0.5);
        sprite.zIndex = 1 / this.speed;
        sprite.name = asset.asset.path;


        sprite.tilePosition.y = -pxScale;

        sprite.tileScale.set(pxScale);


        asset.spriteCenter = new Vector2(asset.offset.x + asset.size.x / 2, -asset.offset.y);

        return asset;
    }

    public updateSpriteForCamera(camera: Camera) {
        const spritePos = Transform.toLocal(camera.gameObject.transform, Transform.fromPIXI(this._container, this._parallaxBackground.gameObject.transform)).position.sub(this.backgroundLayerSprite.spriteCenter).scale(new Vector2(this.speed, -this.speed));

        this.backgroundLayerSprite.sprite.position.copyFrom(spritePos.add(new Vector2(this.backgroundLayerSprite.size.x / 2)));
    }

    public destroy(): void {
        this.backgroundLayerSprite.sprite.destroy({ children: true, texture: true, baseTexture: false });

        clearObject(this);
    }
}
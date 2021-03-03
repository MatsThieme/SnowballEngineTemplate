import { Container, Graphics, TilingSprite } from 'pixi.js';
import { Asset } from '../../../Assets/Asset';
import { clamp, clearObject } from '../../../Utilities/Helpers';
import { Vector2 } from '../../../Utilities/Vector2';
import { Camera } from '../Camera';
import { Transform } from '../Transform/Transform';
import { ParallaxBackground } from './ParallaxBackground';

export interface BackgroundLayerAsset {
    asset: Asset;

    size: Vector2;

    /**
    *
    * Cut relative to the ParallaxBackground Component.
    *
    */
    xStart?: number;

    /**
    *
    * Height offset of the background.
    *
    */
    yOffset?: number;
}

interface BackgroundLayerSprite extends BackgroundLayerAsset {
    sprite: TilingSprite;
    spriteCenter: Vector2;

    xStart: number;
    yOffset: number;
};

export class BackgroundLayer {
    /** speed from 0 to 1, 0 == near(no movement), 1 == far(camera speed) */
    public readonly speed: number;

    public readonly sprite: BackgroundLayerSprite;

    private readonly _container: Container;

    private readonly _parallaxBackground: ParallaxBackground;

    public constructor(speed: number, asset: BackgroundLayerAsset, container: Container, parallaxBackground: ParallaxBackground) {
        this.speed = clamp(0.000001, 1, speed);

        this._container = container;

        this._parallaxBackground = parallaxBackground;


        if (!asset.xStart) asset.xStart = 0;
        if (!asset.yOffset) asset.yOffset = 0;


        this.sprite = this.toSprite(<BackgroundLayerSprite>asset);

        this._container.addChild(this.sprite.sprite);



        this.sprite.sprite.mask = new Graphics()
            .beginFill(0)
            .drawRect(asset.xStart, -(asset.yOffset + asset.size.y / 2), asset.size.x, asset.size.y)
            .endFill();

        this._container.addChild(this.sprite.sprite.mask);
    }

    private toSprite(asset: BackgroundLayerSprite): BackgroundLayerSprite {
        const sprite = asset.sprite = new TilingSprite(asset.asset.getPIXITexture()!, asset.size.x * 3, asset.size.y);
        sprite.anchor.set(0.5);
        sprite.zIndex = (asset.xStart + 1) / this.speed;
        sprite.name = asset.asset.path;


        sprite.tileScale.set(asset.size.y / asset.asset.image!.size.y);


        asset.spriteCenter = new Vector2(asset.xStart + asset.size.x / 2, asset.yOffset);

        return asset;
    }

    public updateSpriteForCamera(camera: Camera) {
        const spritePos = Transform.toLocal(camera.gameObject.transform, Transform.fromPIXI(this._container, this._parallaxBackground.gameObject.transform)).position.sub(this.sprite.spriteCenter).scale(new Vector2(this.speed, -this.speed));

        this.sprite.sprite.position.copyFrom(spritePos.add(new Vector2(this.sprite.size.x / 2, 0)));
    }

    public destroy(): void {
        this.sprite.sprite.destroy({ children: true, texture: true, baseTexture: false });

        clearObject(this);
    }
}
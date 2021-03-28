import { TilingSprite } from '@pixi/sprite-tiling';
import { Vector2 } from 'Utility/Vector2';
import { BackgroundLayerAsset } from './BackgroundLayerAsset';

export /** @internal */
    interface BackgroundLayerSprite extends BackgroundLayerAsset {
    sprite: TilingSprite;
    spriteCenter: Vector2;

    offset: Vector2;
}
import { TilingSprite } from 'pixi.js';
import { Vector2 } from '../../../Utilities/Vector2';
import { BackgroundLayerAsset } from './BackgroundLayerAsset';

export /** @internal */
    interface BackgroundLayerSprite extends BackgroundLayerAsset {
    sprite: TilingSprite;
    spriteCenter: Vector2;

    offset: Vector2;
}
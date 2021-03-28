import { Asset } from 'Assets/Asset';
import { Vector2 } from 'Utility/Vector2';

export interface BackgroundLayerAsset {
    asset: Asset;

    size: Vector2;

    offset?: Vector2;
}
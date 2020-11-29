import { AABB } from '../Physics/AABB';

export class UIFrame {
    public readonly aabb: AABB;
    public readonly sprite: CanvasImageSource;
    public constructor(aabb: AABB, sprite: CanvasImageSource) {
        this.aabb = aabb;
        this.sprite = sprite;
    }
}
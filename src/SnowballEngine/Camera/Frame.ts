import { Angle } from '../Angle.js';
import { clamp } from '../Helpers.js';
import { Vector2 } from '../Vector2.js';
import { Sprite } from '../Sprite.js';

export class Frame {
    public readonly worldCordinates: Vector2;
    public readonly sprite: Sprite;
    public readonly size: Vector2;
    public readonly rotation: Angle;
    public readonly drawPriority: number;
    public readonly alpha: number;
    public readonly filter: string;
    public readonly rotationPoint?: Vector2;
    public constructor(worldCordinates: Vector2, size: Vector2, sprite: Sprite, rotation: Angle, drawPriority: number, alpha: number, filter: string = 'none', rotationPoint?: Vector2) {
        this.worldCordinates = worldCordinates;
        this.sprite = sprite;
        this.size = size;
        this.rotation = rotation;
        this.drawPriority = drawPriority;
        this.alpha = clamp(0, 1, alpha);
        this.filter = filter;
        this.rotationPoint = rotationPoint;
    }
}
import { Vector2 } from '../Vector2.js';

export class Projection {
    public readonly min: number;
    public readonly max: number;
    public readonly minVertex: Vector2;
    public readonly maxVertex: Vector2;
    public constructor(min: number, max: number, minVertex: Vector2, maxVertex: Vector2) {
        this.min = min;
        this.max = max;
        this.minVertex = minVertex;
        this.maxVertex = maxVertex;
    }
}
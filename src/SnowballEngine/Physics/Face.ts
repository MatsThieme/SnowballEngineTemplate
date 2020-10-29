import { Line } from './Line.js';
import { Vector2 } from '../Vector2.js';

export class Face {
    public v1: Vector2;
    public v2: Vector2;
    public normal: Vector2;
    public line: Line;

    /**
     * 
     * Describes a face / edge of a polygon.
     * 
     */
    public constructor(v1: Vector2, v2: Vector2) {
        this.v1 = v1;
        this.v2 = v2;
        this.normal = v2.clone.sub(v1).perpendicularClockwise.normalize();
        this.line = new Line(v1, v2);
    }
}
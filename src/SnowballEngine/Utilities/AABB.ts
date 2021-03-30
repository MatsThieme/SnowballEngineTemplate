import { Vector2 } from './Vector2';

/** @category Utility */
export class AABB {
    public readonly position: Vector2;
    public readonly halfExtents: Vector2;

    private _top: number;
    private _bottom: number;
    private _left: number;
    private _right: number;

    private _width: number;
    private _height: number;

    public constructor(position = new Vector2(), halfExtents = new Vector2()) {
        this.position = position;
        this.halfExtents = halfExtents;

        this._top = this._bottom = this._left = this._right = this._width = this._height = 0;

        this.calculateSides();
    }

    public get top(): number {
        return this._top;
    }

    public get bottom(): number {
        return this._bottom;
    }

    public get left(): number {
        return this._left;
    }

    public get right(): number {
        return this._right;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public setPosition(position: IVector2): void {
        this.position.copy(position);

        this.calculateSides();
    }

    public setHalfExtents(halfExtents: IVector2): void {
        this.halfExtents.copy(halfExtents);

        this.calculateSides();
    }


    public intersects(other: AABB): boolean {
        return this._left < other._right && this._right > other._left && this._bottom < other._top && this._top > other._bottom;
    }

    public intersectsPoint(point: Vector2): boolean {
        return point.x > this._left && point.x < this._right && point.y < this._top && point.y > this._bottom;
    }

    private calculateSides(): void {
        this._top = this.position.y + this.halfExtents.y;
        this._bottom = this.position.y - this.halfExtents.y;
        this._left = this.position.x - this.halfExtents.x;
        this._right = this.position.x + this.halfExtents.x;

        this._width = this.halfExtents.x * 2;
        this._height = this.halfExtents.y * 2;
    }

    /**
     * 
     * Returns this 
     * 
     */
    public copy(aabb: AABB): AABB {
        this.setPosition(aabb.position);
        this.setHalfExtents(aabb.halfExtents);

        return this;
    }

    public toString(precision?: number): string {
        return `halfExtents: ${this.halfExtents.toString(precision)}, position: ${this.halfExtents.toString(precision)}`;
    }
}
import { Collider } from '../GameObject/Components/Collider';
import { Vector2 } from '../Utilities/Vector2';

/** @category Utility */
export class AABB {
    public readonly size: Vector2;
    public readonly position: Vector2;

    /**
     *
     * Axis Aligned Bounding Box class is used for broadphase collision detection.
     *
     */
    public constructor(size: Vector2, position: Vector2) {
        this.size = size;
        this.position = position;
    }

    /**
     *
     * Returns whether two AABBs intersect.
     *
     */
    public intersects(other: AABB): boolean {
        return this.position.x < other.position.x + other.size.x && this.position.x + this.size.x > other.position.x && this.position.y < other.position.y + other.size.y && this.position.y + this.size.y > other.position.y;
    }

    /**
     *
     * Returns whether the colliders AABBs intersect.
     *
     */
    public static intersects(collider1: Collider, collider2: Collider): boolean {
        return collider1.AABB.intersects(collider2.AABB);
    }

    /**
     *
     * Returns whether a point lies within an AABB.
     *
     */
    public intersectsPoint(point: Vector2): boolean {
        // return this.intersects(new AABB(new Vector2(), point));
        return point.x > this.position.x && point.x < this.position.x + this.size.x && point.y > this.position.y && point.y < this.position.y + this.size.y;
    }

    public toString(precision?: number) {
        return `size: ${this.size.toString(precision)}, position: ${this.position.toString(precision)}`;
    }
}
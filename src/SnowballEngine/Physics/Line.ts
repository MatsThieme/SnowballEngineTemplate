import { Vector2 } from '../Vector2';

export class Line {
    public a: Vector2;
    public b: Vector2;
    public s: Vector2;

    /**
     * 
     * Line describes a line segment from a to b.
     * 
     */
    public constructor(a: Vector2, b: Vector2) {
        this.a = a;
        this.b = b;
        this.s = b.clone.sub(a);
    }

    /**
     * 
     * Returns the point of intersection or undefined if lines are not intersecting.
     * 
     */
    public intersects(other: Line): Vector2 | undefined {
        const abc = Vector2.cross(other.a.clone.sub(this.a), this.s);
        const def = Vector2.cross(other.a.clone.sub(this.a), other.s);
        const ghi = Vector2.cross(this.s, other.s);

        const u = abc / ghi;
        const t = def / ghi;

        if (abc != 0 && t >= 0 && t <= 1 && u >= 0 && u <= 1) return other.a.clone.add(other.s.clone.scale(u));
        else return;
    }

    /**
     * 
     * Returns the shortest distance this to a point.
     * 
     */
    public distanceToPoint(point: Vector2): number {
        if (this.s.magnitude === 0) return point.distance(this.a);

        return point.distance(this.closestPoint(point));
    }

    /**
     * 
     * Returns the closest point on this to an other point.
     * 
     */
    public closestPoint(point: Vector2): Vector2 {
        const distance = Vector2.dot(point.clone.sub(this.a), this.s) / this.s.magnitude;

        if (distance < 0) return this.a;
        else if (distance > 1) return this.b;
        else return this.s.clone.scale(distance).add(this.a);
    }

    /**
     * 
     * Returns an array of intersections of this and a circle.
     * 
     */
    public intersectsCircle(position: Vector2, radius: number): Vector2[] {
        const d = this.b.clone.sub(this.a);
        const f = this.a.clone.sub(position);

        const a = Vector2.dot(d, d);
        const b = 2 * Vector2.dot(f, d);
        const c = Vector2.dot(f, f) - radius ** 2;

        let discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            discriminant = Math.sqrt(discriminant);
            const t1 = (-b - discriminant) / (2 * a);
            const t2 = (-b + discriminant) / (2 * a);

            const ret = [];

            if (t1 >= 0 && t1 <= 1) ret.push(d.clone.scale(t1).add(this.a));
            if (t2 >= 0 && t2 <= 1) ret.push(d.clone.scale(t2).add(this.a));

            return ret;
        }

        return [];
    }
}



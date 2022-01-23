import { Range } from "./Range";
import { Vector2 } from "./Vector2";

/** @category Utility */
export class Angle {
    private static readonly _2pi: number = Math.PI * 2;

    private _radian?: number;
    private _degree?: number;

    /**
     * Helper class to simplify the mixed use of radian and degree.
     */
    public constructor(radian?: number, degree?: number) {
        this._radian = 0;
        this._degree = 0;
        if (radian) this.radian = radian;
        if (degree) this.degree = degree;
    }

    public get radian(): number {
        if (typeof this._radian === "number") {
            return this._radian;
        } else if (typeof this._degree === "number") {
            return (this._radian = ((this._degree * Math.PI) / 180) % Angle._2pi);
        }

        return (this._radian = this._degree = 0);
    }
    public set radian(val: number) {
        this._radian = Angle.normalizeRadian(val);
        this._degree = undefined;
    }

    public get degree(): number {
        if (typeof this._degree === "number") {
            return this._degree;
        } else if (typeof this._radian === "number") {
            return (this._degree = ((this._radian * 180) / Math.PI) % 360);
        }

        return (this._degree = this._radian = 0);
    }
    public set degree(val: number) {
        this._degree = Angle.normalizeDegree(val);
        this._radian = undefined;
    }

    public get clone(): Angle {
        return new Angle(this._radian);
    }

    public static normalizeRadian(radian: number): number {
        radian %= Angle._2pi;
        if (radian < 0) radian += Angle._2pi;
        return radian;
    }

    public static normalizeDegree(deg: number): number {
        deg %= 360;
        if (deg < 0) deg += 360;
        return deg;
    }

    public equal(other: IAngle, tolerance = 0.0000001): boolean {
        return Math.abs(this.radian - other.radian) < tolerance;
    }

    /**
     * Returns this
     */
    public copy(angle: IAngle): Angle {
        this.radian = angle.radian;

        return this;
    }

    public toVector2(): Vector2 {
        return new Vector2(Math.cos(this.radian), Math.sin(this.radian));
    }

    public static get random(): Angle {
        return new Angle(undefined, Math.random() * 360);
    }

    public static randomRange(range: Range<IAngle> = new Range(Angle.min, Angle.max)): Angle {
        return new Angle(Math.random() * (range.max.radian - range.min.radian) + range.min.radian);
    }

    public static get min(): Angle {
        return new Angle();
    }

    public static get max(): Angle {
        return new Angle(6.283185307);
    }
}

import { Vector2 } from './Vector2.js';

export class Angle {
    private _radian?: number;
    private _degree?: number;
    /**
     * 
     * Helper class to simplify the mixed use of radian and degree.
     * 
     */
    public constructor(radian?: number, degree?: number) {
        this._radian = 0;
        this._degree = 0;
        if (radian) this.radian = radian;
        if (degree) this.degree = degree;
    }
    public get radian(): number {
        if (!this._radian && this._degree) this._radian = this._degree * Math.PI / 180;
        return <number>this._radian;
    }
    public set radian(val: number) {
        this._radian = this.normalizeRadian(val);
        this._degree = undefined;
    }
    public get degree(): number {
        if (!this._degree && this._radian) this._degree = this._radian * 180 / Math.PI;
        return <number>this._degree;
    }
    public set degree(val: number) {
        this._degree = this.normalizeDegree(val);
        this._radian = undefined;
    }
    private normalizeRadian(radian: number): number {
        radian %= Math.PI * 2;
        if (radian < 0) radian += Math.PI * 2;
        return radian;
    }
    private normalizeDegree(deg: number): number {
        deg %= 360;
        if (deg < 0) deg += 360;
        return deg;
    }
    public get clone(): Angle {
        return new Angle(this.radian);
    }
    public toVector2(): Vector2 {
        return new Vector2(Math.cos(this.radian), Math.sin(this.radian));
    }
}
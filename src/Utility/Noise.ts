import { lerp } from "./Helpers";

/** @category Utility */
export class Noise {
    private _vs: number[];

    /**
     * Linear interpolation between random values.
     */
    public constructor(vCount: number) {
        this._vs = [];

        for (let i = 0; i < vCount; i++) {
            this._vs[i] = Math.random();
        }
    }

    /**
     * Returns an interpolated value at position x.
     */
    public get(x: number): number {
        const a = ~~x % this._vs.length;
        const b = (a + 1) % this._vs.length;

        return lerp(this._vs[a], this._vs[b], x - ~~x);
    }
}

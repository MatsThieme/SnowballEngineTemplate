import { lerp } from './Helpers.js';

export class Noise {
    private vs: number[];

    /**
     * 
     * Linear interpolation between random values.
     * 
     */
    public constructor(vCount: number) {
        this.vs = [];

        for (let i = 0; i < vCount; i++) {
            this.vs[i] = Math.random();
        }
    }

    /**
     * 
     * Returns an interpolated value at position x.
     * 
     */
    public get(x: number): number {
        const a = ~~x % this.vs.length;
        const b = (a + 1) % this.vs.length;

        return lerp(this.vs[a], this.vs[b], x - ~~x);
    }
}
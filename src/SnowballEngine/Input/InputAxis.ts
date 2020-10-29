import { Vector2 } from '../Vector2.js';

export class InputAxis {
    public values: number[];
    public constructor(values?: number | number[]) {
        if (!values) this.values = [0];
        else if (typeof values === 'number') this.values = [values];
        else this.values = values;
    }

    /**
     * 
     * Vector2 from this.values.
     * 
     */
    public get v2(): Vector2 {
        return new Vector2(this.values[0], this.values[1]);
    }
}
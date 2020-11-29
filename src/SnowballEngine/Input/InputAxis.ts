import { Vector2 } from '../Vector2';

export class InputAxis {
    public values: ReadonlyArray<number>;
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
        return new Vector2(this.values[0] || 0, this.values[1] || 0);
    }
}
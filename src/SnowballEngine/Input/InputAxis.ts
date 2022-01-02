import { Vector2 } from "Utility/Vector2";

/** @category Input */
export class InputAxis {
    public values: readonly number[];
    public activeThreshhold: number;

    public constructor(values?: number | number[]) {
        if (!values) this.values = [0];
        else if (typeof values === "number") this.values = [values];
        else this.values = values;

        this.activeThreshhold = 0.2;
    }

    /**
     *
     * Vector2 from this.values.
     *
     */
    public get v2(): Vector2 {
        return new Vector2(this.values[0] || 0, this.values[1] || 0);
    }

    public get active(): boolean {
        return (
            (this.values.length >= 1 && Math.abs(this.values[0]) >= this.activeThreshhold) ||
            (this.values.length >= 2 && Math.abs(this.values[1]) >= this.activeThreshhold)
        );
    }
}

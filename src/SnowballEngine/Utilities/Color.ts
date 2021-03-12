import { clamp, random } from './Helpers';

export class Color {
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;
    private _rgba?: number;
    private _rgb?: number;
    private _rgbaString?: string;
    private _rgbString?: string;
    private _recalculateColor: boolean;

    public constructor(r = 255, g = 255, b = 255, a = 255) {
        this._r = clamp(0, 255, Math.round(r));
        this._g = clamp(0, 255, Math.round(g));
        this._b = clamp(0, 255, Math.round(b));
        this._a = clamp(0, 255, Math.round(a));
        this._recalculateColor = true;
    }

    /**
     * 
     * Returns a css color string
     * 
     */
    public get rgbaString(): string {
        if (!this._recalculateColor && this._rgbaString) return this._rgbaString;

        this._rgbaString = `rgba(${this._r},${this._g},${this._b},${this._a / 255})`;

        return this._rgbaString;
    }

    /**
     * 
     * Returns a css color string
     * 
     */
    public get rgbString(): string {
        if (!this._recalculateColor && this._rgbString) return this._rgbString;

        this._rgbString = `rgb(${this._r},${this._g},${this._b})`;

        return this._rgbString;
    }

    public get rgba(): number {
        if (this._recalculateColor) {
            this.calculateColor();

            this._rgbaString = '';
            this._rgbString = '';
            this._recalculateColor = false;
        }

        return this._rgba!;
    }

    public get rgb(): number {
        if (this._recalculateColor) {
            this.calculateColor();

            this._rgbaString = '';
            this._rgbString = '';
            this._recalculateColor = false;
        }

        return this._rgb!;
    }

    private calculateColor(): void {
        this._rgb = this._r << 16 | this._g << 8 | this._b;
        this._rgba = this._r * 256 ** 3 + (this._g << 16) + (this._b << 8) + this._a;
    }

    public get r(): number {
        return this._r;
    }
    public set r(val: number) {
        this._r = clamp(0, 255, Math.round(val));
        this._recalculateColor = true;
    }

    public get g(): number {
        return this._g;
    }
    public set g(val: number) {
        this._g = clamp(0, 255, Math.round(val));
        this._recalculateColor = true;
    }

    public get b(): number {
        return this._b;
    }
    public set b(val: number) {
        this._b = clamp(0, 255, Math.round(val));
        this._recalculateColor = true;
    }

    public get a(): number {
        return this._a;
    }
    public set a(val: number) {
        this._a = clamp(0, 255, Math.round(val));
        this._recalculateColor = true;
    }

    public static average(...colors: Color[]): Color {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        for (const c of colors) {
            r += c.r;
            g += c.g;
            b += c.b;
            a += c.a;
        }

        return new Color(r / colors.length, g / colors.length, b / colors.length, a / colors.length);
    }

    public static get red(): Color {
        return new Color(255, 0, 0);
    }

    public static get green(): Color {
        return new Color(0, 255, 0);
    }

    public static get blue(): Color {
        return new Color(0, 0, 255);
    }

    public static get lightblue(): Color {
        return new Color(110, 110, 255);
    }

    public static get yellow(): Color {
        return new Color(255, 235, 0);
    }

    public static get orange(): Color {
        return new Color(255, 195, 0);
    }

    public static get black(): Color {
        return new Color(0, 0, 0);
    }

    public static get darkGrey(): Color {
        return new Color(51, 51, 51);
    }

    public static get grey(): Color {
        return new Color(128, 128, 128);
    }

    public static get white(): Color {
        return new Color(255, 255, 255);
    }

    public static get random(): Color {
        return new Color(random(0, 255), random(0, 255), random(0, 255));
    }
}
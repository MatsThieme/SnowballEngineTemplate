import { clamp, random } from "./Helpers";
import { Range } from "./Range";

/** @category Utility */
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

    /**
     *
     * @param r 0-255
     * @param g 0-255
     * @param b 0-255
     * @param a 0-255
     */
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

            this._rgbaString = "";
            this._rgbString = "";
            this._recalculateColor = false;
        }

        return this._rgba!;
    }
    public set rgba(val: number) {
        this._r = (val >> 24) & 0xff;
        this._g = (val >> 16) & 0xff;
        this._b = (val >> 8) & 0xff;
        this._a = val & 0xff;

        this._recalculateColor = true;
    }

    public get rgb(): number {
        if (this._recalculateColor) {
            this.calculateColor();

            this._rgbaString = "";
            this._rgbString = "";
            this._recalculateColor = false;
        }

        return this._rgb!;
    }
    public set rgb(val: number) {
        this._r = (val >> 16) & 0xff;
        this._g = (val >> 8) & 0xff;
        this._b = val & 0xff;

        this._recalculateColor = true;
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

    public add(color: Color): Color {
        return new Color(this._r + color._r, this._g + color._g, this._b + color._b, this._a + color._a);
    }

    private calculateColor(): void {
        this._rgb = (this._r << 16) | (this._g << 8) | this._b;
        this._rgba = this._r * 256 ** 3 + (this._g << 16) + (this._b << 8) + this._a;
    }

    public get clone(): Color {
        return new Color(this._r, this._g, this._b, this._a);
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

    public static get random(): Color {
        return new Color(random(0, 255), random(0, 255), random(0, 255));
    }

    public static randomRange(range: Range<Color>): Color {
        return new Color(
            random(range.min.r, range.max.r),
            random(range.min.g, range.max.g),
            random(range.min.b, range.max.b),
            random(range.min.a, range.max.a)
        );
    }

    // https://www.w3schools.com/colors/colors_groups.asp
    // Pink Colors

    public static readonly pink: Readonly<Color> = new Color(255, 192, 203);

    public static readonly lightPink: Readonly<Color> = new Color(255, 182, 193);

    public static readonly hotPink: Readonly<Color> = new Color(255, 105, 180);

    public static readonly deepPink: Readonly<Color> = new Color(255, 20, 147);

    public static readonly paleVioletRed: Readonly<Color> = new Color(219, 112, 147);

    public static readonly mediumVioletRed: Readonly<Color> = new Color(199, 21, 133);

    // Purple Colors

    public static readonly lavender: Readonly<Color> = new Color(230, 230, 250);

    public static readonly thistle: Readonly<Color> = new Color(216, 191, 216);

    public static readonly plum: Readonly<Color> = new Color(221, 160, 221);

    public static readonly orchid: Readonly<Color> = new Color(218, 112, 214);

    public static readonly violet: Readonly<Color> = new Color(238, 130, 238);

    public static readonly fuchsia: Readonly<Color> = new Color(255, 0, 255);

    public static readonly magenta: Readonly<Color> = new Color(255, 0, 255);

    public static readonly mediumorchid: Readonly<Color> = new Color(186, 85, 211);

    public static readonly darkorchid: Readonly<Color> = new Color(153, 50, 204);

    public static readonly darkviolet: Readonly<Color> = new Color(148, 0, 211);

    public static readonly blueviolet: Readonly<Color> = new Color(138, 43, 226);

    public static readonly darkmagenta: Readonly<Color> = new Color(139, 0, 139);

    public static readonly purple: Readonly<Color> = new Color(128, 0, 128);

    public static readonly mediumpurple: Readonly<Color> = new Color(147, 112, 219);

    public static readonly mediumslateblue: Readonly<Color> = new Color(123, 104, 238);

    public static readonly slateblue: Readonly<Color> = new Color(106, 90, 205);

    public static readonly darkslateblue: Readonly<Color> = new Color(72, 61, 139);

    public static readonly rebeccapurple: Readonly<Color> = new Color(102, 51, 153);

    public static readonly indigo: Readonly<Color> = new Color(75, 0, 130);

    // Red Colors

    public static readonly lightsalmon: Readonly<Color> = new Color(255, 160, 122);

    public static readonly salmon: Readonly<Color> = new Color(250, 128, 114);

    public static readonly darksalmon: Readonly<Color> = new Color(233, 150, 122);

    public static readonly lightcoral: Readonly<Color> = new Color(240, 128, 128);

    public static readonly indianred: Readonly<Color> = new Color(205, 92, 92);

    public static readonly crimson: Readonly<Color> = new Color(220, 20, 60);

    public static readonly red: Readonly<Color> = new Color(255, 0, 0);

    public static readonly firebrick: Readonly<Color> = new Color(178, 34, 34);

    public static readonly darkred: Readonly<Color> = new Color(139, 0, 0);

    // Orange Colors

    public static readonly orange: Readonly<Color> = new Color(255, 165, 0);

    public static readonly darkorange: Readonly<Color> = new Color(255, 140, 0);

    public static readonly coral: Readonly<Color> = new Color(255, 127, 80);

    public static readonly tomato: Readonly<Color> = new Color(255, 99, 71);

    public static readonly orangered: Readonly<Color> = new Color(255, 69, 0);

    // Yellow Colors

    public static readonly gold: Readonly<Color> = new Color(255, 215, 0);

    public static readonly yellow: Readonly<Color> = new Color(255, 255, 0);

    public static readonly lightyellow: Readonly<Color> = new Color(255, 255, 224);

    public static readonly lemonchiffon: Readonly<Color> = new Color(255, 250, 205);

    public static readonly lightgoldenrodyellow: Readonly<Color> = new Color(250, 250, 210);

    public static readonly papayawhip: Readonly<Color> = new Color(255, 239, 213);

    public static readonly moccasin: Readonly<Color> = new Color(255, 228, 181);

    public static readonly peachpuff: Readonly<Color> = new Color(255, 218, 185);

    public static readonly palegoldenrod: Readonly<Color> = new Color(238, 232, 170);

    public static readonly khaki: Readonly<Color> = new Color(240, 230, 140);

    public static readonly darkkhaki: Readonly<Color> = new Color(189, 183, 107);

    // Green Colors

    public static readonly greenyellow: Readonly<Color> = new Color(173, 255, 47);

    public static readonly chartreuse: Readonly<Color> = new Color(127, 255, 0);

    public static readonly lawngreen: Readonly<Color> = new Color(124, 252, 0);

    public static readonly lime: Readonly<Color> = new Color(0, 255, 0);

    public static readonly limegreen: Readonly<Color> = new Color(50, 205, 50);

    public static readonly palegreen: Readonly<Color> = new Color(152, 251, 152);

    public static readonly lightgreen: Readonly<Color> = new Color(144, 238, 144);

    public static readonly mediumspringgreen: Readonly<Color> = new Color(0, 250, 154);

    public static readonly springgreen: Readonly<Color> = new Color(0, 255, 127);

    public static readonly mediumseagreen: Readonly<Color> = new Color(60, 179, 113);

    public static readonly seagreen: Readonly<Color> = new Color(46, 139, 87);

    public static readonly forestgreen: Readonly<Color> = new Color(34, 139, 34);

    public static readonly green: Readonly<Color> = new Color(0, 128, 0);

    public static readonly darkgreen: Readonly<Color> = new Color(0, 100, 0);

    public static readonly yellowgreen: Readonly<Color> = new Color(154, 205, 50);

    public static readonly olivedrab: Readonly<Color> = new Color(107, 142, 35);

    public static readonly darkolivegreen: Readonly<Color> = new Color(85, 107, 47);

    public static readonly mediumaquamarine: Readonly<Color> = new Color(102, 205, 170);

    public static readonly darkseagreen: Readonly<Color> = new Color(143, 188, 143);

    public static readonly lightseagreen: Readonly<Color> = new Color(32, 178, 170);

    public static readonly darkcyan: Readonly<Color> = new Color(0, 139, 139);

    public static readonly teal: Readonly<Color> = new Color(0, 128, 128);

    // Cyan Colors

    public static readonly aqua: Readonly<Color> = new Color(0, 255, 255);

    public static readonly cyan: Readonly<Color> = new Color(0, 255, 255);

    public static readonly lightcyan: Readonly<Color> = new Color(224, 255, 255);

    public static readonly paleturquoise: Readonly<Color> = new Color(175, 238, 238);

    public static readonly aquamarine: Readonly<Color> = new Color(127, 255, 212);

    public static readonly turquoise: Readonly<Color> = new Color(64, 224, 208);

    public static readonly mediumturquoise: Readonly<Color> = new Color(72, 209, 204);

    public static readonly darkturquoise: Readonly<Color> = new Color(0, 206, 209);

    // Blue Colors

    public static readonly cadetblue: Readonly<Color> = new Color(95, 158, 160);

    public static readonly steelblue: Readonly<Color> = new Color(70, 130, 180);

    public static readonly lightsteelblue: Readonly<Color> = new Color(176, 196, 222);

    public static readonly lightblue: Readonly<Color> = new Color(173, 216, 230);

    public static readonly powderblue: Readonly<Color> = new Color(176, 224, 230);

    public static readonly lightskyblue: Readonly<Color> = new Color(135, 206, 250);

    public static readonly skyblue: Readonly<Color> = new Color(135, 206, 235);

    public static readonly cornflowerblue: Readonly<Color> = new Color(100, 149, 237);

    public static readonly deepskyblue: Readonly<Color> = new Color(0, 191, 255);

    public static readonly dodgerblue: Readonly<Color> = new Color(30, 144, 255);

    public static readonly royalblue: Readonly<Color> = new Color(65, 105, 225);

    public static readonly blue: Readonly<Color> = new Color(0, 0, 255);

    public static readonly mediumblue: Readonly<Color> = new Color(0, 0, 205);

    public static readonly darkblue: Readonly<Color> = new Color(0, 0, 139);

    public static readonly navy: Readonly<Color> = new Color(0, 0, 128);

    public static readonly midnightblue: Readonly<Color> = new Color(25, 25, 112);

    // Brown Colors

    public static readonly cornsilk: Readonly<Color> = new Color(255, 248, 220);

    public static readonly blanchedalmond: Readonly<Color> = new Color(255, 235, 205);

    public static readonly bisque: Readonly<Color> = new Color(255, 228, 196);

    public static readonly navajowhite: Readonly<Color> = new Color(255, 222, 173);

    public static readonly wheat: Readonly<Color> = new Color(245, 222, 179);

    public static readonly burlywood: Readonly<Color> = new Color(222, 184, 135);

    public static readonly tan: Readonly<Color> = new Color(210, 180, 140);

    public static readonly rosybrown: Readonly<Color> = new Color(188, 143, 143);

    public static readonly sandybrown: Readonly<Color> = new Color(244, 164, 96);

    public static readonly goldenrod: Readonly<Color> = new Color(218, 165, 32);

    public static readonly darkgoldenrod: Readonly<Color> = new Color(184, 134, 11);

    public static readonly peru: Readonly<Color> = new Color(205, 133, 63);

    public static readonly chocolate: Readonly<Color> = new Color(210, 105, 30);

    public static readonly olive: Readonly<Color> = new Color(128, 128, 0);

    public static readonly saddlebrown: Readonly<Color> = new Color(139, 69, 19);

    public static readonly sienna: Readonly<Color> = new Color(160, 82, 45);

    public static readonly brown: Readonly<Color> = new Color(165, 42, 42);

    public static readonly maroon: Readonly<Color> = new Color(128, 0, 0);

    // White Colors

    public static readonly white: Readonly<Color> = new Color(255, 255, 255);

    public static readonly snow: Readonly<Color> = new Color(255, 250, 250);

    public static readonly honeydew: Readonly<Color> = new Color(240, 255, 240);

    public static readonly mintcream: Readonly<Color> = new Color(245, 255, 250);

    public static readonly azure: Readonly<Color> = new Color(240, 255, 255);

    public static readonly aliceblue: Readonly<Color> = new Color(240, 248, 255);

    public static readonly ghostwhite: Readonly<Color> = new Color(248, 248, 255);

    public static readonly whitesmoke: Readonly<Color> = new Color(245, 245, 245);

    public static readonly seashell: Readonly<Color> = new Color(255, 245, 238);

    public static readonly beige: Readonly<Color> = new Color(245, 245, 220);

    public static readonly oldlace: Readonly<Color> = new Color(253, 245, 230);

    public static readonly floralwhite: Readonly<Color> = new Color(255, 250, 240);

    public static readonly ivory: Readonly<Color> = new Color(255, 255, 240);

    public static readonly antiquewhite: Readonly<Color> = new Color(250, 235, 215);

    public static readonly linen: Readonly<Color> = new Color(250, 240, 230);

    public static readonly lavenderblush: Readonly<Color> = new Color(255, 240, 245);

    public static readonly mistyrose: Readonly<Color> = new Color(255, 228, 225);

    // Grey Colors

    public static readonly gainsboro: Readonly<Color> = new Color(220, 220, 220);

    public static readonly lightgray: Readonly<Color> = new Color(211, 211, 211);

    public static readonly silver: Readonly<Color> = new Color(192, 192, 192);

    public static readonly darkgray: Readonly<Color> = new Color(169, 169, 169);

    public static readonly dimgray: Readonly<Color> = new Color(105, 105, 105);

    public static readonly gray: Readonly<Color> = new Color(128, 128, 128);

    public static readonly lightslategray: Readonly<Color> = new Color(119, 136, 153);

    public static readonly slategray: Readonly<Color> = new Color(112, 128, 144);

    public static readonly darkslategray: Readonly<Color> = new Color(47, 79, 79);

    public static readonly black: Readonly<Color> = new Color(0, 0, 0);
}

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

    public static get pink(): Color {
        return new Color(255, 192, 203);
    }

    public static get lightPink(): Color {
        return new Color(255, 182, 193);
    }

    public static get hotPink(): Color {
        return new Color(255, 105, 180);
    }

    public static get deepPink(): Color {
        return new Color(255, 20, 147);
    }

    public static get paleVioletRed(): Color {
        return new Color(219, 112, 147);
    }

    public static get mediumVioletRed(): Color {
        return new Color(199, 21, 133);
    }

    // Purple Colors

    public static get lavender(): Color {
        return new Color(230, 230, 250);
    }

    public static get thistle(): Color {
        return new Color(216, 191, 216);
    }

    public static get plum(): Color {
        return new Color(221, 160, 221);
    }

    public static get orchid(): Color {
        return new Color(218, 112, 214);
    }

    public static get violet(): Color {
        return new Color(238, 130, 238);
    }

    public static get fuchsia(): Color {
        return new Color(255, 0, 255);
    }

    public static get magenta(): Color {
        return new Color(255, 0, 255);
    }

    public static get mediumorchid(): Color {
        return new Color(186, 85, 211);
    }

    public static get darkorchid(): Color {
        return new Color(153, 50, 204);
    }

    public static get darkviolet(): Color {
        return new Color(148, 0, 211);
    }

    public static get blueviolet(): Color {
        return new Color(138, 43, 226);
    }

    public static get darkmagenta(): Color {
        return new Color(139, 0, 139);
    }

    public static get purple(): Color {
        return new Color(128, 0, 128);
    }

    public static get mediumpurple(): Color {
        return new Color(147, 112, 219);
    }

    public static get mediumslateblue(): Color {
        return new Color(123, 104, 238);
    }

    public static get slateblue(): Color {
        return new Color(106, 90, 205);
    }

    public static get darkslateblue(): Color {
        return new Color(72, 61, 139);
    }

    public static get rebeccapurple(): Color {
        return new Color(102, 51, 153);
    }

    public static get indigo(): Color {
        return new Color(75, 0, 130);
    }

    // Red Colors

    public static get lightsalmon(): Color {
        return new Color(255, 160, 122);
    }

    public static get salmon(): Color {
        return new Color(250, 128, 114);
    }

    public static get darksalmon(): Color {
        return new Color(233, 150, 122);
    }

    public static get lightcoral(): Color {
        return new Color(240, 128, 128);
    }

    public static get indianred(): Color {
        return new Color(205, 92, 92);
    }

    public static get crimson(): Color {
        return new Color(220, 20, 60);
    }

    public static get red(): Color {
        return new Color(255, 0, 0);
    }

    public static get firebrick(): Color {
        return new Color(178, 34, 34);
    }

    public static get darkred(): Color {
        return new Color(139, 0, 0);
    }

    // Orange Colors

    public static get orange(): Color {
        return new Color(255, 165, 0);
    }

    public static get darkorange(): Color {
        return new Color(255, 140, 0);
    }

    public static get coral(): Color {
        return new Color(255, 127, 80);
    }

    public static get tomato(): Color {
        return new Color(255, 99, 71);
    }

    public static get orangered(): Color {
        return new Color(255, 69, 0);
    }

    // Yellow Colors

    public static get gold(): Color {
        return new Color(255, 215, 0);
    }

    public static get yellow(): Color {
        return new Color(255, 255, 0);
    }

    public static get lightyellow(): Color {
        return new Color(255, 255, 224);
    }

    public static get lemonchiffon(): Color {
        return new Color(255, 250, 205);
    }

    public static get lightgoldenrodyellow(): Color {
        return new Color(250, 250, 210);
    }

    public static get papayawhip(): Color {
        return new Color(255, 239, 213);
    }

    public static get moccasin(): Color {
        return new Color(255, 228, 181);
    }

    public static get peachpuff(): Color {
        return new Color(255, 218, 185);
    }

    public static get palegoldenrod(): Color {
        return new Color(238, 232, 170);
    }

    public static get khaki(): Color {
        return new Color(240, 230, 140);
    }

    public static get darkkhaki(): Color {
        return new Color(189, 183, 107);
    }

    // Green Colors

    public static get greenyellow(): Color {
        return new Color(173, 255, 47);
    }

    public static get chartreuse(): Color {
        return new Color(127, 255, 0);
    }

    public static get lawngreen(): Color {
        return new Color(124, 252, 0);
    }

    public static get lime(): Color {
        return new Color(0, 255, 0);
    }

    public static get limegreen(): Color {
        return new Color(50, 205, 50);
    }

    public static get palegreen(): Color {
        return new Color(152, 251, 152);
    }

    public static get lightgreen(): Color {
        return new Color(144, 238, 144);
    }

    public static get mediumspringgreen(): Color {
        return new Color(0, 250, 154);
    }

    public static get springgreen(): Color {
        return new Color(0, 255, 127);
    }

    public static get mediumseagreen(): Color {
        return new Color(60, 179, 113);
    }

    public static get seagreen(): Color {
        return new Color(46, 139, 87);
    }

    public static get forestgreen(): Color {
        return new Color(34, 139, 34);
    }

    public static get green(): Color {
        return new Color(0, 128, 0);
    }

    public static get darkgreen(): Color {
        return new Color(0, 100, 0);
    }

    public static get yellowgreen(): Color {
        return new Color(154, 205, 50);
    }

    public static get olivedrab(): Color {
        return new Color(107, 142, 35);
    }

    public static get darkolivegreen(): Color {
        return new Color(85, 107, 47);
    }

    public static get mediumaquamarine(): Color {
        return new Color(102, 205, 170);
    }

    public static get darkseagreen(): Color {
        return new Color(143, 188, 143);
    }

    public static get lightseagreen(): Color {
        return new Color(32, 178, 170);
    }

    public static get darkcyan(): Color {
        return new Color(0, 139, 139);
    }

    public static get teal(): Color {
        return new Color(0, 128, 128);
    }

    // Cyan Colors

    public static get aqua(): Color {
        return new Color(0, 255, 255);
    }

    public static get cyan(): Color {
        return new Color(0, 255, 255);
    }

    public static get lightcyan(): Color {
        return new Color(224, 255, 255);
    }

    public static get paleturquoise(): Color {
        return new Color(175, 238, 238);
    }

    public static get aquamarine(): Color {
        return new Color(127, 255, 212);
    }

    public static get turquoise(): Color {
        return new Color(64, 224, 208);
    }

    public static get mediumturquoise(): Color {
        return new Color(72, 209, 204);
    }

    public static get darkturquoise(): Color {
        return new Color(0, 206, 209);
    }

    // Blue Colors

    public static get cadetblue(): Color {
        return new Color(95, 158, 160);
    }

    public static get steelblue(): Color {
        return new Color(70, 130, 180);
    }

    public static get lightsteelblue(): Color {
        return new Color(176, 196, 222);
    }

    public static get lightblue(): Color {
        return new Color(173, 216, 230);
    }

    public static get powderblue(): Color {
        return new Color(176, 224, 230);
    }

    public static get lightskyblue(): Color {
        return new Color(135, 206, 250);
    }

    public static get skyblue(): Color {
        return new Color(135, 206, 235);
    }

    public static get cornflowerblue(): Color {
        return new Color(100, 149, 237);
    }

    public static get deepskyblue(): Color {
        return new Color(0, 191, 255);
    }

    public static get dodgerblue(): Color {
        return new Color(30, 144, 255);
    }

    public static get royalblue(): Color {
        return new Color(65, 105, 225);
    }

    public static get blue(): Color {
        return new Color(0, 0, 255);
    }

    public static get mediumblue(): Color {
        return new Color(0, 0, 205);
    }

    public static get darkblue(): Color {
        return new Color(0, 0, 139);
    }

    public static get navy(): Color {
        return new Color(0, 0, 128);
    }

    public static get midnightblue(): Color {
        return new Color(25, 25, 112);
    }

    // Brown Colors

    public static get cornsilk(): Color {
        return new Color(255, 248, 220);
    }

    public static get blanchedalmond(): Color {
        return new Color(255, 235, 205);
    }

    public static get bisque(): Color {
        return new Color(255, 228, 196);
    }

    public static get navajowhite(): Color {
        return new Color(255, 222, 173);
    }

    public static get wheat(): Color {
        return new Color(245, 222, 179);
    }

    public static get burlywood(): Color {
        return new Color(222, 184, 135);
    }

    public static get tan(): Color {
        return new Color(210, 180, 140);
    }

    public static get rosybrown(): Color {
        return new Color(188, 143, 143);
    }

    public static get sandybrown(): Color {
        return new Color(244, 164, 96);
    }

    public static get goldenrod(): Color {
        return new Color(218, 165, 32);
    }

    public static get darkgoldenrod(): Color {
        return new Color(184, 134, 11);
    }

    public static get peru(): Color {
        return new Color(205, 133, 63);
    }

    public static get chocolate(): Color {
        return new Color(210, 105, 30);
    }

    public static get olive(): Color {
        return new Color(128, 128, 0);
    }

    public static get saddlebrown(): Color {
        return new Color(139, 69, 19);
    }

    public static get sienna(): Color {
        return new Color(160, 82, 45);
    }

    public static get brown(): Color {
        return new Color(165, 42, 42);
    }

    public static get maroon(): Color {
        return new Color(128, 0, 0);
    }

    // White Colors

    public static get white(): Color {
        return new Color(255, 255, 255);
    }

    public static get snow(): Color {
        return new Color(255, 250, 250);
    }

    public static get honeydew(): Color {
        return new Color(240, 255, 240);
    }

    public static get mintcream(): Color {
        return new Color(245, 255, 250);
    }

    public static get azure(): Color {
        return new Color(240, 255, 255);
    }

    public static get aliceblue(): Color {
        return new Color(240, 248, 255);
    }

    public static get ghostwhite(): Color {
        return new Color(248, 248, 255);
    }

    public static get whitesmoke(): Color {
        return new Color(245, 245, 245);
    }

    public static get seashell(): Color {
        return new Color(255, 245, 238);
    }

    public static get beige(): Color {
        return new Color(245, 245, 220);
    }

    public static get oldlace(): Color {
        return new Color(253, 245, 230);
    }

    public static get floralwhite(): Color {
        return new Color(255, 250, 240);
    }

    public static get ivory(): Color {
        return new Color(255, 255, 240);
    }

    public static get antiquewhite(): Color {
        return new Color(250, 235, 215);
    }

    public static get linen(): Color {
        return new Color(250, 240, 230);
    }

    public static get lavenderblush(): Color {
        return new Color(255, 240, 245);
    }

    public static get mistyrose(): Color {
        return new Color(255, 228, 225);
    }

    // Grey Colors

    public static get gainsboro(): Color {
        return new Color(220, 220, 220);
    }

    public static get lightgray(): Color {
        return new Color(211, 211, 211);
    }

    public static get silver(): Color {
        return new Color(192, 192, 192);
    }

    public static get darkgray(): Color {
        return new Color(169, 169, 169);
    }

    public static get dimgray(): Color {
        return new Color(105, 105, 105);
    }

    public static get gray(): Color {
        return new Color(128, 128, 128);
    }

    public static get lightslategray(): Color {
        return new Color(119, 136, 153);
    }

    public static get slategray(): Color {
        return new Color(112, 128, 144);
    }

    public static get darkslategray(): Color {
        return new Color(47, 79, 79);
    }

    public static get black(): Color {
        return new Color(0, 0, 0);
    }
}

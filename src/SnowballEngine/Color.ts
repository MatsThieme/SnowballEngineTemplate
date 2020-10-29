import { clamp } from './Helpers.js';

export class Color {
    private r_: number;
    private g_: number;
    private b_: number;
    private a_: number;
    public constructor(r: number = 255, g: number = 255, b: number = 255, a: number = 255) {
        this.r_ = clamp(0, 255, Math.round(r));
        this.g_ = clamp(0, 255, Math.round(g));
        this.b_ = clamp(0, 255, Math.round(b));
        this.a_ = clamp(0, 255, Math.round(a));
    }
    public get colorString(): string {
        let r_ = this.r_.toString(16);
        let g_ = this.g_.toString(16);
        let b_ = this.b_.toString(16);
        let a_ = this.a_.toString(16);

        r_ = r_.length === 1 ? '0' + r_ : r_;
        g_ = g_.length === 1 ? '0' + g_ : g_;
        b_ = b_.length === 1 ? '0' + b_ : b_;
        a_ = a_.length === 1 ? '0' + a_ : a_;

        return '#' + r_ + g_ + b_ + a_;
    }
    public get r() {
        return this.r_;
    }
    public set r(val: number) {
        this.r_ = clamp(0, 255, Math.round(val));
    }
    public get g() {
        return this.g_;
    }
    public set g(val: number) {
        this.g_ = clamp(0, 255, Math.round(val));
    }
    public get b() {
        return this.b_;
    }
    public set b(val: number) {
        this.b_ = clamp(0, 255, Math.round(val));
    }
    public get a() {
        return this.a_;
    }
    public set a(val: number) {
        this.a_ = clamp(0, 255, Math.round(val));
    }
    public static get red() {
        return new Color(255, 0, 0);
    }
    public static get green() {
        return new Color(0, 255, 0);
    }
    public static get blue() {
        return new Color(0, 0, 255);
    }
    public static get yellow() {
        return new Color(255, 235, 0);
    }
    public static get black() {
        return new Color(0, 0, 0);
    }
    public static get grey() {
        return new Color(128, 128, 128);
    }
    public static get white() {
        return new Color(255, 255, 255);
    }
}
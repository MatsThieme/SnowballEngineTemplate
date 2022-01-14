import { Container } from "@pixi/display";
import { ITextStyle, Text as PixiText } from "@pixi/text";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Debug } from "SnowballEngine/Debug";
import { Color } from "Utility/Color";
import { TextEventTypes } from "Utility/Events/EventTypes";
import { Vector2 } from "Utility/Vector2";
import { Renderable } from "./Renderable";

/** @category Component */
export class Text extends Renderable<TextEventTypes> {
    private _text: PixiText;

    private static readonly _defaultStyle: Partial<ITextStyle> = {
        fontFamily: "arial",
    };

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Text);

        this._text = new PixiText("", Text._defaultStyle);
        this.sprite = new Container();
        this.sprite.addChild(this._text);

        this._size.set(0, 1);
    }

    public setStyle(style: Partial<ITextStyle>): void {
        this._text.style = style;
    }

    public get text(): string {
        return this._text.text;
    }
    public set text(val: string) {
        this._text.text = val;
        this.size = this._size;
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._text.tint;

        return color;
    }
    public set tint(val: Color) {
        this._text.tint = val.rgb;
    }

    /**
     *
     * Text size in world units.
     * If x or y are 0, the missing component will be calculated to match the original aspect ratio.
     *
     */
    public override get size(): Vector2 {
        return this._size;
    }
    public override set size(val: Vector2) {
        if (val.x === 0 && val.y === 0) Debug.warn("size === (0, 0)");

        this._text.width = this._text.canvas.width;
        this._text.height = this._text.canvas.height;
        this._text.scale.set(1, 1);

        if (val.x > 0 && val.y > 0) {
            this._text.width = val.x;
            this._text.height = val.y;
        } else if (val.y > 0) {
            const ratio = this._text.width / this._text.height;

            this._text.height = val.y;
            this._text.width = ratio * val.y;
        } else if (val.x > 0) {
            const ratio = this._text.height / this._text.width;

            this._text.height = ratio * val.x;
            this._text.width = val.x;
        }

        this._size.x = this._text.width;
        this._size.y = this._text.height;
    }
}

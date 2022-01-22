import { Container } from "@pixi/display";
import { ITextStyle, Text as PixiText } from "@pixi/text";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Debug } from "SnowballEngine/Debug";
import { Color } from "Utility/Color";
import { Vector2 } from "Utility/Vector2";
import { RenderableContainer, RenderableContainerEventTypes } from "./RenderableContainer";

export type TextEventTypes = {} & RenderableContainerEventTypes;

/** @category Component */
export class Text extends RenderableContainer<TextEventTypes> {
    private _text: PixiText;

    private _size: Vector2;

    private static readonly _defaultStyle: Partial<ITextStyle> = {
        fontFamily: "arial",
    };

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Text);

        this._text = new PixiText("", Text._defaultStyle);
        this.setContainer(new Container());
        this.getContainer().addChild(this._text);

        this._size = new Vector2(0, 1);
    }

    public setStyle(style: Partial<ITextStyle>): void {
        this._text.style = style;
    }

    public get text(): string {
        return this._text.text;
    }
    public set text(val: string) {
        this._text.text = val;
        this.setSize(this._size);
        this.setAnchor(this.getAnchor());
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._text.tint;

        return color;
    }
    public set tint(val: Color) {
        this._text.tint = val.rgb;
    }

    public override setSize(size: Readonly<IVector2>): void {
        if (size.x === 0 && size.y === 0) Debug.warn("size === (0, 0)");

        this._text.width = this._text.canvas.width;
        this._text.height = this._text.canvas.height;
        this._text.scale.set(1, 1);

        if (size.x && size.y) {
            this._text.width = size.x;
            this._text.height = size.y;
        } else if (size.y) {
            const ratio = this._text.width / this._text.height;

            this._text.height = size.y;
            this._text.width = ratio * size.y;
        } else if (size.x) {
            const ratio = this._text.height / this._text.width;

            this._text.height = ratio * size.x;
            this._text.width = size.x;
        }

        this._size.x = this._text.width;
        this._size.y = this._text.height;

        super.setSize(this._size);
    }
}

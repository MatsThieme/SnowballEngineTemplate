import { BitmapText } from "@pixi/text-bitmap";
import { Client } from "SnowballEngine/Client";
import { Input } from "SnowballEngine/Input/Input";
import { Scene } from "SnowballEngine/Scene";
import { UIElementType } from "UI/UIElementType";
import { UIFonts } from "UI/UIFonts";
import { UIMenu } from "UI/UIMenu";
import { AABB } from "Utility/AABB";
import { Color } from "Utility/Color";
import { Vector2 } from "Utility/Vector2";
import { UIElement } from "./UIElement";

/** @category UI */
export class UISelect extends UIElement {
    public readonly value: string;
    /**
     *
     * extend options upwards instead of default downwards
     *
     */
    public extendUp: boolean;

    private readonly _resizeListener: () => void;

    private _extended: boolean;

    private _font?: UIFont;
    private _bitmapText: BitmapText;
    private _labels: Partial<Record<string, BitmapText>>;
    private _width: number;

    public constructor(menu: UIMenu, name: string) {
        super(menu, name, UIElementType.Select);

        this.value = "";
        this.extendUp = false;

        this._extended = false;

        this._bitmapText = new BitmapText("", { fontName: this.font });

        this.container.addChild(this._bitmapText);

        this._labels = {};

        this._width = 0;

        this._resizeListener = (() => {
            this._bitmapText.updateText();
            for (const text of Object.values(this._labels)) text!.updateText();

            this.prepareElements(this._extended);
            this.updateBounds();
        }).bind(this);

        window.addEventListener("resize", this._resizeListener);
    }

    public get font(): UIFont {
        return this._font || this._menu.font || Scene.currentScene.ui.font;
    }
    public set font(val: UIFont) {
        this._bitmapText.fontName = this._font = val;
        this._bitmapText.updateText();

        for (const text of Object.values(this._labels)) {
            text!.fontName = val;
            text!.updateText();
        }
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._bitmapText.tint;

        return color;
    }
    public set tint(val: Color) {
        this._bitmapText.tint = val.rgb;

        for (const text of Object.values(this._labels)) {
            text!.tint = val.rgb;
        }
    }

    public setValue(value: string): void {
        if (this.value === value || !(value in this._labels)) return;

        (<Mutable<UISelect>>this).value = this._bitmapText.text = value;

        if (this.onInput) {
            this.onInput(this);
        }

        this.prepareElements(false);
    }

    protected override updateBounds(): void {
        if (this._backgroundSprite) this._backgroundSprite.visible = false; // ignore background in getLocalBounds()

        const bounds = this.container.getLocalBounds();
        this._scaledPadding.copy(
            new Vector2(Client.resolution.y / Client.resolution.x, 1).scale(this.padding)
        );
        this.aabb.setHalfExtents(
            new Vector2((this._width || bounds.width) / 2, bounds.height / 2).add(this._scaledPadding)
        );

        const topLeft = this.position.clone.sub(
            new Vector2(
                this.alignH * (bounds.width + this._scaledPadding.x * 2),
                this.alignV * (bounds.height + this._scaledPadding.y * 2) -
                    (this.extendUp ? 0 : bounds.height)
            )
        );

        this.container.position.copyFrom(topLeft);

        this.aabb.setPosition(topLeft.add(this.aabb.halfExtents));

        if (this._backgroundSprite) {
            this._backgroundSprite.visible = true;
            this._backgroundSprite.width = this.aabb.width;
            this._backgroundSprite.height = this.aabb.height;
        }
    }

    public override update(): void {
        if (!this.active) return;

        super.update(false);

        if (this.click || (this._extended && !this.down && Input.getButton("Trigger").down)) {
            if (this._extended) {
                if (this.click) {
                    for (const [label, text] of Object.entries(this._labels)) {
                        const aabb = new AABB(
                            new Vector2(
                                this.container.position.x + text!.x + this._width / 2,
                                this.container.position.y + text!.y + text!.height / 2
                            ),
                            new Vector2(this._width / 2 + this.padding.x, text!.height / 2)
                        );

                        if (aabb.intersectsPoint(this.downPosition!)) {
                            this.setValue(label);
                            break;
                        }
                    }
                }

                this._extended = false;

                this.prepareElements(false);
            } else {
                this._extended = true;

                this.prepareElements();
            }

            this.updateBounds();
        }
    }

    /**
     *
     * Position and size the labels, also calculates this._width
     *
     */
    private prepareElements(visible = true): void {
        this._width = 0;
        let i = 0;

        const b = <[string, BitmapText]>["d", this._bitmapText];

        const e = Object.entries(this._labels);

        if (this.extendUp) e.push(b);
        else e.unshift(b);

        for (const [label, text] of e) {
            text!.visible = visible;

            text!.scale.set(Client.resolution.y / Client.resolution.x, 1);

            const style = UIFonts.getStyle(<UIFont>text!.fontName)!;
            const fontSize = <number>style.fontSize;

            const lines = Array.from(label.matchAll(/\n/g)).length + 1;

            const ratio = text!.width / text!.height;

            text!.height = fontSize * lines + fontSize * 0.11;
            text!.width = ratio * fontSize * lines * (1 + 0.2 / lines);

            this._width = Math.max(this._width, text!.width);

            text!.position.y = this._scaledPadding.y + i * text!.height;
            text!.position.x = this._scaledPadding.x;

            i++;
        }

        if (!this._extended) this._bitmapText.position.copyFrom(this._scaledPadding);

        this._bitmapText.visible = true;
    }

    public addLabel(value: string): void {
        if (this._labels[value]) throw new Error(`Can't add label: Label exists`);

        const text = new BitmapText(value, { fontName: this.font, tint: this.tint.rgb });
        text.visible = false;

        this._labels[value] = text;

        this.container.addChild(text);

        if (!this.value) this.setValue(value);

        this.prepareElements(false);
        this.updateBounds();
    }

    public removeLabel(value: string): void {
        if (!this._labels[value]) throw new Error(`Can't remove label: Label does not exist`);

        const text = new BitmapText(value, { fontName: this.font });

        this._labels[value] = text;

        this.container.addChild(text);
    }

    public override destroy(): void {
        window.removeEventListener("resize", this._resizeListener);

        super.destroy();
    }
}

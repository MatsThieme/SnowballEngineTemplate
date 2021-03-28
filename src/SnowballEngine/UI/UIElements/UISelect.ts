import { BitmapText } from '@pixi/text-bitmap';
import { Client } from 'SnowballEngine/Client';
import { Input } from 'SnowballEngine/Input/Input';
import { Scene } from 'SnowballEngine/Scene';
import { UIElementType } from 'UI/UIElementType';
import { UIFonts } from 'UI/UIFonts';
import { UIMenu } from 'UI/UIMenu';
import { Color } from 'Utility/Color';
import { Vector2 } from 'Utility/Vector2';
import { _AABB } from 'Utility/_AABB';
import { UIElement } from './UIElement';

/** @category UI */
export class UISelect extends UIElement {
    public readonly value: string;

    private readonly _resizeListener: () => void;

    private _extended: boolean;

    private _font?: UIFont;
    private _bitmapText: BitmapText;
    private _labels: Map<string, BitmapText>;
    private _width: number;

    public constructor(menu: UIMenu) {
        super(menu, UIElementType.Select);

        this.value = '';
        this._extended = false;

        this._bitmapText = new BitmapText('', { fontName: this.font });

        this.container.addChild(this._bitmapText);

        this._labels = new Map();

        this._width = 0;

        this._resizeListener = (() => {
            this._bitmapText.updateText();
            for (const text of this._labels.values()) text.updateText();

            if (this._extended) this.prepareElements();
        }).bind(this);

        window.addEventListener('resize', this._resizeListener);
    }

    public get font(): UIFont {
        return this._font || this._menu.font || Scene.currentScene.ui.font;
    }
    public set font(val: UIFont) {
        this._bitmapText.fontName = this._font = val;
        this._bitmapText.updateText();

        for (const [label, text] of this._labels) {
            text.fontName = val;
            text.updateText();
        }
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._bitmapText.tint;

        return color;
    }
    public set tint(val: Color) {
        this._bitmapText.tint = val.rgb;

        for (const [label, text] of this._labels) {
            text.tint = val.rgb;
        }
    }

    public setValue(value: string): void {
        if (this.value === value) return;

        (<Mutable<UISelect>>this).value = this._bitmapText.text = value;
        console.log(value);
    }

    protected updateBounds(): void {
        if (this._backgroundSprite) this._backgroundSprite.visible = false; // ignore background in getLocalBounds()

        const bounds = this.container.getLocalBounds();
        this._scaledPadding.copy(this.padding.clone.scale(new Vector2(Client.resolution.y / Client.resolution.x, 1)));
        this.aabb.setHalfExtents(new Vector2((this._width || bounds.width) / 2, bounds.height / 2).add(this._scaledPadding));

        const topLeft = this.position.clone.sub(new Vector2(this.alignH * (bounds.width + this._scaledPadding.x * 2), this.alignV * (bounds.height + this._scaledPadding.y * 2)));

        this.container.position.copyFrom(topLeft);

        this.aabb.setPosition(topLeft.add(this.aabb.halfExtents));


        if (this._backgroundSprite) {
            this._backgroundSprite.visible = true;
            this._backgroundSprite.width = this.aabb.width;
            this._backgroundSprite.height = this.aabb.height;
        }
    }

    public update(): boolean {
        if (!super.update()) return false;


        this._bitmapText.scale.set(Client.resolution.y / Client.resolution.x, 1);

        this._bitmapText.position.copyFrom(this._scaledPadding);

        const style = UIFonts.getStyle(<UIFont>this._bitmapText.fontName)!;
        const fontSize = <number>style.fontSize;

        const lines = [...this._bitmapText.text.matchAll(/\n/g)].length + 1;


        const ratio = this._bitmapText.width / this._bitmapText.height;

        this._bitmapText.height = fontSize * lines + fontSize * 0.11;
        this._bitmapText.width = ratio * fontSize * lines * (1 + 0.2 / lines);

        if (this.click || (this._extended && !this.down && Input.getButton('Trigger').down)) {
            if (this._extended) {
                if (this.click) {
                    for (const [label, text] of this._labels) {
                        const aabb = new _AABB(new Vector2(this.container.position.x + text.x + this._width / 2, this.container.position.y + text.y + text.height / 2), new Vector2(this._width / 2 + this.padding.x, text.height / 2));

                        if (aabb.intersectsPoint(this.downPosition!)) {
                            this.setValue(label);
                            break;
                        }
                    }
                }

                this._extended = false;

                for (const [label, text] of this._labels) {
                    text.visible = false;
                }
            } else {
                this._extended = true;

                this.prepareElements();
            }
        }

        return true;
    }

    /**
     * 
     * Position and size the labels, also calculates this._width
     * 
     */
    private prepareElements(visible = true): void {
        this._width = 0;
        let i = 0;

        for (const [label, text] of this._labels) {
            text.visible = visible;

            text.scale.set(Client.resolution.y / Client.resolution.x, 1);

            text.position.copyFrom(this._scaledPadding);

            const style = UIFonts.getStyle(<UIFont>text.fontName)!;
            const fontSize = <number>style.fontSize;

            const lines = [...label.matchAll(/\n/g)].length + 1;


            const ratio = text.width / text.height;

            text.height = fontSize * lines + fontSize * 0.11;
            text.width = ratio * fontSize * lines * (1 + 0.2 / lines);

            this._width = Math.max(this._width, text.width);

            text.position.y = this._bitmapText.position.y + (i + 1) * text.height;
            text.position.x = this._scaledPadding.x;

            i++;
        }
    }

    public addLabel(value: string): void {
        if (this._labels.get(value)) throw new Error(`Can't add label: Label exists`);

        const text = new BitmapText(value, { fontName: this.font, tint: this.tint.rgb });
        text.visible = false;

        this._labels.set(value, text);

        this.container.addChild(text);

        if (!this.value) this.setValue(value);

        this.prepareElements(false);
    }

    public removeLabel(value: string): void {
        if (!this._labels.get(value)) throw new Error(`Can't remove label: Label does not exist`);

        const text = new BitmapText(value, { fontName: this.font });

        this._labels.set(value, text);

        this.container.addChild(text);
    }

    public destroy(): void {
        window.removeEventListener('resize', this._resizeListener);

        super.destroy();
    }
}
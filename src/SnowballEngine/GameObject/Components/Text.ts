import { Container } from '@pixi/display';
import { TextStyleAlign } from '@pixi/text';
import { BitmapText } from '@pixi/text-bitmap';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Debug } from 'SnowballEngine/Debug';
import { Color } from 'Utility/Color';
import { TextEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Renderable } from './Renderable';

/** @category Component */
export class Text extends Renderable<TextEventTypes>{
    private _bitmapText: BitmapText;

    private readonly _resizeListener: () => void;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Text);

        this._bitmapText = new BitmapText('', { fontName: 'Default-Normal' });

        this.sprite = new Container();
        this.sprite.addChild(this._bitmapText);

        this._size.set(0, 1);

        this._resizeListener = (() => this._bitmapText.updateText()).bind(this);
        window.addEventListener('resize', this._resizeListener);
    }

    public get font(): UIFont {
        return <UIFont>this._bitmapText.fontName;
    }
    public set font(val: UIFont) {
        this._bitmapText.fontName = val;
        this._bitmapText.updateText();
        this.size = this._size;
    }

    public get text(): string {
        return this._bitmapText.text;
    }
    public set text(val: string) {
        this._bitmapText.text = val;
        this.size = this._size;
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._bitmapText.tint;

        return color;
    }
    public set tint(val: Color) {
        this._bitmapText.tint = val.rgb;
    }

    /**
     * 
     * Multiline text align.
     * 
     */
    public get textAlign(): TextStyleAlign {
        return <TextStyleAlign>this._bitmapText.align;
    }
    public set textAlign(val: TextStyleAlign) {
        this._bitmapText.align = val;
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
        if (val.x === 0 && val.y === 0) Debug.warn('size === (0, 0)');

        this._bitmapText.scale.set(1, 1);

        if (val.x > 0 && val.y > 0) {
            this._bitmapText.width = val.x;
            this._bitmapText.height = val.y;
        } else if (val.y > 0) {
            const ratio = this._bitmapText.width / this._bitmapText.height;

            this._bitmapText.height = val.y;
            this._bitmapText.width = ratio * val.y;
        } else if (val.x > 0) {
            const ratio = this._bitmapText.height / this._bitmapText.width;

            this._bitmapText.height = ratio * val.x;
            this._bitmapText.width = val.x;
        }

        this._size.x = this._bitmapText.width;
        this._size.y = this._bitmapText.height;
    }

    public override destroy(): void {
        window.removeEventListener('resize', this._resizeListener);

        super.destroy();
    }
}
import { Asset } from '../../Assets/Asset.js';
import { AssetType } from '../../Assets/AssetType.js';
import { Client } from '../../Client.js';
import { D } from '../../Debug.js';
import { AlignH, AlignV } from '../../GameObject/Align.js';
import { GameTime } from '../../GameTime.js';
import { createSprite } from '../../Helpers.js';
import { Input } from '../../Input/Input.js';
import { InputType } from '../../Input/InputType.js';
import { AABB } from '../../Physics/AABB.js';
import { Vector2 } from '../../Vector2.js';
import { UIElementType } from '../UIElementType.js';
import { UIFont } from '../UIFont.js';
import { UIFontSize } from '../UIFontSize.js';
import { UIFrame } from '../UIFrame.js';
import { UIMenu } from '../UIMenu.js';

export abstract class UIElement {
    private static nextID: number = 0;

    public readonly id: number;

    protected _aabb: AABB;
    private _label: string;
    private _background?: CanvasImageSource;
    private _fontSize: number;
    private _active: boolean;
    private _color: string;
    private _stroke: boolean;
    private _textShadow: number;
    private _font!: Asset;
    private _padding: Vector2;
    private _resizeAABB: boolean;

    public readonly hover: boolean;
    public readonly click: boolean;
    public readonly down: boolean;

    public localAlignH: AlignH;
    public localAlignV: AlignV;
    public alignH: AlignH;
    public alignV: AlignV;

    public onInput?: (uiElement: this) => any;
    public onHover?: (uiElement: this) => any;

    protected sprite?: CanvasImageSource;
    protected abstract drawCb(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;

    protected menu: UIMenu;
    protected input: Input;

    public readonly type: UIElementType;
    public constructor(menu: UIMenu, input: Input, type: UIElementType, font: Asset = new Asset('', AssetType.Font, 'sans-serif')) {
        this.id = UIElement.nextID++;

        this.menu = menu;
        this.input = input;
        this.type = type;

        this.hover = false;
        this.click = false;
        this.down = false;

        this._aabb = new AABB(new Vector2(1, 1), new Vector2());
        this._label = '';
        this._fontSize = UIFontSize.Medium;
        this._active = true;
        this._color = '#333';
        this._stroke = type !== UIElementType.Text;
        this._textShadow = 0;
        this._padding = new Vector2();
        this._resizeAABB = true;

        this.font = font;

        this.localAlignH = AlignH.Left;
        this.localAlignV = AlignV.Top;
        this.alignH = AlignH.Left;
        this.alignV = AlignV.Top;

        Client.OnResize(this.draw.bind(this));
    }

    /**
     * 
     * Draw the UIElement.
     * 
     */
    public draw(): void {
        this.sprite = <CanvasImageSource>createSprite(this.drawCb.bind(this)).data;
        (<any>this).menu.redraw = true;
    }

    /**
     * 
     * Update down and click properties.
     * 
     */
    public async update(gameTime: GameTime): Promise<void> {
        if (!this.active) return;

        const trigger = this.input.getButton(InputType.Trigger);

        const p = this.input.getAxis(InputType.PointerPosition);

        const intersects = this.aabbpx.intersectsPoint(p.v2);

        (<any>this).hover = intersects;
        (<any>this).click = trigger.click && intersects;
        (<any>this).down = trigger.down && intersects;

        if (!this.sprite) this.draw();

        //this.draw();
    }

    /**
     * 
     * Adjusts the AABB of this to fit the contents.
     * 
     */
    private fitContent(): void {
        if (this.type === UIElementType.Dropdown) { /*!!!TEST!!!*/
            if ((<any>this).values.length === 0) return;
            const size = new Vector2();

            for (const val of (<any>this).values) {
                const m = UIFont.measureText(val, UIFont.getCSSFontString(<string>this.font.data, this.fontSize));
                if (m.x > size.x) size.x = m.x;
                if (m.y > size.y) size.y = m.y;
            }

            this._aabb = new AABB(new Vector2(Math.max(size.x, 1) + this.padding.x * 2, Math.max(size.y, 1) + this.padding.y * 2 * ((<any>this).values.length + 1)), this._aabb.position);
        } else {
            if (this.label.length === 0) return;

            const m = UIFont.measureText(this.label, UIFont.getCSSFontString(<string>this.font.data, this.fontSize));
            this._aabb = new AABB(new Vector2(Math.max(m.x, 1) + this.padding.x * 2, Math.max(m.y, 1) + this.padding.y * 2), this._aabb.position);
        }

        this.draw();
    }

    /**
     *
     * Absolute aabb of this, align is considered in position property.
     * 
     */
    public get aabb(): AABB {
        const localAlign = new Vector2(this.localAlignH === AlignH.Left ? 0 : this.localAlignH === AlignH.Center ? -this._aabb.size.x / 2 : -this._aabb.size.x, this.localAlignV === AlignV.Top ? 0 : this.localAlignV === AlignV.Center ? -this._aabb.size.y / 2 : -this._aabb.size.y);
        const globalAlign = new Vector2(this.alignH === AlignH.Left ? 0 : this.alignH === AlignH.Center ? 50 : 100, this.alignV === AlignV.Top ? 0 : this.alignV === AlignV.Center ? 50 : 100);

        return new AABB(this._aabb.size, this._aabb.position.clone.add(globalAlign).add(localAlign));
    }
    public set aabb(val: AABB) {
        if (val.size.equal(this._aabb.size) && val.position.equal(this._aabb.position)) return;
        this._aabb = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     *
     * The currently drawn label.
     * 
     */
    public get label(): string {
        return this._label;
    }
    public set label(val: string) {
        this._label = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     * 
     * Fontsize in % of Client.resolution.magnitude.
     * 
     */
    public get fontSize(): number {
        return this._fontSize;
    }
    public set fontSize(val: number) {
        this._fontSize = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     * 
     * Enable or disable this UIElement.
     * 
     */
    public get active(): boolean {
        return this._active;
    }
    public set active(val: boolean) {
        this._active = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     * 
     * Color of text and stroke.
     *
     */
    public get color(): string {
        return this._color;
    }
    public set color(val: string) {
        this._color = val;
        this.draw();
    }

    /**
     * 
     * Stroke the UIElement
     *
     */
    public get stroke(): boolean {
        return this._stroke;
    }
    public set stroke(val: boolean) {
        this._stroke = val;
        this.draw();
    }

    /**
     * 
     * Text shadow
     * 
     */
    public get textShadow(): number {
        return this._textShadow;
    }
    public set textShadow(val: number) {
        this._textShadow = val;
        this.draw();
    }

    /**
     * 
     * Padding used when calculating AABB.
     * 
     */
    public get padding(): Vector2 {
        return this._padding;
    }
    public set padding(val: Vector2) {
        this._padding = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     * 
     * Resize AABB to fit contents + padding on change.
     * 
     */
    public get resizeAABB(): boolean {
        return this._resizeAABB;
    }
    public set resizeAABB(val: boolean) {
        this._resizeAABB = val;
        if (this._resizeAABB) this.fitContent();
        this.draw();
    }

    /**
     *
     * The background image of this UIElement.
     * 
     */
    public get background(): CanvasImageSource | undefined {
        return this._background;
    }
    public set background(val: CanvasImageSource | undefined) {
        this._background = val;
        this.draw();
    }

    /**
     * 
     * Font Asset.
     * 
     */
    public set font(font: Asset) {
        if (font.type === AssetType.Font) {
            this._font = font;
        } else {
            this._font = new Asset('', AssetType.Font, 'sans-serif');
            D.warn('Asset not valid Font, using default "sans-serif" font family');
        }
    }
    public get font(): Asset {
        return this._font;
    }

    /**
     * 
     * Calculates the aabb of this in px relative to the viewport.
     * 
     */
    private get aabbpx(): AABB {
        return new AABB(new Vector2(this._aabb.size.x / 100 * (this.menu.aabb.size.x / 100 * Client.resolution.x), this._aabb.size.y / 100 * (this.menu.aabb.size.y / 100 * Client.resolution.y)).round(), new Vector2((this.aabb.position.x / 100 * this.menu.aabb.size.x + this.menu.aabb.position.x) / 100 * Client.resolution.x, (this.aabb.position.y / 100 * this.menu.aabb.size.y + this.menu.aabb.position.y) / 100 * Client.resolution.y).round());
    }

    /**
     * 
     * Remove UIElement from menu.
     * 
     */
    public remove(): void {
        this.menu.removeUIElement(this.id);
    }

    /**
     * 
     * Get the current UIFrame, used internally to pass image data to the CameraManager.
     * 
     * @internal
     * 
     */
    public get currentFrame(): UIFrame {
        return new UIFrame(this.aabb, this.sprite || <CanvasImageSource>createSprite(() => undefined).data);
    }
}
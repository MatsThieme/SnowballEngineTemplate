import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Asset } from 'SnowballEngine/Assets/Asset';
import { AssetType } from 'SnowballEngine/Assets/AssetType';
import { Client } from 'SnowballEngine/Client';
import { AlignH, AlignV } from 'SnowballEngine/GameObject/Align';
import { Destroyable } from 'SnowballEngine/GameObject/Destroy';
import { Input } from 'SnowballEngine/Input/Input';
import { clearObject } from 'SnowballEngine/Utilities/Helpers';
import { Vector2 } from 'SnowballEngine/Utilities/Vector2';
import { _AABB } from 'SnowballEngine/Utilities/_AABB';
import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';

export class UIElement implements Destroyable {
    public readonly id: number;

    public readonly type: UIElementType;

    public readonly container: Container;

    public readonly hover: boolean;
    public readonly click: boolean;
    public readonly down: boolean;

    /**
     * 
     * Position of the pointer in the menu space (0-100,0-100)
     * 
     */
    public readonly downPosition?: Vector2;

    public alignH: AlignH;
    public alignV: AlignV;

    public padding: Vector2;
    public position: Vector2;

    public onInput?: (uiElement: this) => void;
    public onHover?: (uiElement: this) => void;

    private static _nextID = 0;

    protected _menu: UIMenu;
    protected _background?: Asset;

    protected _backgroundSprite?: Sprite;

    public readonly aabb: _AABB;

    protected _scaledPadding: Vector2;

    public constructor(menu: UIMenu, type: UIElementType) {
        this.id = UIElement._nextID++;

        this.type = type;
        this.container = new Container();

        this.hover = false;
        this.click = false;
        this.down = false;

        this.alignH = AlignH.Left;
        this.alignV = AlignV.Top;

        this.padding = new Vector2();

        this.position = new Vector2();

        this._menu = menu;

        this.aabb = new _AABB();

        this._scaledPadding = new Vector2();
    }

    /**
     * 
     * Enable or disable this UIElement.
     * 
     */
    public get active(): boolean {
        return this.container.visible;
    }
    public set active(val: boolean) {
        this.container.visible = val;
    }


    // public abstract get font(): UIFont;
    // public abstract set font(val: UIFont);

    // public abstract get tint(): Color;
    // public abstract set tint(val: Color);

    public get alpha(): number {
        return this.container.alpha;
    }
    public set alpha(val: number) {
        this.container.alpha = val;
    }

    public get zIndex(): number {
        return this.container.zIndex;
    }
    public set zIndex(val: number) {
        this.container.zIndex = val;
        this.container.parent.sortChildren();
    }

    /**
     *
     * The background image of this UIElement.
     * 
     */
    public get background(): Asset | undefined {
        return this._background;
    }
    public set background(val: Asset | undefined) {
        if (val?.type !== AssetType.Image) throw new Error('Asset.type !== AssetType.Image');

        const s = val.getPIXISprite();

        if (!s) throw new Error(`Can't create PIXI.Sprite from Asset`);


        if (this._backgroundSprite) this.container.removeChild(this._backgroundSprite);

        this.container.addChild(s);

        this._backgroundSprite = s;
        this._background = val;

        this._backgroundSprite.zIndex = -1;

        this.container.sortChildren();
    }

    protected updateBounds(): void {
        if (this._backgroundSprite) this._backgroundSprite.visible = false; // ignore background in getLocalBounds()

        const bounds = this.container.getLocalBounds();
        this._scaledPadding.copy(this.padding.clone.scale(new Vector2(Client.resolution.y / Client.resolution.x, 1)));
        this.aabb.setHalfExtents(new Vector2(bounds.width / 2, bounds.height / 2).add(this._scaledPadding));

        const topLeft = this.position.clone.sub(new Vector2(this.alignH * (bounds.width + this._scaledPadding.x * 2), this.alignV * (bounds.height + this._scaledPadding.y * 2)));

        this.container.position.copyFrom(topLeft);

        this.aabb.setPosition(topLeft.add(this.aabb.halfExtents));


        if (this._backgroundSprite) {
            this._backgroundSprite.visible = true;
            this._backgroundSprite.width = this.aabb.width;
            this._backgroundSprite.height = this.aabb.height;
        }
    }

    /**
     * 
     * Update down and click properties, position the content and scale background.
     * 
     */
    public update(): boolean {
        if (!this.active) return false;

        this.updateBounds();


        if (this.type === UIElementType.Text) return true;

        const trigger = Input.getButton('Trigger');

        if (!trigger.down) {
            (<Mutable<UIElement>>this).hover = false;
            (<Mutable<UIElement>>this).click = false;
            (<Mutable<UIElement>>this).down = false;
            (<Mutable<UIElement>>this).downPosition = undefined;
        } else {
            const p = Input.getAxis('PointerPosition');

            (<Mutable<UIElement>>this).downPosition = Vector2.divide(p.v2, Client.resolution).scale(100);

            const intersects = this.aabb.intersectsPoint(this.downPosition!);

            (<Mutable<UIElement>>this).hover = intersects;
            (<Mutable<UIElement>>this).click = intersects && trigger.click;
            (<Mutable<UIElement>>this).down = intersects && trigger.down;
        }

        return true;
    }

    /**
     * 
     * Remove UIElement from menu.
     * 
     */
    public remove(): void {
        this._menu.removeUIElement(this.id);
    }

    public destroy(): void {
        this.container.destroy();
        clearObject(this);
    }
}
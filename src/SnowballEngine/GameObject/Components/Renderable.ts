import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { AlignH, AlignV } from 'GameObject/Align';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Color } from 'Utility/Color';
import { RenderableEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Component } from './Component';

/** @category Component */
export abstract class Renderable<EventTypes extends RenderableEventTypes> extends Component<EventTypes> {
    private _alignH: AlignH;
    private _alignV: AlignV;

    public position: Vector2;

    protected _sprite?: Sprite | Container;
    protected readonly _size: Vector2;
    protected readonly _skew: Vector2;
    protected _tint?: Color;
    private _visible: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Renderable) {
        super(gameObject, type);

        this.position = new Vector2();

        this._visible = true;
        this._size = new Vector2();
        this._skew = new Vector2();

        this._alignH = AlignH.Center;
        this._alignV = AlignV.Center;
        this.updateAnchor();
    }

    protected override onEnable(): void {
        if (this._sprite) {
            this._sprite.visible = this._visible;
        }
    }

    protected override onDisable(): void {
        if (this._sprite) {
            this._sprite.visible = false;
        }
    }

    public get visible(): boolean {
        return this._visible;
    }
    public set visible(val: boolean) {
        this._visible = val;

        if (this._sprite) {
            this._sprite.visible = val && this.active;
        }
    }

    /**
     * 
     * Size relative to this.gameObject.transform
     * 
     */
    public get size(): Vector2 {
        return this._size;
    }
    public set size(val: Vector2) {
        this._size.copy(val);

        if (this._sprite) {
            this._sprite.width = val.x;
            this._sprite.height = val.y;
        }
    }

    public get skew(): Readonly<Vector2> {
        return this._skew;
    }
    public set skew(val: Vector2) {
        this._skew.copy(val);

        if (this._sprite) {
            this._sprite.skew.copyFrom(val);
        }
    }

    public get tint(): Color | undefined {
        return this._tint;
    }
    public set tint(val: Color | undefined) {
        this._tint = val;
        if (this._sprite) (<Sprite>this._sprite).tint = val?.rgb || 0xFFFFFF;
    }

    public get alignH(): AlignH {
        return this._alignH;
    }
    public set alignH(val: AlignH) {
        this._alignH = val;
        this.updateAnchor();
    }

    public get alignV(): AlignV {
        return this._alignV;
    }
    public set alignV(val: AlignV) {
        this._alignV = val;
        this.updateAnchor();
    }

    /**
     * 
     * The PIXI.Sprite or PIXI.Container instance that should be rendered.
     * Deriving class should set this.sprite.
     * 
     */
    public get sprite(): Sprite | Container | undefined {
        return this._sprite;
    }
    public set sprite(val: Sprite | Container | undefined) {
        this.disconnectCamera();

        this._sprite = val;

        if (val) {
            val.interactive = true;
            val.name = this.constructor.name + ' (' + this.componentID + ')';

            if (val.width + val.height !== 0 && this._size.x + this._size.y === 0) this.size = new Vector2(val.width, val.height).setLength(new Vector2(1, 1).magnitude);

            if (this._size.x + this._size.y === 0) this.size = new Vector2(1, 1);

            this.skew = this._skew;
            if (this._tint) (<Sprite>this._sprite)!.tint = this._tint.rgb;


            this.connectCamera();

            this._sprite!.parent.sortChildren();

            this.updateAnchor();
        }
    }

    public get zIndex(): number {
        return this._sprite ? this._sprite.zIndex : 0;
    }
    public set zIndex(val: number) {
        if (this._sprite) {
            this._sprite.zIndex = val;
            this._sprite.parent.sortChildren();
        }
    }

    private connectCamera(): void {
        if (!this._sprite) return;

        this.gameObject.container.addChild(this._sprite);
    }

    private disconnectCamera(): void {
        if (!this._sprite) return;

        this.gameObject.container.removeChild(this._sprite);
    }

    private updateAnchor(): void {
        if (!this._sprite) return;

        const anchor = new Vector2(this.alignH, this.alignV);

        if ('anchor' in this._sprite) {
            this._sprite.anchor.copyFrom(anchor);
            this._sprite.position.copyFrom(this.position.clone.scale(new Vector2(1, -1)));
        } else {
            const bounds = this._sprite.getLocalBounds();

            this._sprite.position.copyFrom(this.position.clone.add(new Vector2(bounds.width, bounds.height).scale(anchor.sub({ x: 1, y: 1 }))));
        }
    }

    public override destroy(): void {
        this.disconnectCamera();

        if (this._sprite) {
            this._sprite.destroy({ children: false, texture: true, baseTexture: false });
            this._sprite = undefined;
        }

        super.destroy();
    }
}
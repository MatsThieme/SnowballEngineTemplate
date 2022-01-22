import { Sprite } from "@pixi/sprite";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { BLEND_MODES } from "pixi.js";
import { BlendModes, Vector2 } from "SE";
import { Color } from "Utility/Color";
import { Component, ComponentEventTypes } from "./Component";

export type RenderableSpriteEventTypes = {} & ComponentEventTypes;

interface SpriteValues {
    zIndex: number;
    tint: Color;
    size: Vector2;
    skew: Vector2;
    position: Vector2;
    anchor: Vector2;
    alpha: number;
    blendMode: BlendModes;
}

/** @category Component */
export abstract class RenderableSprite<
    EventTypes extends RenderableSpriteEventTypes
> extends Component<EventTypes> {
    protected _sprite?: Sprite;

    private _spriteValues: SpriteValues;
    private _visible: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Renderable) {
        super(gameObject, type);

        this._visible = true;

        this._spriteValues = {
            zIndex: 0,
            tint: new Color(),
            size: new Vector2(1, 1),
            skew: new Vector2(),
            position: new Vector2(),
            anchor: new Vector2(0.5, 0.5),
            alpha: 1,
            blendMode: BlendModes.NORMAL,
        };
    }

    private applyValuesToSprite(): void {
        if (!this._sprite) throw new Error("Sprite is not set");

        this._sprite.zIndex = this._spriteValues.zIndex;
        this._sprite.tint = this._spriteValues.tint.rgb;
        this._sprite.alpha = this._spriteValues.alpha;
        this._sprite.blendMode = this._spriteValues.blendMode as unknown as BLEND_MODES;

        this._sprite.width = this._spriteValues.size.x;
        this._sprite.height = this._spriteValues.size.y;

        this._sprite.skew.copyFrom(this._spriteValues.skew);
        this._sprite.position.copyFrom(this._spriteValues.position);
        this._sprite.anchor.copyFrom(this._spriteValues.anchor);
    }

    private applySpriteToValues(): void {
        if (!this._sprite) throw new Error("Sprite is not set");

        this._spriteValues.zIndex = this._sprite.zIndex;
        this._spriteValues.tint.rgb = this._sprite.tint;
        this._spriteValues.alpha = this._sprite.alpha;
        this._spriteValues.blendMode = this._sprite.blendMode as unknown as BlendModes;

        this._spriteValues.size.x = this._sprite.width;
        this._spriteValues.size.y = this._sprite.height;

        this._spriteValues.skew.copy(this._sprite.skew);
        this._spriteValues.position.copy(this._sprite.position);
        this._spriteValues.anchor.copy(this._sprite.anchor);
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

    public getSprite(): Sprite {
        if (!this._sprite) throw new Error("Sprite is not set");

        return this._sprite;
    }
    protected setSprite(sprite: Sprite | undefined): void {
        this.disconnectCamera();

        if (this._sprite) {
            this.applySpriteToValues();
        }

        if (sprite) {
            sprite.name = this.constructor.name + " (" + this.componentID + ")";

            this._sprite = sprite;
            this.applyValuesToSprite();

            this.connectCamera();

            sprite.parent.sortChildren();
        }

        this._sprite = sprite;
    }

    public getVisible(): boolean {
        return this._visible;
    }
    public setVisible(visible: boolean): void {
        this._visible = visible;

        if (this._sprite) {
            this._sprite.visible = visible && this.active;
        }
    }

    public getZIndex(): number {
        if (this._sprite) {
            return this._sprite.zIndex;
        }

        return this._spriteValues.zIndex;
    }
    public setZIndex(zIndex: number): void {
        if (this._sprite) {
            this._sprite.zIndex = zIndex;
            this._sprite.parent.sortChildren();
        } else {
            this._spriteValues.zIndex = zIndex;
        }
    }

    public getTint(): Readonly<Color> {
        if (this._sprite) {
            const color = new Color();
            color.rgb = this._sprite.tint;
            return color;
        }

        return this._spriteValues.tint;
    }
    public setTint(tint: Readonly<Color>): void {
        if (this._sprite) {
            this._sprite.tint = tint.rgb;
        } else {
            this._spriteValues.tint.rgb = tint.rgb;
        }
    }

    public getSize(): Readonly<IVector2> {
        if (this._sprite) {
            return { x: this._sprite.width, y: this._sprite.height };
        }

        return this._spriteValues.size;
    }
    public setSize(size: Readonly<IVector2>): void {
        if (this._sprite) {
            this._sprite.width = size.x;
            this._sprite.height = size.y;
        } else {
            this._spriteValues.size.x = size.x;
            this._spriteValues.size.y = size.y;
        }
    }

    public getSkew(): Readonly<IVector2> {
        if (this._sprite) {
            return this._sprite.skew;
        }

        return this._spriteValues.skew;
    }
    public setSkew(skew: Readonly<IVector2>): void {
        if (this._sprite) {
            this._sprite.skew.copyFrom(skew);
        } else {
            this._spriteValues.skew.x = skew.x;
            this._spriteValues.skew.y = skew.y;
        }
    }

    public getPosition(): Readonly<IVector2> {
        if (this._sprite) {
            return this._sprite.position;
        }

        return this._spriteValues.position;
    }
    public setPosition(position: Readonly<IVector2>): void {
        if (this._sprite) {
            this._sprite.position.copyFrom(position);
        } else {
            this._spriteValues.position.x = position.x;
            this._spriteValues.position.y = position.y;
        }
    }

    public getAnchor(): Readonly<IVector2> {
        if (this._sprite) {
            return this._sprite.anchor;
        }

        return this._spriteValues.anchor;
    }
    public setAnchor(anchor: Readonly<IVector2>): void {
        if (this._sprite) {
            this._sprite.anchor.copyFrom(anchor);
        } else {
            this._spriteValues.anchor.x = anchor.x;
            this._spriteValues.anchor.y = anchor.y;
        }
    }

    public getAlpha(): number {
        if (this._sprite) {
            return this._sprite.alpha;
        }

        return this._spriteValues.alpha;
    }
    public setAlpha(alpha: number): void {
        if (this._sprite) {
            this._sprite.alpha = alpha;
        } else {
            this._spriteValues.alpha = alpha;
        }
    }

    public getBlendMode(): BlendModes {
        if (this._sprite) {
            return this._sprite.blendMode as unknown as BlendModes;
        }

        return this._spriteValues.blendMode;
    }
    public setBlendMode(blendMode: BlendModes): void {
        if (this._sprite) {
            this._sprite.blendMode = blendMode as unknown as BLEND_MODES;
        } else {
            this._spriteValues.blendMode = blendMode;
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

    public override destroy(): void {
        this.disconnectCamera();

        if (this._sprite) {
            this._sprite.destroy({ children: false, texture: true, baseTexture: false });
            this._sprite = undefined;
        }

        super.destroy();
    }
}

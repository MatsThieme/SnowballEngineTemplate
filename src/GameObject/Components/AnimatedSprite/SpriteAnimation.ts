import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Asset } from "Assets/Asset";
import { AssetType } from "Assets/AssetType";
import { Disposable } from "GameObject/Dispose";
import { BLEND_MODES } from "pixi.js";
import { BlendModes as BlendMode } from "Camera/BlendModes";
import { GameTime } from "GameTime";
import { Color } from "Utility/Color";
import { Vector2 } from "Utility/Vector2";

export class SpriteAnimation implements Disposable {
    /**
     * Milliseconds a sprite is shown until it is replaced by another one.
     */
    public swapTime: number;
    public readonly container: Container;

    /**
     * Currently visible Sprite
     */
    public readonly sprite!: Sprite;

    private _assets: readonly Asset[];
    private _sprites: readonly Sprite[];
    private _timer: number;

    public constructor(assets: readonly Asset[] = [], swapTime = 500) {
        if (assets.length === 0) throw new Error("no assets specified");

        this.swapTime = swapTime;

        this.container = new Container();

        this._assets = [];
        this._sprites = [];
        this._timer = 0;

        this.assets = assets;
    }

    public get assets(): readonly Asset[] {
        return this._assets;
    }
    public set assets(val: readonly Asset[]) {
        if (val.length === 0) throw new Error("no assets specified");

        for (const a of val) {
            if (a.type !== AssetType.Image) {
                throw new Error(`Wrong assetType: ${a.type}`);
            }
        }

        this.container.removeChildren();

        this._assets = val;

        this._sprites = val
            .map((a) => a.getPIXISprite()!)
            .filter(Boolean)
            .map((s) => {
                const size = new Vector2(s.width, s.height).setLength(new Vector2(1, 1).magnitude);
                s.width = size.x;
                s.height = size.y;

                s.anchor.set(0.5);

                this.container.addChild(s);

                return s;
            });
    }

    /**
     * Get the first sprites size.
     * Set the magnitude of sprites size.
     */
    public get size(): Vector2 {
        return new Vector2(this._sprites[0].width, this._sprites[0].height);
    }
    public set size(val: Vector2) {
        for (const s of this._sprites) {
            const size = new Vector2(s.width, s.height).setLength(val.magnitude);
            s.width = size.x;
            s.height = size.y;
        }
    }

    public get tint(): Color {
        const c = new Color();
        c.rgb = this._sprites[0]!.tint;

        return c;
    }
    public set tint(val: Color) {
        for (const s of this._sprites) {
            s.tint = val.rgb;
        }
    }

    public get blendMode(): BlendMode {
        return this._sprites[0].blendMode as unknown as BlendMode;
    }
    public set blendMode(val: BlendMode) {
        for (const s of this._sprites) {
            s.blendMode = val as unknown as BLEND_MODES;
        }
    }

    /**
     * Adds the deltaTime to timer property.
     */
    public update(): void {
        const visibleIndex = Math.round(this._timer / (this.swapTime || 1)) % (this._sprites.length || 1);

        this._timer = (this._timer + GameTime.deltaTime) % (this._sprites.length * this.swapTime);

        for (let i = 0; i < this._sprites.length; i++) {
            this._sprites[i].visible = i === visibleIndex;
            if (i === visibleIndex) (<Mutable<SpriteAnimation>>this).sprite = this._sprites[i];
        }
    }

    /**
     * Reset the animation timer.
     */
    public reset(): void {
        this._timer = 0;
    }

    public dispose(): void {
        this.container.destroy({ children: true, texture: true, baseTexture: false });
    }
}

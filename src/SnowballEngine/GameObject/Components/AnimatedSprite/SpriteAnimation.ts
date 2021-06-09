import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Asset } from 'Assets/Asset';
import { AssetType } from 'Assets/AssetType';
import { Disposable } from 'GameObject/Dispose';
import { Debug } from 'SnowballEngine/Debug';
import { GameTime } from 'SnowballEngine/GameTime';

export class SpriteAnimation implements Disposable {
    /**
     * 
     * Milliseconds a sprite is shown until it is replaced by another one.
     * 
     */
    public swapTime: number;
    public readonly container: Container;

    /**
     * 
     * Currently visible Sprite
     * 
     */
    public readonly sprite!: Sprite;

    private _assets: readonly Asset[];
    private _sprites: readonly Sprite[];
    private _timer: number;

    public constructor(assets: readonly Asset[] = [], swapTime = 200) {
        if (assets.length === 0) throw new Error('no assets specified');

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
        if (val.length === 0) throw new Error('no assets specified');

        for (const a of val) {
            if (a.type !== AssetType.Image) {
                throw new Error(`Wrong assetType: ${a.type}`);
            }
        }

        this._assets = val;

        this._sprites = val.map(a => a.getPIXISprite()!).filter(Boolean);

        if (this._sprites.length !== this._assets.length) Debug.warn('could not create pixi sprite for ' + (this._assets.length - this._sprites.length) + ' assets');

        this.container.removeChildren();

        for (const s of this._sprites) {
            this.container.addChild(s);
            s.anchor.set(0.5, 0.5);
        }
    }

    /**
     * 
     * Adds the deltaTime to timer property.
     * 
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
     * 
     * Reset the animation timer.
     * 
     */
    public reset(): void {
        this._timer = 0;
    }

    public dispose(): void {
        this.container.destroy({ children: true, texture: true, baseTexture: false });
    }
}
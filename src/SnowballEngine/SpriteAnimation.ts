import { Container, Sprite } from 'pixi.js';
import { Asset } from './Assets/Asset';
import { AssetType } from './Assets/AssetType';
import { D } from './Debug';
import { GameTime } from './GameTime';

export class SpriteAnimation {
    /**
     * 
     * Milliseconds a sprite is shown until it is replaced by another one.
     * 
     */
    public swapTime: number;
    public readonly container: Container;

    private _assets: readonly Asset[];
    private _sprites: readonly Sprite[];
    private _timer: number;

    public constructor(assets: Asset[] = [], swapTime: number = 200) {
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
        for (const a of val) {
            if (a.type !== AssetType.Image) {
                D.error('Wrong assetType: ' + a.type);
                return;
            }
        }

        this._assets = val;

        this._sprites = val.map(a => a.getPIXISprite()!).filter(Boolean);

        if (this._sprites.length !== this._assets.length) D.warn('could not create pixi sprite for ' + (this._assets.length - this._sprites.length) + ' assets');

        this.container.removeChildren();

        for (const s of this._sprites) {
            this.container.addChild(s);
            s.anchor.set(0.5, 0.5);
        }
    }

    public get visibleIndex(): number {
        return Math.round(this._timer / (this.swapTime || 1)) % (this._sprites.length || 1);
    }

    /**
     * 
     * Currently visible Sprite
     * 
     */
    public get sprite(): Sprite {
        return this._sprites[this.visibleIndex];
    }

    /**
     * 
     * Adds the deltaTime to timer property.
     * 
     */
    public update() {
        if (this._sprites.length === 0) return;

        this._timer = (this._timer + GameTime.deltaTime) % (this._sprites.length * this.swapTime);

        for (let i = 0; i < this._sprites.length; i++) {
            this._sprites[i].visible = i === this.visibleIndex;
        }
    }

    /**
     * 
     * Reset the animation timer.
     * 
     */
    public reset() {
        this._timer = 0;
    }

    public destroy(): void {
        this.container.destroy({ children: true, texture: true, baseTexture: false });
    }
}
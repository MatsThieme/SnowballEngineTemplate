import { Frame } from '../../Camera/Frame.js';
import { GameTime } from '../../GameTime.js';
import { SpriteAnimation } from '../../SpriteAnimation.js';
import { Vector2 } from '../../Vector2.js';
import { AlignH, AlignV } from '../Align.js';
import { Alignable } from '../Alignable.js';
import { Drawable } from '../Drawable.js';
import { GameObject } from '../GameObject.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';
import { Sprite } from '../../Sprite.js';

export class AnimatedSprite extends Component implements Drawable, Alignable {
    public spriteAnimations: { [key: string]: SpriteAnimation };
    private _activeAnimation: string;
    public relativePosition: Vector2;
    public size: Vector2;
    public alignH: AlignH;
    public alignV: AlignV;
    public constructor(gameObject: GameObject, spriteAnimations: { [key: string]: SpriteAnimation } = {}, relativePosition: Vector2 = new Vector2(), size: Vector2 = new Vector2(1, 1), alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center) {
        super(gameObject, ComponentType.AnimatedSprite);
        this.spriteAnimations = spriteAnimations;
        this._activeAnimation = '';
        this.relativePosition = relativePosition;
        this.size = size;
        this.alignH = alignH;
        this.alignV = alignV;
    }
    public get currentFrame(): Frame | undefined {
        const a = this.spriteAnimations[this._activeAnimation];
        return a ? new Frame(this.position, this.scaledSize, new Sprite(a.currentFrame), this.gameObject.transform.rotation, this.gameObject.drawPriority, 1) : undefined;
    }
    public update(gameTime: GameTime): void {
        this.spriteAnimations[this._activeAnimation]?.update(gameTime);
    }

    /**
     * 
     * Set the active animation by index.
     * 
     */
    public set activeAnimation(name: string) {
        if (this.spriteAnimations[name]) {
            this._activeAnimation = name;
            this.spriteAnimations[this._activeAnimation]?.reset();
        }
    }
    public get activeAnimation(): string {
        return this._activeAnimation;
    }
    public get scaledSize(): Vector2 {
        return new Vector2(this.size.x * this.gameObject.transform.scale.x, this.size.y * this.gameObject.transform.scale.y);
    }
    public get position() {
        return Vector2.add(this.relativePosition, this.gameObject.transform.position, this.align);
    }
    public get align(): Vector2 {
        return new Vector2(this.alignH === AlignH.Right ? -this.scaledSize.x : this.alignH === AlignH.Center ? -this.scaledSize.x / 2 : 0, this.alignV === AlignV.Top ? -this.scaledSize.y : this.alignV === AlignV.Center ? -this.scaledSize.y / 2 : 0);
    }
}
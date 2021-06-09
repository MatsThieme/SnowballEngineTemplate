import { Container } from '@pixi/display';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { AnimatedSpriteEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from '../Renderable';
import { SpriteAnimation } from './SpriteAnimation';

/** @category Component */
export class AnimatedSprite extends Renderable<AnimatedSpriteEventTypes> {
    public readonly spriteAnimations: { [key: string]: SpriteAnimation | undefined };

    private _spriteAnimations: { [key: string]: SpriteAnimation };
    private _activeAnimation: string;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AnimatedSprite);

        this.autoResizeContainer = true;

        this.sprite = new Container();

        this._spriteAnimations = {};

        this._activeAnimation = '';

        this.spriteAnimations = <any>new Proxy(this._spriteAnimations, {
            get: (target, prop: string) => target[prop],
            set: (target, prop: string, value: SpriteAnimation | undefined) => {
                const existingAnimation = target[prop].container;

                if (existingAnimation) this.sprite!.removeChild(existingAnimation);

                if (value) {
                    target[prop] = value;

                    this.sprite!.addChild(value.container);

                    if (this._activeAnimation === '') this._activeAnimation = prop;
                } else if (existingAnimation) delete target[prop];

                return true;
            }
        });
    }

    protected override update(): void {
        super.update();

        if (!this.active || !this.sprite || !this._activeAnimation) return;

        this._spriteAnimations[this._activeAnimation].update();
    }

    /**
     * 
     * Set the active animation by index.
     * 
     */
    public set activeAnimation(val: string) {
        if (val in this._spriteAnimations) {
            this._activeAnimation = val;
            this._spriteAnimations[this._activeAnimation].reset();

            for (const anim in this._spriteAnimations) {
                this._spriteAnimations[anim].container.visible = false;
            }

            this._spriteAnimations[this._activeAnimation].container.visible = true;
        }
    }
    public get activeAnimation(): string {
        return this._activeAnimation;
    }
}
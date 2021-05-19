import { Container } from '@pixi/display';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { AnimatedSpriteEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from '../Renderable';
import { SpriteAnimation } from './SpriteAnimation';

/** @category Component */
export class AnimatedSprite extends Renderable<AnimatedSpriteEventTypes> {
    public readonly spriteAnimations: { [key: string]: SpriteAnimation | undefined };

    private _spriteAnimations: Map<string, SpriteAnimation> = new Map();
    private _activeAnimation: string;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AnimatedSprite);

        this.autoResizeContainer = true;

        this.sprite = new Container();

        this._spriteAnimations = new Map();

        this._activeAnimation = '';

        this.spriteAnimations = <any>new Proxy(this._spriteAnimations, {
            get: (target, prop: string) => target.get(prop),
            set: (target, prop: string, value: SpriteAnimation | undefined) => {
                const existingAnimation = target.get(prop)?.container;

                if (existingAnimation) this.sprite!.removeChild(existingAnimation);

                if (value) {
                    target.set(prop, value);

                    this.sprite!.addChild(value.container);

                    if (this._activeAnimation === '') this._activeAnimation = prop;
                } else if (existingAnimation) target.delete(prop);

                return true;
            }
        });
    }

    protected override update(): void {
        super.update();

        if (!this.sprite) return;

        this._spriteAnimations.get(this._activeAnimation)?.update();

        for (const prop in this._spriteAnimations.keys()) {
            const anim = this._spriteAnimations.get(prop);

            if (anim) {
                anim.container.visible = prop === this._activeAnimation;
            }
        }
    }

    /**
     * 
     * Set the active animation by index.
     * 
     */
    public set activeAnimation(val: string) {
        if (this._spriteAnimations.has(val)) {
            this._activeAnimation = val;
            this._spriteAnimations.get(this._activeAnimation)?.reset();
        }
    }
    public get activeAnimation(): string {
        return this._activeAnimation;
    }
}
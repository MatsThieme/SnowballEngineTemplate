import { Container } from "@pixi/display";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { AnimatedSpriteEventTypes } from "Utility/Events/EventTypes";
import { Renderable } from "../Renderable";
import { SpriteAnimation } from "./SpriteAnimation";

/** @category Component */
export class AnimatedSprite extends Renderable<AnimatedSpriteEventTypes> {
    public readonly spriteAnimations: { [key: string]: SpriteAnimation };

    private _activeAnimation: string;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.AnimatedSprite);

        this.sprite = new Container();

        this.spriteAnimations = {};

        this._activeAnimation = "";
    }

    protected override update(): void {
        if (!this.active || !this.sprite) return;
        if (!this._activeAnimation) this.activeAnimation = Object.keys(this.spriteAnimations)[0];

        this.spriteAnimations[this._activeAnimation].update();
    }

    /**
     *
     * Set the active animation by name.
     *
     */
    public set activeAnimation(val: string) {
        if (this._activeAnimation in this.spriteAnimations) {
            this.sprite!.removeChild(this.spriteAnimations[this._activeAnimation].container);
        }

        if (val in this.spriteAnimations) {
            this._activeAnimation = val;
            this.spriteAnimations[this._activeAnimation].reset();

            this.sprite!.addChild(this.spriteAnimations[this._activeAnimation].container);

            for (const anim in this.spriteAnimations) {
                this.spriteAnimations[anim].container.visible = false;
            }

            this.spriteAnimations[this._activeAnimation].container.visible = true;
        } else this._activeAnimation = "";
    }
    public get activeAnimation(): string {
        return this._activeAnimation;
    }
}

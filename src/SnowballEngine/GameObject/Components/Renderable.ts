import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { AlignH, AlignV } from 'GameObject/Align';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { RenderableEventTypes } from 'Utility/Events/EventTypes';
import { Vector2 } from 'Utility/Vector2';
import { Component } from './Component';

/** @category Component */
export abstract class Renderable<EventTypes extends RenderableEventTypes> extends Component<EventTypes> {
    public alignH: AlignH;
    public alignV: AlignV;

    public position: Vector2;

    /**
     * 
     * Only if renderable.sprite is a container!
     * Resize container when a child is added. Set before sprite.
     * 
     */
    public autoResizeContainer: boolean;

    protected _sprite?: Sprite | Container;
    protected _size: Vector2;
    private _visible: boolean;

    /**
     * 
     * Deriving class should set the sprite property
     * 
     */
    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Renderable) {
        super(gameObject, type);

        this._visible = true;
        this._size = new Vector2(0, 0);

        this.alignH = AlignH.Center;
        this.alignV = AlignV.Center;
        this.position = new Vector2();
        this.autoResizeContainer = false;
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
     * Size in world units
     * 
     */
    public get size(): Vector2 {
        return this._size;
    }
    public set size(val: Vector2) {
        this._size = val;

        if (this._sprite) {
            this._sprite.width = val.x;
            this._sprite.height = val.y;
        }
    }

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
            else if (this.autoResizeContainer) {
                val.addListener('childAdded', (c: Sprite | Container) => { if (c.parent.name === val.name) this.resizeContainer(val); });
                val.addListener('removed', () => val.removeAllListeners());
            }

            if (this._size.x + this._size.y === 0) this.size = new Vector2(1, 1);


            this.connectCamera();

            this._sprite!.parent.sortChildren();
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

    private resizeContainer(container: Container) {
        const a = this.getContainerAverageSpriteSize();
        const s = a.clone.scale(Vector2.divide(this.size, a));

        container.width = s.x;
        container.height = s.y;
    }

    private getContainerAverageSpriteSize(container?: Container): Vector2 {
        if ((!this.sprite || !('children' in this.sprite)) && !container) return this.size;

        if (!container) container = this.sprite!;

        const vec = new Vector2();

        for (const c of <(Sprite | Container)[]>container.children) {
            if (c.constructor.name === 'Container') {
                vec.add(this.getContainerAverageSpriteSize(c));
            } else {
                vec.x += c.width / container.scale.x;
                vec.y += c.height / container.scale.y;
            }
        }

        return Vector2.divide(vec, container.children.length);
    }

    private connectCamera(): void {
        if (!this._sprite) return;

        this.gameObject.container.addChild(this._sprite);
    }

    private disconnectCamera(): void {
        if (!this._sprite) return;

        this.gameObject.container.removeChild(this._sprite);
    }

    protected override update(): void {
        if (this._sprite && this.active) {
            const anchor = new Vector2(this.alignH, this.alignV);

            if ('anchor' in this._sprite) {
                this._sprite.anchor.copyFrom(anchor);
                this._sprite.position.copyFrom(this.position.clone.scale(new Vector2(1, -1)));
            } else {
                const bounds = this._sprite.getLocalBounds();

                this._sprite.position.copyFrom(new Vector2().copy(this.position).sub(new Vector2(bounds.width, bounds.height).scale(anchor)));
            }
        }
    }

    public override destroy(): void {
        this.disconnectCamera();

        if (this._sprite) {
            this._sprite.destroy({ children: true, texture: true, baseTexture: false });
            this._sprite = undefined;
        }

        super.destroy();
    }
}
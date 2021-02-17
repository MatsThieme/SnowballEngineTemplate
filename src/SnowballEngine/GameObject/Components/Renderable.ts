import { Container, Sprite } from 'pixi.js';
import { Vector2 } from '../../Vector2';
import { AlignH, AlignV } from '../Align';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Component } from './Component';
import { Transform } from './Transform/Transform';

export abstract class Renderable extends Component {
    private _visible: boolean;
    public alignH: AlignH;
    public alignV: AlignV;

    /** split tilemap into two components then remove this property */
    public position: Vector2;

    /**
     * 
     * Only if renderable.sprite is a container!
     * Resize container when a child is added, has to be set before sprite.
     * 
     */
    public autoResizeContainer: boolean;

    private _sprite?: Sprite | Container;
    private _size: Vector2;

    /**
     * 
     * Deriving class should set the sprite property
     * 
     */
    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Renderable) {
        super(gameObject, type);

        this._visible = true;
        this._size = new Vector2(1, 1);

        this.alignH = AlignH.Center;
        this.alignV = AlignV.Center;
        this.position = new Vector2();
        this.autoResizeContainer = false;
    }

    public onEnable(): void {
        if (this._sprite) {
            this._sprite.visible = this._visible;
        }
    }

    public onDisable(): void {
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

    /**
     * 
     * If sprite is a container
     * 
     */
    protected get sprite(): Sprite | Container | undefined {
        return this._sprite;
    }
    protected set sprite(val: Sprite | Container | undefined) {
        this.disconnectCamera();

        this._sprite = val;

        if (val) {
            val.name = this.constructor.name + ' (' + this.componentId + ')';

            if (val.width + val.height !== 0) this.size = new Vector2(val.width, val.height).setLength(new Vector2(1, 1).magnitude);
            else if (this.autoResizeContainer) {
                val.addListener('childAdded', (c: Sprite | Container) => { if (c.parent.name === val.name) this.resizeContainer(val); });
                val.addListener('removed', () => val.removeAllListeners());
            }

            this.connectCamera();
        }
    }

    public getSpritePosition(): Vector2 {
        if (!this.sprite) return new Vector2();

        return new Vector2().copy(this.sprite.position);
    }

    /**
     * 
     * TODO: review and revise
     * 
     */
    public getSpriteAbsolutePosition(): Vector2 {
        if (!this.sprite) return new Vector2();

        return Transform.toGlobal(Transform.fromPIXI(this.sprite, this.gameObject.transform)).position;
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

    public getAbsoluteSize(): Vector2 {
        const globalTransform = this.gameObject.transform.toGlobal();
        return new Vector2(this.size.x * globalTransform.scale.x, this.size.y * globalTransform.scale.y);
    }

    public update() {
        if (this._sprite && this.active) {
            // update anchor/pivot
            const anchor = new Vector2(this.alignH === AlignH.Left ? 0 : this.alignH === AlignH.Center ? 0.5 : 1, this.alignV === AlignV.Top ? 0 : this.alignV === AlignV.Center ? 0.5 : 1);

            if ('anchor' in this._sprite) {
                this._sprite.anchor.copyFrom(anchor);
                this._sprite.width = this._size.x;
                this._sprite.height = this._size.y;
            }

            this._sprite.position.copyFrom(this.position);
        } 
    }

    public destroy(): void {
        this.disconnectCamera();

        if (this.sprite) {
            this.sprite.destroy({ children: true, texture: true, baseTexture: false });
            this.sprite = undefined;
        }

        super.destroy();
    }
}
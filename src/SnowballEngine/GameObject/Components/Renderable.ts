import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { AlignH, AlignV } from 'GameObject/Align';
import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { Vector2 } from 'Utility/Vector2';
import { Component } from './Component';

/**@category Component */
export abstract class Renderable extends Component {
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

    public get sprite(): Sprite | Container | undefined {
        return this._sprite;
    }
    public set sprite(val: Sprite | Container | undefined) {
        this.disconnectCamera();

        this._sprite = val;

        if (val) {
            val.name = this.constructor.name + ' (' + this.componentId + ')';

            if (val.width + val.height !== 0 && this._size.x + this._size.y === 0) this.size = new Vector2(val.width, val.height).setLength(new Vector2(1, 1).magnitude);
            else if (this.autoResizeContainer) {
                val.addListener('childAdded', (c: Sprite | Container) => { if (c.parent.name === val.name) this.resizeContainer(val); });
                val.addListener('removed', () => val.removeAllListeners());
            }

            if (this._size.x + this._size.y === 0) this.size = new Vector2(1, 1);

            this.connectCamera();
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

    public update(): void {
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
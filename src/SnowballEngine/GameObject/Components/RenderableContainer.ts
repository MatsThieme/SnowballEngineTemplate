import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { Container } from "pixi.js";
import { Vector2 } from "Utility/Vector2";
import { Component, ComponentEventTypes } from "./Component";

export type RenderableContainerEventTypes = {} & ComponentEventTypes;

interface ContainerValues {
    zIndex: number;
    size: Vector2;
    skew: Vector2;
    position: Vector2;
    anchor: Vector2;
    alpha: number;
}

/** @category Component */
export abstract class RenderableContainer<
    EventTypes extends RenderableContainerEventTypes
> extends Component<EventTypes> {
    protected _container?: Container;

    private _containerValues: ContainerValues;
    private _visible: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Renderable) {
        super(gameObject, type);

        this._visible = true;

        this._containerValues = {
            zIndex: 0,
            size: new Vector2(1, 1),
            skew: new Vector2(),
            position: new Vector2(),
            anchor: new Vector2(0.5, 0.5),
            alpha: 1,
        };
    }

    private applyValuesToContainer(): void {
        if (!this._container) throw new Error("Container is not set");

        this._container.zIndex = this._containerValues.zIndex;
        this._container.alpha = this._containerValues.alpha;

        this._container.width = this._containerValues.size.x;
        this._container.height = this._containerValues.size.y;

        this._container.skew.copyFrom(this._containerValues.skew);
        this._container.position.copyFrom(this._containerValues.position);

        this.setAnchor(this._containerValues.anchor);
    }

    private applyContainerToValues(): void {
        if (!this._container) throw new Error("Container is not set");

        this._containerValues.zIndex = this._container.zIndex;
        this._containerValues.alpha = this._container.alpha;

        this._containerValues.size.x = this._container.width;
        this._containerValues.size.y = this._container.height;

        this._containerValues.skew.copy(this._container.skew);
        this._containerValues.position.copy(this._container.position);
    }

    protected override onEnable(): void {
        if (this._container) {
            this._container.visible = this._visible;
        }
    }

    protected override onDisable(): void {
        if (this._container) {
            this._container.visible = false;
        }
    }

    public getContainer(): Container {
        if (!this._container) throw new Error("Container is not set");

        return this._container;
    }
    protected setContainer(container: Container | undefined): void {
        this.disconnectCamera();

        if (this._container) {
            this.applyContainerToValues();
        }

        if (container) {
            container.name = this.constructor.name + " (" + this.componentID + ")";

            this._container = container;
            this.applyValuesToContainer();

            this.connectCamera();

            container.parent.sortChildren();
        }

        this._container = container;
    }

    public getVisible(): boolean {
        return this._visible;
    }
    public setVisible(visible: boolean): void {
        this._visible = visible;

        if (this._container) {
            this._container.visible = visible && this.active;
        }
    }

    public getZIndex(): number {
        if (this._container) {
            return this._container.zIndex;
        }

        return this._containerValues.zIndex;
    }
    public setZIndex(zIndex: number): void {
        if (this._container) {
            this._container.zIndex = zIndex;
            this._container.parent.sortChildren();
        } else {
            this._containerValues.zIndex = zIndex;
        }
    }

    public getSize(): Readonly<IVector2> {
        if (this._container) {
            return { x: this._container.width, y: this._container.height };
        }

        return this._containerValues.size;
    }
    public setSize(size: Readonly<IVector2>): void {
        if (this._container) {
            this._container.width = size.x;
            this._container.height = size.y;
        } else {
            this._containerValues.size.copy(size);
        }
    }

    public getSkew(): Readonly<IVector2> {
        if (this._container) {
            return this._container.skew;
        }

        return this._containerValues.skew;
    }
    public setSkew(skew: Readonly<IVector2>): void {
        if (this._container) {
            this._container.skew.copyFrom(skew);
        } else {
            this._containerValues.skew.copy(skew);
        }
    }

    public getPosition(): Readonly<IVector2> {
        if (this._container) {
            return this._container.position;
        }

        return this._containerValues.position;
    }
    public setPosition(position: Readonly<IVector2>): void {
        if (this._container) {
            this._container.position.copyFrom(position);
        } else {
            this._containerValues.position.copy(position);
        }
    }

    public getAnchor(): Readonly<IVector2> {
        return this._containerValues.anchor;
    }
    public setAnchor(anchor: Readonly<IVector2>): void {
        this._containerValues.anchor.copy(anchor);

        if (this._container) {
            const bounds = this._container.getLocalBounds();

            this._container.pivot.copyFrom({
                x: anchor.x * bounds.width,
                y: anchor.y * bounds.height,
            });
        }
    }

    public getAlpha(): number {
        if (this._container) {
            return this._container.alpha;
        }

        return this._containerValues.alpha;
    }
    public setAlpha(alpha: number): void {
        if (this._container) {
            this._container.alpha = alpha;
        } else {
            this._containerValues.alpha = alpha;
        }
    }

    private connectCamera(): void {
        if (!this._container) return;

        this.gameObject.container.addChild(this._container);
    }
    private disconnectCamera(): void {
        if (!this._container) return;

        this.gameObject.container.removeChild(this._container);
    }

    public override destroy(): void {
        this.disconnectCamera();

        if (this._container) {
            this._container.destroy({ children: false, texture: true, baseTexture: false });
            this._container = undefined;
        }

        super.destroy();
    }
}

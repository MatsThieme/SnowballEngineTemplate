import { ComponentType } from "GameObject/ComponentType";
import { Destroyable } from "GameObject/Destroy";
import { GameObject } from "GameObject/GameObject";
import { Debug } from "SnowballEngine/Debug";
import { EventHandler } from "Utility/Events/EventHandler";
import { EventTarget } from "Utility/Events/EventTarget";
import { Camera } from "./Camera";

export type ComponentEventTypes = {
    awake: [];
    start: [];
    enable: [];
    disable: [];
    destroy: [];
    prerender: [camera: Camera];
    postrender: [camera: Camera];
    earlyupdate: [];
    update: [];
    lateupdate: [];
};

/** @category Component */
export abstract class Component<EventTypes extends ComponentEventTypes>
    extends EventTarget<EventTypes>
    implements Destroyable
{
    private static _nextCID = 0;
    public static readonly components: Component<ComponentEventTypes>[] = [];

    /**
     *
     * A reference to the owning GameObject.
     *
     */
    public readonly gameObject: GameObject;
    public readonly type: ComponentType;
    public readonly componentID: number;

    public readonly __destroyed__: boolean;

    private _active: boolean;

    public __destroyID__?: number;
    public __destroyInFrames__?: number;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Component) {
        super();

        this.gameObject = gameObject;
        this.type = type;
        this.componentID = Component._nextCID++;

        this.__destroyed__ = false;

        this._active = true;

        Component.components.push(this);

        if (this.awake) this.addListener("awake", new EventHandler(this.awake, this));
        if (this.start) this.addListener("start", new EventHandler(this.start, this));
        if (this.onPreRender) this.addListener("prerender", new EventHandler(this.onPreRender, this));
        if (this.onPostRender) this.addListener("postrender", new EventHandler(this.onPostRender, this));
        if (this.onEnable) this.addListener("enable", new EventHandler(this.onEnable, this));
        if (this.onDisable) this.addListener("disable", new EventHandler(this.onDisable, this));
        if (this.earlyUpdate) this.addListener("earlyupdate", new EventHandler(this.earlyUpdate, this));
        if (this.update) this.addListener("update", new EventHandler(this.update, this));
        if (this.lateUpdate) this.addListener("lateupdate", new EventHandler(this.lateUpdate, this));
        if (this.onDestroy) this.addListener("destroy", new EventHandler(this.onDestroy, this));
    }

    /**
     *
     * Enable or disable the functionality of this component.
     *
     */
    public get active(): boolean {
        return this._active;
    }

    public set active(val: boolean) {
        if (this._active === val) return;

        if (this.type === ComponentType.Transform) {
            Debug.warn("A Component of type Transform may can not be inactive");
            return;
        }

        this._active = val;

        if (val) this.dispatchEvent("enable");
        else this.dispatchEvent("disable");
    }

    public prepareDestroy(): void {
        if (
            this.gameObject.__destroyInFrames__ !== undefined &&
            this.__destroyInFrames__ !== undefined &&
            this.gameObject.__destroyInFrames__ > this.__destroyInFrames__
        ) {
            this.__destroyInFrames__ = this.gameObject.__destroyInFrames__;
        } else if (
            this.gameObject.__destroyInFrames__ !== undefined &&
            this.__destroyInFrames__ !== undefined &&
            this.gameObject.__destroyInFrames__ < this.__destroyInFrames__
        ) {
            this.gameObject.__destroyInFrames__ = this.__destroyInFrames__;
        }

        if (this.gameObject.__destroyInFrames__ !== undefined && this.__destroyInFrames__ === undefined) {
            this.__destroyInFrames__ = this.gameObject.__destroyInFrames__;
        } else if (
            this.gameObject.__destroyInFrames__ === undefined &&
            this.__destroyInFrames__ !== undefined
        ) {
            this.gameObject.__destroyInFrames__ = this.__destroyInFrames__;
        }
    }

    /**
     *
     * Remove this from this.gameObject and delete all references.
     *
     */
    public destroy(): void {
        this.dispatchEvent("destroy");

        if (!this.__destroyed__) {
            (<Mutable<Component<ComponentEventTypes>>>this).__destroyed__ = true;
            this.gameObject.removeComponent(this);
        }

        Component.components.splice(
            Component.components.findIndex((c) => c.componentID === this.componentID),
            1
        );
    }

    public static earlyupdate(): void {
        for (const component of Component.components) {
            if (
                component.gameObject.active &&
                component.active &&
                component.type !== ComponentType.Behaviour &&
                component.__destroyInFrames__ === undefined
            )
                component.dispatchEvent("earlyupdate");
        }
    }

    public static update(): void {
        for (const component of Component.components) {
            if (
                component.gameObject.active &&
                component.active &&
                component.type !== ComponentType.Behaviour &&
                component.__destroyInFrames__ === undefined
            )
                component.dispatchEvent("update");
        }
    }

    public static lateupdate(): void {
        for (const component of Component.components) {
            if (
                component.gameObject.active &&
                component.active &&
                component.type !== ComponentType.Behaviour &&
                component.__destroyInFrames__ === undefined
            )
                component.dispatchEvent("lateupdate");
        }
    }

    public static reset(): void {
        this._nextCID = 0;
    }

    /**
     *
     * Called after the behavior has been added to the GameObject.
     *
     */
    protected awake?(): void;

    /**
     *
     * Called on scene start, if scene is running it's called by the constructor.
     *
     */
    protected start?(): void;

    /**
     *
     * Called after component.active is set to false.
     *
     */
    protected onEnable?(): void;

    /**
     *
     * Called after component.active is set to true.
     *
     */
    protected onDisable?(): void;

    /**
     *
     * Called before camera renders.
     *
     */
    protected onPreRender?(renderingCamera: Camera): void;

    /**
     *
     * Called after camera rendered.
     *
     */
    protected onPostRender?(renderingCamera: Camera): void;

    /**
     *
     * Called before any Component is updated.
     *
     */
    protected earlyUpdate?(): void;

    /**
     *
     * Called once every frame.
     *
     */
    protected update?(...args: unknown[]): void;

    /**
     *
     * Called after all Components are updated.
     *
     */
    protected lateUpdate?(): void;

    /**
     *
     * Called before this is destroyed.
     *
     */
    protected onDestroy?(): void;
}

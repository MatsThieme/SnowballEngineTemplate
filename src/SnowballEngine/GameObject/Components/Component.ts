import { ComponentType } from 'GameObject/ComponentType';
import { Destroyable } from 'GameObject/Destroy';
import { GameObject } from 'GameObject/GameObject';
import { Debug } from 'SnowballEngine/Debug';
import { EventHandler } from 'Utility/Events/EventHandler';
import { EventTarget } from 'Utility/Events/EventTarget';
import { ComponentEventTypes } from 'Utility/Events/EventTypes';
import { Camera } from './Camera';

/** @category Component */
export abstract class Component<EventTypes extends ComponentEventTypes> extends EventTarget<EventTypes> implements Destroyable {
    private static _nextCID = 0;

    public readonly gameObject: GameObject;
    public readonly type: ComponentType;
    public readonly componentId: number;

    private _active: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Component) {
        super();

        this.gameObject = gameObject;
        this.type = type;
        this.componentId = Component._nextCID++;

        this._active = true;

        this.addListeners();
    }

    /**
     * 
     * Called in a Deriving constructor.
     * 
     */
    private addListeners(): void {
        if (this.onPreRender) this.addListener('prerender', new EventHandler(this.onPreRender.bind(this)));
        if (this.onPostRender) this.addListener('postrender', new EventHandler(this.onPostRender.bind(this)));
        if (this.onEnable) this.addListener('enable', new EventHandler(this.onEnable.bind(this)));
        if (this.onDisable) this.addListener('disable', new EventHandler(this.onDisable.bind(this)));
        if (this.earlyUpdate) this.addListener('earlyupdate', new EventHandler(this.earlyUpdate.bind(this)));
        if (this.update) this.addListener('update', new EventHandler(this.update.bind(this)));
        if (this.lateUpdate) this.addListener('lateupdate', new EventHandler(this.lateUpdate.bind(this)));
        if (this.onDestroy) this.addListener('destroy', new EventHandler(this.onDestroy.bind(this)));
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
        if (this.type === ComponentType.Transform) {
            Debug.warn(`Can't disable a Transform component`);
            return;
        }

        if (this._active === val) return;

        this._active = val;

        if (val) this.dispatchEvent('enable');
        else this.dispatchEvent('disable');
    }

    /**
     * 
     * Remove this from this.gameObject and delete all references.
     * 
     */
    public destroy(): void {
        this.dispatchEvent('destroy');

        if (this.gameObject) this.gameObject.removeComponent(this);
    }

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
    protected onPreRender?(renderingCamera: Camera): void | Promise<void>;

    /**
    *
    * Called after camera rendered.
    *
    */
    protected onPostRender?(renderingCamera: Camera): void | Promise<void>;


    /**
    *
    * Called before any GameObject is updated.
    *
    */
    protected earlyUpdate?(): void | Promise<void>;

    /**
    *
    * Called once every frame.
    *
    */
    protected update?(...args: unknown[]): void | Promise<void>;

    /**
    *
    * Called after all GameObjects are updated.
    *
    */
    protected lateUpdate?(): void | Promise<void>;

    /**
     * 
     * Called before this is destroyed.
     * 
     */
    protected onDestroy?(): void;
}

export interface Component<EventTypes extends ComponentEventTypes> extends Destroyable { }
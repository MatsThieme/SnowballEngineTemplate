import { ComponentType } from 'GameObject/ComponentType';
import { Destroyable } from 'GameObject/Destroy';
import { GameObject } from 'GameObject/GameObject';
import { Debug } from 'SnowballEngine/Debug';
import { Camera } from './Camera';

/**@category Component */
export abstract class Component implements Destroyable {
    private static _nextCID = 0;

    public readonly gameObject: GameObject;
    public readonly type: ComponentType;
    public readonly componentId: number;

    private _active: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Component) {
        this.gameObject = gameObject;
        this.type = type;
        this.componentId = Component._nextCID++;

        this._active = true;
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

        if (this.onEnable && val) this.onEnable();
        else if (this.onDisable && !val) this.onDisable();
    }

    /**
     * 
     * Remove this from this.gameObject and delete all references.
     * 
     */
    public destroy(): void {
        if (this.onDestroy) this.onDestroy();

        if (this.gameObject) this.gameObject.removeComponent(this);
    }
}

export interface Component extends Destroyable {
    /**
    *
    * Called before camera renders.
    *
    */
    onPreRender?(renderingCamera: Camera): void;

    /**
    *
    * Called after camera rendered.
    *
    */
    onPostRender?(renderingCamera: Camera): void;


    /**
     *
     * Called after component.active is set to false.
     *
     */
    onEnable?(): void;

    /**
    *
    * Called after component.active is set to true.
    *
    */
    onDisable?(): void;


    /**
    *
    * Called once every frame.
    *
    */
    update?(...args: unknown[]): void;

    /**
    *
    * Called after all GameObjects and Components update method is called.
    *
    */
    lateUpdate?(): void;


    /**
    *
    * Called when the Component is removed from the GameObject.
    *
    */
    onDestroy?(): void;
}
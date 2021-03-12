import { clearObject } from '../../Utilities/Helpers';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Camera } from './Camera';

export abstract class Component {
    private static _nextCID = 0;

    public readonly gameObject: GameObject;
    public readonly type: ComponentType;
    public readonly componentId: number;

    private __destroyed__: boolean;
    private _active: boolean;

    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Component) {
        this.gameObject = gameObject;
        this.type = type;
        this.componentId = Component._nextCID++;

        this._active = true;
        this.__destroyed__ = false;
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
        if (this._active === val || this.type === ComponentType.Transform) return;

        this._active = val;

        if (this.onEnable && val) this.onEnable();
        else if (this.onDisable && !val) this.onDisable();
    }

    /**
     * 
     * Remove this from this.gameObject and delete all references.
     * 
     * @param componentHasNoGameObject internally used in gameObject.removeComponent to prevent a second unnecessary call of gameObject.removeComponent
     * 
     */
    public destroy(componentHasNoGameObject = false): void {
        if (this.__destroyed__ === true || this.onDestroy && this.onDestroy() === false) return;

        this.__destroyed__ = true;

        const d = () => {
            if (componentHasNoGameObject) this.gameObject.removeComponent(this.componentId);

            clearObject(this, true);
        }

        if (this.gameObject.scene.isRunning) (<any>this.gameObject.scene).destroyCbs.push(d);
        else d();
    }
}

export interface Component {
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
    update?(...args: any[]): void;

    /**
    *
    * Called after all GameObjects and Components update method is called.
    *
    */
    lateUpdate?(): void;


    /**
    *
    * Called when the Component is removed from the GameObject.
    * Return false to cancel destoy.
    *
    */
    onDestroy?(): boolean;
}
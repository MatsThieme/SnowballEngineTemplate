import { clearObject } from '../../Helpers.js';
import { GameObject } from '../GameObject.js';
import { ComponentType } from './ComponentType.js';

export class Component {
    public gameObject: GameObject;
    public readonly type: ComponentType;
    public readonly componentId: number = Component.nextId++;
    private static nextId: number = 0;
    private destroyed: boolean;
    public constructor(gameObject: GameObject, type: ComponentType = ComponentType.Component) {
        this.gameObject = gameObject;
        this.type = type;
        this.destroyed = false;
    }


    /**
     * 
     * Return false to cancel destoy.
     * 
     */
    protected onDestroy(component: Component): boolean {
        return true;
    }

    /**
     * 
     * Remove this from this.gameObject and delete all references.
     * 
     */
    public destroy(): void {
        if (this.destroyed || !this.onDestroy(this)) return;
        this.destroyed = true;

        (<any>this.gameObject.scene).toDestroy.push(() => {
            this.gameObject.removeComponent(this.componentId);

            clearObject(this, true);
        });
    }
}
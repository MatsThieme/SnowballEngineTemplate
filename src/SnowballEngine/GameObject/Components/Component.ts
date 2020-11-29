import { clearObject } from '../../Helpers';
import { GameObject } from '../GameObject';
import { ComponentType } from './ComponentType';

export class Component {
    public readonly gameObject: GameObject;
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
     * Called when the Component is removed from the GameObject.
     * Return false to cancel destoy.
     *
     */
    protected onDestroy(): boolean {
        return true;
    }

    /**
     * 
     * Remove this from this.gameObject and delete all references.
     * 
     */
    public destroy(): void {
        if (this.destroyed === false || !this.onDestroy()) return;
        this.destroyed = true;

        const d = () => {
            this.gameObject.removeComponent(this.componentId);

            clearObject(this, true);
        }

        if (this.gameObject.scene.isRunning) (<any>this.gameObject.scene).destroyCbs.push(d);
        else d();
    }
}
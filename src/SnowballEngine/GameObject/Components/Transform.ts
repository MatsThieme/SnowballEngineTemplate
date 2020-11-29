import { Angle } from '../../Angle';
import { Vector2 } from '../../Vector2';
import { Component } from '../Components/Component';
import { ComponentType } from '../Components/ComponentType';
import { GameObject } from '../GameObject';

export class Transform extends Component {
    public relativePosition: Vector2;
    public relativeRotation: Angle;
    public relativeScale: Vector2;
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Transform);
        this.relativePosition = new Vector2();
        this.relativeRotation = new Angle();
        this.relativeScale = new Vector2(1, 1);
    }

    /**
     * 
     * Returns the absolute position of the corresponding gameObject.
     *
     */
    public get position(): Vector2 {
        const scaledRP = this.relativePosition.clone.scale(this.scale);
        const angle = -(this.gameObject.parent?.transform.rotation.radian || 0);
        const x = new Vector2(Math.cos(angle) * scaledRP.x - Math.sin(angle) * scaledRP.y, Math.sin(angle) * scaledRP.x + Math.cos(angle) * scaledRP.y);

        return this.gameObject.parent?.transform.position.clone.add(x) || new Vector2(Math.cos(angle) * this.relativePosition.x - Math.sin(angle) * this.relativePosition.y, Math.sin(angle) * this.relativePosition.x + Math.cos(angle) * this.relativePosition.y);
    }

    /**
     *
     * Returns the absolute rotation of the corresponding gameObject.
     *
     */
    public get rotation(): Angle {
        return new Angle((this.gameObject.parent?.transform.rotation.radian || 0) + this.relativeRotation.radian);
    }

    /**
     *
     * Returns the absolute scale of the corresponding gameObject.
     *
     */
    public get scale(): Vector2 {
        return this.gameObject.parent?.transform.scale.clone.scale(this.relativeScale) || this.relativeScale.clone;
    }
}
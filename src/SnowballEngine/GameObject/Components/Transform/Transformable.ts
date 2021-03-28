import { Angle } from 'Utility/Angle';
import { Vector2 } from 'Utility/Vector2';

export interface Transformable {
    position: Vector2;
    rotation: Angle;
    scale: Vector2;
    parent?: Transformable,
    readonly id: number
}
import { Angle } from "../../../Utilities/Angle";
import { Vector2 } from "../../../Utilities/Vector2";

export interface Transformable {
    position: Vector2;
    rotation: Angle;
    scale: Vector2;
    parent?: Transformable,
    readonly id: number
}
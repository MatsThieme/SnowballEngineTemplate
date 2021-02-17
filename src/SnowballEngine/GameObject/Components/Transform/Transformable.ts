import { Angle } from "../../../Angle";
import { Vector2 } from "../../../Vector2";

/** @internal */
export interface Transformable {
    position: Vector2;
    rotation: Angle;
    scale: Vector2;
    parent?: Transformable,
    readonly id: number
}

/**
 * 
 * transfrom2 is the th(thParentOf1) parent of transform1
 * transfrom1 is the th(thParentOf2) parent of transform2
 *
 */
export interface TransformRealation {
    transform1: Transformable,

    /**
    *
    * transfrom2 is the th(thParentOf1) parent of transform1
    *
    */
    thParentOf1?: number,

    transform2: Transformable,

    /**
    *
    * transfrom1 is the th(thParentOf2) parent of transform2
    *
    */
    thParentOf2?: number,
}
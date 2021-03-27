import { Transformable } from './Transformable';

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
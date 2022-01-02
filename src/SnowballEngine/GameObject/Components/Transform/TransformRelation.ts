/**
 *
 * transfrom2 is the th(thParentOf1) parent of transform1
 * transfrom1 is the th(thParentOf2) parent of transform2
 *
 */
export interface TransformRelation {
    transform1: ITransformable;

    /**
     *
     * transfrom2 is the th(thParentOf1) parent of transform1
     *
     */
    thParentOf1?: number;

    transform2: ITransformable;

    /**
     *
     * transfrom1 is the th(thParentOf2) parent of transform2
     *
     */
    thParentOf2?: number;
}

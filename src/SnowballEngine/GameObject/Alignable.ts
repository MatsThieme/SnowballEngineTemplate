import { Vector2 } from '../Vector2.js';
import { AlignH, AlignV } from './Align.js';

export interface Alignable {
    /**
     * 
     * Horizontal align.
     * 
     */
    alignH: AlignH;

    /**
     *
     * Vertical align.
     *
     */
    alignV: AlignV;

    /**
     * 
     * Absolute position.
     * 
     */
    position: Vector2;

    /**
     *
     * Relative positioning to gameObject.
     *
     */
    relativePosition: Vector2;

    /**
     *
     * Getter returning align as Vector.
     *
     */
    align: Vector2;
}
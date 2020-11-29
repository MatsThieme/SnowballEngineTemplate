import { Frame } from '../Camera/Frame';
import { Vector2 } from '../Vector2';

export interface Drawable {
    /**
     * 
     * Returns the current Frame object.
     * 
     */
    readonly currentFrame: Frame | Frame[] | undefined;

    /**
     * 
     * Relative positioning to gameObject.
     * 
     */
    relativePosition: Vector2;

    /**
     * 
     * Absolute position.
     * 
     */
    position: Vector2;

    /**
     * 
     * Absolute scaled size.
     * 
     */
    scaledSize: Vector2;
}
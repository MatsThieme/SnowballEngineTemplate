import { SpriteNew } from '../../SpriteNew';
import { Vector2 } from '../../Vector2';
import { AlignH, AlignV } from '../Align';

export interface Renderable {
    /**
     * 
     * Toggles the visibility by adding and removing to and from PIXI stage.
     * 
     */
    visible: boolean;
    readonly sprite: SpriteNew;
    size: Vector2;
    position: Vector2;
    alignH: AlignH;
    alignV: AlignV;
}
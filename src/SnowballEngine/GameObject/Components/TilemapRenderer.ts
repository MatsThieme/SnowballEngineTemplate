import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { TilemapRendererEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from './Renderable';

/** @category Component */
export class TilemapRenderer extends Renderable<TilemapRendererEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TilemapRenderer);

        throw new Error('not implemented');
    }
}
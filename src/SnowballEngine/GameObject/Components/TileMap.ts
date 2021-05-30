import { ComponentType } from 'GameObject/ComponentType';
import { GameObject } from 'GameObject/GameObject';
import { TileMapEventTypes } from 'Utility/Events/EventTypes';
import { Renderable } from './Renderable';

/** @category Component */
export class TileMap extends Renderable<TileMapEventTypes> {
    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TileMap);
    }


}
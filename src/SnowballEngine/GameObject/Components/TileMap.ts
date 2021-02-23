import { Container } from 'pixi.js';
import { Assets } from '../../Assets/Assets';
import { D } from '../../Debug';
import { AABB } from '../../Physics/AABB';
import { PhysicsMaterial } from '../../Physics/PhysicsMaterial';
import { Vector2 } from '../../Vector2';
import { ComponentType } from '../ComponentType';
import { GameObject } from '../GameObject';
import { Renderable } from './Renderable';

export class TileMap extends Renderable {
    public tileSize: Vector2;
    private _tileMap: (1 | 0)[][];
    public material: PhysicsMaterial;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.TileMap);

        this.sprite = new Container();

        this.tileSize = new Vector2(1, 1);
        this._tileMap = [];
        this.material = new PhysicsMaterial();
    }

    /**
     * 
     * Initialize the tilemap using a 2D array containing image sources.
     * 
     */
    public set tileMap(val: string[][]) {
        this.sprite!.removeChildren();

        this._tileMap = [];

        for (let y = 0; y < val.length; y++) {
            this._tileMap[y] = [];

            for (let x = 0; x < val[0].length; x++) {
                this._tileMap[y][x] = <0 | 1>Number(!!val[y][x]);

                if (!val[y][x]) continue;

                try {
                    const asset = Assets.get(val[y][x]);

                    if (!asset) throw 'cant get asset'

                    const sprite = asset.getPIXISprite();

                    if (!sprite) throw 'cant get sprite'

                    sprite.x = x * this.tileSize.x;
                    sprite.y = y * this.tileSize.y;

                    sprite.width = this.tileSize.x;
                    sprite.height = this.tileSize.y;

                    this.sprite!.addChild(sprite);
                } catch (e) {
                    D.error(val[y][x] + '\n' + e);
                    return;
                }
            }
        }
    }

    /**
     * 
     * Returns an array containing 1s and 0s describing the tiles which can collide.
     * 
     */
    public get collisionMap(): (1 | 0)[][] {
        return this._tileMap;
    }

    public get AABB(): AABB {
        return new AABB(new Vector2(this._tileMap.length > 0 ? this._tileMap[0].length : 0, this._tileMap.length).scale(this.tileSize).scale(this.gameObject.transform.scale), this.position);
    }

    //public pointToTilemapSpace(pos: Vector2) {
    //    return new Vector2(Math.floor((pos.x - this.position.x) / this.tileSize.x), (this.collisionMap.length - 1) - Math.floor((pos.y - this.position.y) / this.tileSize.y));
    //}

    //public toTilemapSpace(vec: Vector2) {
    //    return new Vector2(Math.floor(vec.x / this.tileSize.x), Math.floor(vec.y / this.tileSize.y));
    //}

}
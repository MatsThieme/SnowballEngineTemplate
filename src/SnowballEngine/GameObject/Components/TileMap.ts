import { Angle } from '../../Angle.js';
import { Asset } from '../../Assets/Asset.js';
import { Assets } from '../../Assets/Assets.js';
import { Frame } from '../../Camera/Frame.js';
import { clamp } from '../../Helpers.js';
import { AABB } from '../../Physics/AABB.js';
import { PhysicsMaterial } from '../../Physics/PhysicsMaterial.js';
import { Sprite } from '../../Sprite.js';
import { Vector2 } from '../../Vector2.js';
import { Drawable } from '../Drawable.js';
import { GameObject } from '../GameObject.js';
import { Camera } from './Camera.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';
import { Client } from '../../Client.js';

export class TileMap extends Component implements Drawable {
    public tileSize: Vector2;
    public relativePosition: Vector2;
    private tileFrames: Frame[];
    private backgroundFrames: Frame[];
    private _tileMap: (1 | 0)[][];
    public material: PhysicsMaterial;
    public backgroundLayers: Map<number, { distance: number, sprite: Asset }[]>;
    public backgroundMaxDistance: number;
    public constructor(gameObject: GameObject, tileSize: Vector2 = new Vector2(1, 1), relativePosition: Vector2 = new Vector2(), material: PhysicsMaterial = new PhysicsMaterial(), tileMap: string[][] = [], backgroundLayers: Map<number, { distance: number, sprite: Asset }[]> = new Map(), backgroundMaxDistance: number = 1000) {
        super(gameObject, ComponentType.TileMap);

        this.tileSize = tileSize;
        this.relativePosition = relativePosition;
        this._tileMap = [];
        this.tileFrames = [];
        this.backgroundFrames = [];
        this.tileMap = tileMap;
        this.material = material;

        this.backgroundLayers = backgroundLayers;
        this.backgroundMaxDistance = backgroundMaxDistance;
    }
    public get currentFrame(): Frame[] {
        return [...this.tileFrames, ...this.backgroundFrames];
    }

    /**
     * 
     * Initialize the tilemap using a 2D array containing image sources.
     * 
     */
    public set tileMap(val: string[][]) {
        this._tileMap = [];
        this.tileFrames = [];
        const sprites: Map<string, Sprite> = new Map();

        for (let y = 0; y < val.length; y++) {
            this._tileMap[y] = [];
            for (let x = 0; x < val[0].length; x++) {
                if (val[y][x] === '') {
                    this._tileMap[y][x] = 0;
                    continue;
                }

                this._tileMap[y][x] = 1;

                if (!sprites.has(val[y][x])) sprites.set(val[y][x], new Sprite(Assets.get(val[y][x])!));

                this.tileFrames.push(new Frame(new Vector2(this.position.x + x, this.position.y + this.tileSize.y * (val.length - y - 1)), this.tileSize, <Sprite>sprites.get(val[y][x])!, new Angle(), this.gameObject.drawPriority, 1));
            }
        }
    }

    /**
     * 
     * Calculates positioning of backgrounds for camera.
     * 
     */
    public calculateBackgroundForCamera(camera: Camera): void {
        this.backgroundFrames = [];

        const point = camera.gameObject.transform.position;

        const entries = [...this.backgroundLayers.entries()];

        for (let i = 0; i < this.backgroundLayers.size; i++) {
            entries[i][1].sort((a, b) => b.distance - a.distance);

            const left = entries[i][0] + this.position.x;
            const right = Math.min(point.x + camera.size.x / 2, (i + 1 < entries.length ? left + entries[i + 1][0] : this.scaledSize.x) + this.position.x);

            for (const b of entries[i][1]) {
                const spriteSizeWorld = new Vector2(this.scaledSize.y * (<HTMLImageElement>b.sprite.data).width / (<HTMLImageElement>b.sprite.data).height, this.scaledSize.y);

                for (let x = left + (point.x - left) * (clamp(0, this.backgroundMaxDistance, b.distance) / this.backgroundMaxDistance) - camera.size.x; x < right; x += spriteSizeWorld.x) {
                    const sprite = new Sprite(<HTMLImageElement>b.sprite.data);
                    let xScalar = 1;
                    let xPosition = 0;

                    // cut background right
                    if (x + spriteSizeWorld.x > right) {
                        xScalar = (right - x) / spriteSizeWorld.x;
                        sprite.subSize = new Vector2(<number>sprite.canvasImageSource.width * xScalar, <number>sprite.canvasImageSource.height);
                    }

                    // cut background left
                    if (x < left) {
                        xPosition = left - x;
                        sprite.subPosition = new Vector2(xPosition / spriteSizeWorld.x * (<HTMLImageElement>b.sprite.data).width, 0);
                    }

                    this.backgroundFrames.push(new Frame(new Vector2(x + xPosition, this.position.y), spriteSizeWorld.clone.scale(new Vector2(xScalar, 1)), sprite, new Angle(), this.gameObject.drawPriority, 1));
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
    public get scaledSize(): Vector2 {
        return new Vector2(this._tileMap.length > 0 ? this._tileMap[0].length : 0, this._tileMap.length).scale(this.tileSize).scale(this.gameObject.transform.relativeScale);
    }
    public get position() {
        return Vector2.add(this.relativePosition, this.gameObject.transform.position);
    }
    public get AABB(): AABB {
        return new AABB(this.scaledSize, this.position);
    }
    public update() { }
    public pointToTilemapSpace(pos: Vector2) {
        return new Vector2(Math.floor((pos.x - this.position.x) / this.tileSize.x), (this.collisionMap.length - 1) - Math.floor((pos.y - this.position.y) / this.tileSize.y));
    }
    public toTilemapSpace(vec: Vector2) {
        return new Vector2(Math.floor(vec.x / this.tileSize.x), Math.floor(vec.y / this.tileSize.y));
    }

}
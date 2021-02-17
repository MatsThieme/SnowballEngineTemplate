import { Client } from '../Client';
import { D } from '../Debug';
import { Camera } from '../GameObject/Components/Camera';
import { ComponentType } from '../GameObject/ComponentType';
import { GameObject } from '../GameObject/GameObject';
import { UIFrame } from '../UI/UIFrame';
import { Vector2 } from '../Vector2';
import { PIXI } from './PIXI';

export class CameraManager {
    private _context: CanvasRenderingContext2D;
    private _cleared: boolean;

    public readonly cameras: Camera[];
    private readonly _gameObjects: Map<number, GameObject>;

    private readonly _PIXI: PIXI;

    public constructor(domElement: HTMLCanvasElement) {
        this._context = domElement.getContext('2d')!;
        this.cameras = [];
        this._cleared = false;

        this._PIXI = new PIXI(Client.resolution.x, Client.resolution.y);

        this._gameObjects = new Map();
    }

    public addCamera(camera: Camera) {
        this.cameras.push(camera);
    }

    public removeCamera(camera: Camera) {
        const i = this.cameras.findIndex(c => c.componentId == camera.componentId);

        if (i === -1) return;

        this.cameras.splice(i, 1);
    }


    public addGameObject(gameObject: GameObject): void {
        if (this.hasGameObject(gameObject)) {
            D.error('gameObject.container is already staged');
            return;
        }

        this._PIXI.container.addChild(gameObject.container);

        this._gameObjects.set(gameObject.id, gameObject);
    }

    public removeGameObject(gameObject: GameObject): void {
        if (!this.hasGameObject(gameObject)) { D.error('go not found'); return; }

        this._PIXI.container.removeChild(gameObject.container);

        this._gameObjects.delete(gameObject.id);
    }

    public hasGameObject(gameObject: GameObject): boolean {
        return this._gameObjects.has(gameObject.id);
    }


    public update() {
        if (!this.cameras.length) {
            D.error('No active camera');
            return;
        }

        if (this._context.canvas.width !== Client.resolution.x) this._context.canvas.width = Client.resolution.x;
        if (this._context.canvas.height !== Client.resolution.y) this._context.canvas.height = Client.resolution.y;


        this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
        this._cleared = true;

        const gameObjects = [... this.cameras[0].gameObject.scene.gameObjects.values()];
        const components = gameObjects.flatMap(gameObject => gameObject.getComponents(ComponentType.Component));


        for (const camera of this.cameras.sort((a, b) => a.zIndex - b.zIndex)) {

            if (camera.active) {
                for (const component of components) {
                    if (component.onPreRender)
                        component.onPreRender(camera);
                }


                camera.update(this._PIXI);

                const pos = new Vector2(camera.screenPosition.x / 100 * Client.resolution.x, camera.screenPosition.y / 100 * Client.resolution.y).floor();
                const size = new Vector2(camera.screenSize.x / 100 * Client.resolution.x, camera.screenSize.y / 100 * Client.resolution.y).floor();


                this._context.drawImage(this._PIXI.canvas, 0, 0, camera.px.x, camera.px.y, pos.x, pos.y, size.x, size.y);


                for (const component of components) {
                    if (component.onPostRender)
                        component.onPostRender(camera);
                }
            }
        }
    }

    public drawUI(ui: UIFrame) {
        if (!this._cleared) this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);

        this._context.drawImage(ui.sprite, ui.aabb.position.x, ui.aabb.position.y, ui.aabb.size.x, ui.aabb.size.y);
    }
}
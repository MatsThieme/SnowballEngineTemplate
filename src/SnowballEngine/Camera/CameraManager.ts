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

    public renderScale: number;

    public constructor(domElement: HTMLCanvasElement) {
        this._context = domElement.getContext('2d')!;
        this.cameras = [];
        this._cleared = false;

        this.renderScale = 1;

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
        if (this.hasGameObject(gameObject)) return D.error('gameObject.container is already staged');

        this._PIXI.container.addChild(gameObject.container);

        this._gameObjects.set(gameObject.id, gameObject);
    }

    public removeGameObject(gameObject: GameObject): void {
        if (!this.hasGameObject(gameObject)) return D.error('go not found');

        this._PIXI.container.removeChild(gameObject.container);

        this._gameObjects.delete(gameObject.id);
    }

    public hasGameObject(gameObject: GameObject): boolean {
        return this._gameObjects.has(gameObject.id);
    }

    public update() {
        if (!this.cameras.filter(c => c.active)) return D.error('No active camera');


        const canvasSize = (<Vector2>Client.resolution).clone.scale(this.renderScale).floor();
        this._PIXI.resize(canvasSize.x, canvasSize.y);


        if (this._context.canvas.width !== Client.resolution.x) this._context.canvas.width = Client.resolution.x;
        if (this._context.canvas.height !== Client.resolution.y) this._context.canvas.height = Client.resolution.y;


        this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
        this._cleared = true;

        const gameObjects = [...this.cameras[0].gameObject.scene.gameObjects.values()];
        const components = gameObjects.flatMap(gameObject => gameObject.getComponents(ComponentType.Component));


        for (const camera of this.cameras.sort((a, b) => a.zIndex - b.zIndex)) {

            if (camera.active) {
                for (const component of components) {
                    if (component.onPreRender)
                        component.onPreRender(camera);
                }


                camera.update(this._PIXI);


                const screenPos = Vector2.scale(Vector2.divide(camera.screenPosition, 100), Client.resolution).floor();
                const screenSize = Vector2.scale(Vector2.divide(camera.screenSize, 100), Client.resolution).floor();

                this._context.drawImage(this._PIXI.canvas, screenPos.x * this.renderScale, screenPos.y * this.renderScale, screenSize.x * this.renderScale, screenSize.y * this.renderScale, screenPos.x, screenPos.y, screenSize.x, screenSize.y);


                for (const component of components) {
                    if (component.onPostRender)
                        component.onPostRender(camera);
                }
            }
        }

        /* little performance boost (around 5% when tested): clear pixi.canvas once per frame, not once per camera per frame and draw it only once to target canvas; remove drawImage call in loop above */
        // this._PIXI.renderer.clearBeforeRender = false;

        // this._context.drawImage(this._PIXI.canvas, 0, 0, Client.resolution.x * this.renderScale, Client.resolution.y * this.renderScale, 0, 0, Client.resolution.x, Client.resolution.y);

        // this._PIXI.renderer.clear();
    }

    public drawUI(ui: UIFrame) {
        if (!this._cleared) this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);

        this._context.drawImage(ui.sprite, ui.aabb.position.x, ui.aabb.position.y, ui.aabb.size.x, ui.aabb.size.y);
    }
}
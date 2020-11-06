import { CameraManager } from './Camera/CameraManager.js';
import { Canvas } from './Canvas.js';
import { Client } from './Client.js';
import { Framedata } from './Framedata.js';
import { AudioListener } from './GameObject/Components/AudioListener.js';
import { Behaviour } from './GameObject/Components/Behaviour.js';
import { Collider } from './GameObject/Components/Collider.js';
import { ComponentType } from './GameObject/Components/ComponentType.js';
import { GameObject } from './GameObject/GameObject.js';
import { GameTime } from './GameTime.js';
import { clearObject, stopwatch } from './Helpers.js';
import { Input } from './Input/Input.js';
import { Collision } from './Physics/Collision.js';
import { Physics } from './Physics/Physics.js';
import { SceneManager } from './SceneManager.js';
import { UI } from './UI/UI.js';

export class Scene {
    public readonly domElement: HTMLCanvasElement;
    private readonly gameObjects: Map<string, GameObject>;
    public readonly cameraManager: CameraManager;
    public readonly gameTime: GameTime;
    public readonly input: Input;
    public readonly ui: UI;
    private requestAnimationFrameHandle?: number;
    public readonly framedata: Framedata;
    public readonly audioListener?: AudioListener;
    public readonly sceneManager: SceneManager;
    /**
     * 
     * Callbacks pushed by gameobject.destroy() and executed after update before render.
     * 
     */
    private readonly toDestroy: (() => void)[];
    public constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;

        this.domElement = Canvas(Client.resolution.x, Client.resolution.y);

        this.gameObjects = new Map();
        this.cameraManager = new CameraManager(this.domElement);
        this.gameTime = new GameTime();
        this.input = new Input(this);
        this.ui = new UI(this.input, this);
        this.framedata = new Framedata();
        this.toDestroy = [];

        this.stop();
    }

    /**
     * 
     * Returns GameObject if present in Scene.
     * 
     */
    public find(name: string): GameObject | undefined {
        return this.gameObjects.get(name) || this.gameObjects.get([...this.gameObjects.keys()].find(n => (n.match(/(.*) \(\d+\)/) || '')[1] === name) || '');
    }

    /**
     *
     * Returns all GameObjects of the given name.
     *
     */
    public findAll(name: string): GameObject[] {
        return [...this.gameObjects.entries()].filter(e => (e[0].match(/(.*) \(\d+\)/) || '')[1] === name).map(e => e[1]);
    }

    /**
     * 
     * Creates new GameObject with name and executes callbacks.
     * 
     */
    public async addGameObject(name: string, ...cb: ((gameObject: GameObject) => any)[]): Promise<GameObject> {
        const gameObject = new GameObject(name, this);
        this.gameObjects.set(gameObject.name, gameObject);
        if (cb) {
            for (const c of cb) {
                await c(gameObject);
            }
        }

        return gameObject;
    }

    /**
     * 
     * Updates...
     * gameTime
     * input
     * framedata
     * collider
     * collisions
     * rigidbodies
     * gameObjects
     * ui
     * cameraManager
     * 
     */
    private async update() {
        this.gameTime.update();

        this.input.update();

        this.framedata.update();

        const gameObjects = this.getAllGameObjects();

        if (!this.ui.pauseScene) {
            gameObjects.forEach(gO => gO.getComponents<Collider>(ComponentType.Collider).forEach(c => c.update(this.gameTime)));

            const idPairs: number[] = [];
            const collisionPromises: Promise<Collision>[] = [];


            const gOs = gameObjects.filter(gO => gO.active && gO.hasCollider && !gO.parent);

            for (const gO1 of gOs) {
                for (const gO2 of gOs) {
                    const id = gO1.id > gO2.id ? (gO1.id << 8) + gO2.id : (gO2.id << 8) + gO1.id;

                    if (!idPairs[id] && gO1.id !== gO2.id) {
                        collisionPromises.push(...Physics.collision(gO1, gO2));
                        idPairs[id] = 1;
                    }
                }
            }

            const collisions: Collision[] = [];

            for (const c of await Promise.all(collisionPromises)) {
                collisions.push(c);
            }

            try {
                await Promise.all(gameObjects.map(gameObject => gameObject.update(this.gameTime, collisions)));
            } catch (e) {
                console.log(e);
            }
        }

        if (this.toDestroy.length) {
            const s = stopwatch();
            this.toDestroy.forEach(d => d());
            this.toDestroy.splice(0);
            console.log(s());
        }


        this.cameraManager.update(gameObjects);

        await this.ui.update(this.gameTime);

        this.cameraManager.drawUI(this.ui.currentFrame);

        if (this.requestAnimationFrameHandle) this.requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));
    }

    /**
     * 
     * Returns all GameObjects in this Scene.
     * 
     */
    public getAllGameObjects(): GameObject[] {
        return [...this.gameObjects.values()];
    }

    /**
     * 
     * Start scene.
     * 
     */
    public async start(): Promise<void> {
        this.requestAnimationFrameHandle = 0; // set isStarted true

        for (const gameObject of this.getAllGameObjects()) {
            for (const c of gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (!c.__initialized__) {
                    await c.start();
                    (<any>c).__initialized__ = true;
                }
            }
        }

        this.requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        document.body.appendChild(this.domElement);
    }

    /**
     *
     * Stop scene.
     *
     */
    public stop(): void {
        if (this.requestAnimationFrameHandle) cancelAnimationFrame(this.requestAnimationFrameHandle);
        this.requestAnimationFrameHandle = undefined;

        this.domElement.remove();
    }

    /**
     * 
     * Returns true if scene start() has been called.
     * 
     */
    public get isStarted(): boolean {
        return typeof this.requestAnimationFrameHandle === 'number';
    }

    /**
     * 
     * Returns true if animation loop is running.
     * 
     */
    public get isRunning(): boolean {
        return !!this.requestAnimationFrameHandle;
    }

    /**
     * 
     * Remove gameObject from scene.
     * called by gameObject.destroy()
     * 
     */
    public destroyGameObject(name: string): void {
        this.gameObjects.delete(name);
    }

    public destroy() {
        this.stop();

        for (const gameObject of this.gameObjects.values()) {
            gameObject.destroy();
        }

        clearObject(this);
    }
}

/**
 *
 * to do:
 * integrate pixi js and matter js
 *
 *
 * to fix:
 * ui umrandungen skalierung
 *
 * collision response rotation
 * tilemap paralax background at different aspect ratios
 * ui aabbs
 *
 *
 *
 * to test:
 * child collider
 *
 *
 * to do:
 * camera rotation
 * TilemapCollision contact points
 *
 * !Assets
 * !InputType ersetzen durch vom nutzer konfigurierbares
 * !Settings durch was sinnvolles ersetzen
 *
 *
 *
 * optional optimisations:
 * polygon intersection: support points
 * replace line intersection with face clipping in collisionPolygon
 * store things computed multiple times, e.g. vector2 magnitude
 * clean up ui elements
 * use webgl instead of 2d context
 *
 *
 * optional features:
 * continuous collision
 * joints
 * extend particlesystem(e.g. rotation direction)
 * tilemap vertical paralax background
 * fitContent for UIMenu
 *
 *
 * to review:
 * coordinate system, scale, rotation, position
 * polygoncollider aabb topleft???
 * gameObject.active
 *
 *
 */
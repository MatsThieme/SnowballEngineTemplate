import { AudioMixer } from './Audio/AudioMixer';
import { CameraManager } from './Camera/CameraManager';
import { Canvas } from './Canvas';
import { Client } from './Client';
import { Framedata } from './Framedata';
import { AudioListener } from './GameObject/Components/AudioListener';
import { Behaviour } from './GameObject/Components/Behaviour';
import { Collider } from './GameObject/Components/Collider';
import { ComponentType } from './GameObject/Components/ComponentType';
import { GameObject } from './GameObject/GameObject';
import { GameTime } from './GameTime';
import { cantorPairingFunction, clearObject, interval } from './Helpers';
import { Input } from './Input/Input';
import { Collision } from './Physics/Collision';
import { Physics } from './Physics/Physics';
import { SceneManager } from './SceneManager';
import { UI } from './UI/UI';

export class Scene {
    public readonly domElement: HTMLCanvasElement;
    private readonly gameObjects: Map<string, GameObject>;
    public readonly cameraManager: CameraManager;
    public readonly ui: UI;
    private requestAnimationFrameHandle?: number;
    public readonly framedata: Framedata;
    public readonly audioListener?: AudioListener;
    public readonly sceneManager: SceneManager;
    public readonly name: string;
    private updateComplete?: boolean;
    /**
     * 
     * Callbacks pushed by gameobject.destroy() and executed after update before render.
     * 
     */
    private readonly destroyCbs: (() => void)[];
    public constructor(sceneManager: SceneManager, name: string) {
        this.sceneManager = sceneManager;
        this.name = name;

        this.domElement = Canvas(Client.resolution.x, Client.resolution.y);
        this.domElement.id = this.name;

        Input.reset();

        this.gameObjects = new Map();
        this.cameraManager = new CameraManager(this.domElement);
        this.ui = new UI(this);
        this.framedata = new Framedata();
        this.destroyCbs = [];
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
     * GameTime
     * Input
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
        this.updateComplete = false;

        GameTime.update();

        this.framedata.update();

        Input.update();

        const gameObjects = this.getAllGameObjects();

        if (!this.ui.pauseScene) {
            gameObjects.forEach(gO => gO.getComponents<Collider>(ComponentType.Collider).forEach(c => c.update()));

            const idPairs: number[] = [];
            const collisionPromises: Promise<Collision>[] = [];


            const gOs = gameObjects.filter(gO => gO.active && gO.hasCollider && !gO.parent);


            for (const gO1 of gOs) {
                for (const gO2 of gOs) {
                    const id = gO1.id > gO2.id ? cantorPairingFunction(gO1.id, gO2.id) : cantorPairingFunction(gO2.id, gO1.id);

                    ((gO1.id + gO2.id) / 2) * (gO1.id + gO2.id + 1) + gO2.id;

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

            await Promise.all(gameObjects.map(gameObject => gameObject.update(collisions)));
        }

        if (this.destroyCbs.length) {
            this.destroyCbs.forEach(d => d());
            this.destroyCbs.splice(0);
        }

        this.cameraManager.update(gameObjects);

        await this.ui.update();

        this.cameraManager.drawUI(this.ui.currentFrame);

        if (this.requestAnimationFrameHandle) this.requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        this.updateComplete = true;
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
     * Start or resume scene.
     * 
     */
    public async start(): Promise<void> {
        this.requestAnimationFrameHandle = -1; // set isStarting true

        for (const gameObject of this.getAllGameObjects()) {
            for (const c of gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (!c.__initialized__) {
                    await c.start();
                    (<any>c).__initialized__ = true;
                }
            }
        }

        this.requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        await this.appendToDOM();
    }

    /**
     *
     * Stop scene.
     *
     */
    public async stop(): Promise<void> {
        if (this.requestAnimationFrameHandle) cancelAnimationFrame(this.requestAnimationFrameHandle);
        this.requestAnimationFrameHandle = undefined;

        await this.removeFromDOM();

        await new Promise<void>(resolve => {
            interval(clear => {
                if (this.updateComplete) {
                    clear();
                    resolve();
                }
            }, 10);
        });
    }

    private async appendToDOM(): Promise<void> {
        document.body.appendChild(this.domElement);

        await new Promise<void>(resolve => {
            interval(clear => {
                if (document.getElementById(this.name)) {
                    clear();
                    resolve();
                }
            }, 1);
        });
    }

    private async removeFromDOM(): Promise<void> {
        this.domElement.remove();

        await new Promise<void>(resolve => {
            interval(clear => {
                if (!document.getElementById(this.name)) {
                    clear();
                    resolve();
                }
            }, 1);
        });
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
     * Returns true while this.start() is running.
     * 
     */
    public get isStarting(): boolean {
        return this.requestAnimationFrameHandle === -1;
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

    public async destroy() {
        await this.stop();

        for (const gameObject of this.gameObjects.values()) {
            gameObject.destroy();
        }

        AudioMixer.reset();

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
import { AudioMixer } from './Audio/AudioMixer';
import { CameraManager } from './Camera/CameraManager';
import { Client } from './Client';
import { Framedata } from './Framedata';
import { AudioListener } from './GameObject/Components/AudioListener';
import { Behaviour } from './GameObject/Components/Behaviour';
import { Collider } from './GameObject/Components/Collider';
import { Component } from './GameObject/Components/Component';
import { ComponentType } from './GameObject/ComponentType';
import { GameObject } from './GameObject/GameObject';
import { GameTime } from './GameTime';
import { Input } from './Input/Input';
import { Collision } from './Physics/Collision';
import { Physics } from './Physics/Physics';
import { SceneManager } from './SceneManager';
import { UI } from './UI/UI';
import { Canvas } from './Utilities/Canvas';
import { cantorPairingFunction, clearObject, interval } from './Utilities/Helpers';

export class Scene {
    public readonly domElement: HTMLCanvasElement;
    public readonly gameObjects: Map<string, GameObject>;
    public readonly cameraManager: CameraManager;
    public readonly ui: UI;
    private requestAnimationFrameHandle?: number;
    public readonly framedata: Framedata;
    public readonly audioListener?: AudioListener;
    public readonly name: string;
    private updateComplete?: boolean;

    /**
     * 
     * Callbacks pushed by gameobject.destroy() and executed after update before render.
     * 
     */
    private readonly destroyCbs: (() => void)[];

    public static readonly sceneManager: SceneManager;

    public constructor(sceneManager: SceneManager, name: string) {
        if (!(<any>Scene).sceneManager) (<any>Scene).sceneManager = sceneManager;

        this.name = name;

        this.domElement = new Canvas(Client.resolution.x, Client.resolution.y);
        this.domElement.id = this.name;

        Input.reset();
        Client.init();

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
     * @internal
     * 
     * Update and render loop
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

        const gameObjects = [...this.gameObjects.values()];

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

            for (const gO of gameObjects) {
                for (const c of gO.getComponents(ComponentType.Component)) {
                    if (c.lateUpdate) c.lateUpdate();
                }
            }
        }

        if (this.destroyCbs.length) {
            this.destroyCbs.forEach(d => d());
            this.destroyCbs.splice(0);
        }


        this.cameraManager.update();

        await this.ui.update();

        this.cameraManager.drawUI(this.ui.currentFrame);


        if (this.requestAnimationFrameHandle) this.requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        this.updateComplete = true;
    }

    /**
     * @internal
     * 
     * Start or resume scene.
     * 
     */
    public async start(): Promise<void> {
        this.requestAnimationFrameHandle = -1; // set isStarting true

        (<any>GameObject).nextID = (<any>Component).nextID = 0;


        for (const gameObject of this.gameObjects.values()) {
            for (const c of gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (!c.__initialized__) {
                    if (c.start) await c.start();
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
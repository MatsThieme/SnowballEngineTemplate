import { AudioMixer } from 'Audio/AudioMixer';
import { AudioListener } from 'GameObject/Components/AudioListener';
import { Behaviour } from 'GameObject/Components/Behaviour';
import { Component } from 'GameObject/Components/Component';
import { ComponentType } from 'GameObject/ComponentType';
import { Destroy, Destroyable } from 'GameObject/Destroy';
import { Dispose } from 'GameObject/Dispose';
import { GameObject } from 'GameObject/GameObject';
import { Input } from 'Input/Input';
import { UI } from 'UI/UI';
import { UIFonts } from 'UI/UIFonts';
import { clearObject } from 'Utility/Helpers';
import { Interval } from 'Utility/Interval';
import { CameraManager } from './Camera/CameraManager';
import { Client } from './Client';
import { Framedata } from './Framedata';
import { GameTime } from './GameTime';
import { SceneManager } from './SceneManager';

/** @category Scene */
export class Scene {
    public readonly cameraManager: CameraManager;
    public readonly gameObjects: Map<string, GameObject>;
    public readonly ui: UI;
    public readonly framedata: Framedata;
    public readonly audioListener?: AudioListener;
    public readonly domElement: HTMLCanvasElement;
    public readonly name: string;

    /**
     * 
     * If true, GameObjects and components are not updated.
     * 
     */
    public pause: boolean;

    private _requestAnimationFrameHandle?: number;
    private _updateComplete?: boolean;

    /**
     * 
     * Callbacks pushed by gameobject.destroy() and executed after update before render.
     * 
     */
    private readonly _destroyables: Destroyable[];

    public static readonly sceneManager: SceneManager;
    public static readonly currentScene: Scene;

    public constructor(sceneManager: SceneManager, name: string) {
        if (!(<any>Scene).sceneManager) (<any>Scene).sceneManager = sceneManager;
        (<any>Scene).currentScene = this;

        this.name = name;


        Input.reset();
        Client.init();

        if (!(<any>UIFonts)._fonts) UIFonts.init();

        this.gameObjects = new Map();
        this.ui = new UI();
        this.cameraManager = new CameraManager();
        this.framedata = new Framedata();
        this._destroyables = [];

        this.domElement = this.cameraManager.canvas;
        this.domElement.id = this.name;

        this.pause = false;
    }


    /**
     * 
     * Returns true while this.start() is running.
     * 
     */
    public get isStarting(): boolean {
        return this._requestAnimationFrameHandle === -1;
    }

    /**
     * 
     * Returns true if scene start() has been called.
     * 
     */
    public get isStarted(): boolean {
        return typeof this._requestAnimationFrameHandle === 'number';
    }

    /**
     * 
     * Returns true if animation loop is running.
     * 
     */
    public get isRunning(): boolean {
        return !!this._requestAnimationFrameHandle;
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
    private async update(time: number) {
        this._updateComplete = false;

        GameTime.update(time);

        this.framedata.update();

        Input.update();

        const scenePaused = this.pause || [...this.ui.menus.values()].some(m => m.active && m.pauseScene);

        if (!scenePaused) {
            const gameObjects = [...this.gameObjects.values()];

            for (const gO of gameObjects) {
                for (const c of gO.getComponents(ComponentType.Component)) {
                    await c.dispatchEvent('earlyupdate');
                }
            }

            await Promise.all(gameObjects.map(gameObject => gameObject.update()));

            for (const gO of gameObjects) {
                for (const c of gO.getComponents(ComponentType.Component)) {
                    await c.dispatchEvent('lateupdate');
                }
            }
        }


        await this.ui.update();

        this.cameraManager.update();


        this.destroy();


        if (this._requestAnimationFrameHandle) this._requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        this._updateComplete = true;
    }

    /**
     * 
     * Start scene.
     * @internal
     * 
     */
    public async start(): Promise<void> {
        this._requestAnimationFrameHandle = -1; // set isStarting true

        (<any>GameObject).nextID = (<any>Component).nextID = 0;


        for (const gameObject of this.gameObjects.values()) {
            for (const c of gameObject.getComponents<Behaviour>(ComponentType.Behaviour)) {
                if (!c.__initialized__) {
                    await c.dispatchEvent('start');
                    (<Mutable<Behaviour>>c).__initialized__ = true;
                }
            }
        }

        this._requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        await this.appendToDOM();
    }

    /**
     *
     * Stop scene.
     *
     */
    public async stop(): Promise<void> {
        this._requestAnimationFrameHandle = undefined;

        await this.removeFromDOM();

        await new Promise<void>(resolve => {
            new Interval(i => {
                if (this._updateComplete) {
                    i.clear();
                    resolve();
                }
            }, 10);
        });
    }

    private async appendToDOM(): Promise<void> {
        document.body.appendChild(this.domElement);

        await new Promise<void>(resolve => {
            new Interval(i => {
                if (document.getElementById(this.name)) {
                    i.clear();
                    resolve();
                }
            }, 10);
        });
    }

    private async removeFromDOM(): Promise<void> {
        this.domElement.remove();

        await new Promise<void>(resolve => {
            new Interval(i => {
                if (!document.getElementById(this.name)) {
                    i.clear();
                    resolve();
                }
            }, 10);
        });
    }

    /**
     * 
     * Register a Destroyable to destroy at the end of the current frame. Used by Destroy(destroyable: Destroyable)
     * @internal
     * 
     */
    public addDestroyable(destroyable: Destroyable): void {
        this._destroyables.push(destroyable);
    }

    /**
     * 
     * Destroy all destroyables
     * 
     */
    private destroy(): void {
        this._destroyables.forEach(d => d.destroy());
        this._destroyables.splice(0).forEach(d => Dispose(d));
    }

    /**
     * 
     * @internal
     * 
     */
    public async unload(): Promise<void> {
        await this.stop();

        for (const gameObject of this.gameObjects.values()) {
            Destroy(gameObject);
        }

        Destroy(this.ui);

        this.destroy();

        this.cameraManager.destroy();

        AudioMixer.reset();

        clearObject(this, true);
    }
}
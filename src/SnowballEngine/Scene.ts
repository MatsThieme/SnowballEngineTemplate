import { AudioMixer } from 'Audio/AudioMixer';
import { AudioListener } from 'GameObject/Components/AudioListener';
import { Behaviour } from 'GameObject/Components/Behaviour';
import { Collider } from 'GameObject/Components/Collider';
import { Component } from 'GameObject/Components/Component';
import { Rigidbody } from 'GameObject/Components/Rigidbody';
import { Destroy, Destroyable } from 'GameObject/Destroy';
import { Dispose } from 'GameObject/Dispose';
import { GameObject } from 'GameObject/GameObject';
import { Input } from 'Input/Input';
import { UI } from 'UI/UI';
import { UIFonts } from 'UI/UIFonts';
import { EventTarget } from 'Utility/Events/EventTarget';
import { SceneEventTypes } from 'Utility/Events/EventTypes';
import { clearObject } from 'Utility/Helpers';
import { Interval } from 'Utility/Interval';
import { Stopwatch } from 'Utility/Stopwatch';
import { CameraManager } from './Camera/CameraManager';
import { Client } from './Client';
import { Framedata } from './Framedata';
import { GameTime } from './GameTime';
import { Physics } from './Physics/Physics';
import { SceneManager } from './SceneManager';

/** @category Scene */
export class Scene extends EventTarget<SceneEventTypes> {
    public readonly cameraManager: CameraManager;
    public readonly ui: UI;
    public readonly framedata: Framedata;
    public readonly domElement: HTMLCanvasElement;
    public readonly name: string;
    public readonly physics: Physics;
    public static readonly sceneManager: SceneManager;
    public static readonly currentScene: Scene;

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

    private _audioListener?: AudioListener;


    public constructor(sceneManager: SceneManager, name: string) {
        super();

        if (!(<any>Scene).sceneManager) (<any>Scene).sceneManager = sceneManager;
        (<any>Scene).currentScene = this;

        this.name = name;

        Input.reset();
        Client.init();
        GameObject.reset();
        Component.reset();
        Stopwatch.reset();
        AudioMixer.reset();

        if (!(<any>UIFonts)._fonts) UIFonts.init();

        this.ui = new UI();
        this.cameraManager = new CameraManager();
        this.framedata = new Framedata();
        this._destroyables = [];

        this.domElement = this.cameraManager.canvas;
        this.domElement.id = this.name;

        this.pause = false;

        this.physics = new Physics();
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
     * Returns true if animation loop is running.
     * 
     */
    public get isRunning(): boolean {
        return !!this._requestAnimationFrameHandle;
    }

    public get audioListener(): AudioListener | undefined {
        return this._audioListener;
    }
    public set audioListener(val: AudioListener | undefined) {
        if (this.audioListener && val || !this.audioListener && !val) return;

        if (val) {
            this.dispatchEvent('audiolisteneradd', val);
        } else {
            this.dispatchEvent('audiolistenerremove', this._audioListener!);
        }

        this._audioListener = val;
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
     * gameObjects
     * ui
     * cameraManager
     * 
     */
    private async update(time: number): Promise<void> {
        if (!this._requestAnimationFrameHandle) return;

        this._updateComplete = false;

        GameTime.update(time);

        Stopwatch.update();

        this.framedata.update();

        Input.update();

        const scenePaused = this.pause || [...this.ui.menus.values()].some(m => m.active && m.pauseScene);

        if (!scenePaused) {
            await Behaviour.earlyupdate();
            await Component.earlyupdate();


            Rigidbody.updateBody();
            Collider.updateBody();
            this.physics.update();
            Rigidbody.updateTransform();


            await Behaviour.update();
            await Component.update();

            await Behaviour.lateupdate();
            await Component.lateupdate();
        }


        await this.ui.update();

        this.cameraManager.update();


        this.destroyDestroyables();


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

        for (const go of GameObject.gameObjects) {
            go.start();
        }

        this._requestAnimationFrameHandle = requestAnimationFrame(this.update.bind(this));

        await this.appendToDOM();
    }

    /**
     *
     * Stop scene.
     * @internal
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
    public addDestroyable(destroyable: Destroyable): boolean {
        const i = this._destroyables.findIndex(d => d.__destroyID__ === destroyable.__destroyID__);

        if (i === -1) {
            this._destroyables.push(destroyable);
            return true;
        }

        return false;
    }

    /**
     * 
     * Destroy all destroyables
     * 
     */
    private destroyDestroyables(force?: boolean): void {
        for (let i = this._destroyables.length - 1; i >= 0; i--) {
            if (!this._destroyables[i].__destroyInFrames__ || force) {
                this._destroyables[i].destroy();
                Dispose(this._destroyables.splice(i, 1)[0]);
            } else (<number>this._destroyables[i].__destroyInFrames__)--;
        }
    }

    /**
     * 
     * @internal
     * 
     */
    public async unload(): Promise<void> {
        await this.stop();

        GameObject.prepareDestroy();

        Destroy(this.ui);

        Destroy(this.physics);

        this.destroyDestroyables(true);


        Destroy(this.cameraManager);


        this.destroyDestroyables();


        clearObject(this, true);
    }
}
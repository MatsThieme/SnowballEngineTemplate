import { AudioMixer } from "Audio/AudioMixer";
import { AudioListener } from "GameObject/Components/AudioListener";
import { Behaviour } from "GameObject/Components/Behaviour";
import { Collider } from "GameObject/Components/Collider";
import { Component } from "GameObject/Components/Component";
import { Rigidbody } from "GameObject/Components/Rigidbody";
import { Destroy, Destroyable } from "GameObject/Destroy";
import { Dispose } from "GameObject/Dispose";
import { GameObject } from "GameObject/GameObject";
import { Input } from "Input/Input";
import { EventTarget } from "Utility/Events/EventTarget";
import { SceneEventTypes } from "Utility/Events/EventTypes";
import { clearObject } from "Utility/Helpers";
import { Interval } from "Utility/Interval/Interval";
import { Stopwatch } from "Utility/Stopwatch";
import { CameraManager } from "./Camera/CameraManager";
import { Framedata } from "./Framedata";
import { GameTime } from "./GameTime";
import { Physics } from "./Physics/Physics";

/** @category Scene */
export class Scene extends EventTarget<SceneEventTypes> {
    public readonly cameraManager: CameraManager;
    public readonly framedata: Framedata;
    public readonly name: SceneName;
    public readonly physics: Physics;

    /**
     * If true, GameObjects and components are not updated.
     */
    public pause: boolean;

    private _requestAnimationFrameHandle?: number;
    private _updateComplete?: boolean;

    /**
     * Callbacks pushed by gameobject.destroy() and executed after update before render.
     */
    private readonly _destroyables: (Destroyable | undefined)[];

    private _audioListener?: AudioListener;

    public constructor(name: SceneName, domElement: HTMLCanvasElement) {
        super();

        this.name = name;

        Input.reset();
        GameObject.reset();
        Component.reset();
        Stopwatch.reset();
        AudioMixer.reset();

        this.cameraManager = new CameraManager(domElement);
        this.framedata = new Framedata();
        this._destroyables = [];

        this.pause = false;

        this.physics = new Physics();

        this.update = this.update.bind(this);
    }

    /**
     * Returns true while this.start() is running.
     */
    public get isStarting(): boolean {
        return this._requestAnimationFrameHandle === -1;
    }

    /**
     * Returns true if animation loop is running.
     */
    public get isRunning(): boolean {
        return Boolean(this._requestAnimationFrameHandle);
    }

    public get audioListener(): AudioListener | undefined {
        return this._audioListener;
    }

    public set audioListener(val: AudioListener | undefined) {
        if ((this.audioListener && val) || (!this.audioListener && !val)) return;

        if (val) {
            this.dispatchEvent("audiolisteneradd", val);
        } else if (this._audioListener) {
            this.dispatchEvent("audiolistenerremove", this._audioListener);
        }

        this._audioListener = val;
    }

    private update(time: number): void {
        if (!this._requestAnimationFrameHandle) return;

        this._updateComplete = false;

        GameTime.update(time);

        Stopwatch.update();

        this.framedata.update();

        Input.update();

        if (!this.pause) {
            Behaviour.earlyupdate();
            Component.earlyupdate();

            Rigidbody.updateBody();
            Collider.updateBody();
            this.physics.update();
            Rigidbody.updateTransform();

            Behaviour.update();
            Component.update();

            Behaviour.lateupdate();
            Component.lateupdate();
        }

        this.cameraManager.update();

        this.destroyDestroyables();

        if (this._requestAnimationFrameHandle)
            this._requestAnimationFrameHandle = requestAnimationFrame(this.update);

        this._updateComplete = true;
    }

    /**
     * Start scene.
     * @internal
     */
    public start(): void {
        if (this._requestAnimationFrameHandle !== undefined) return;

        this.dispatchEvent("start");

        this._requestAnimationFrameHandle = -1; // set isStarting true

        GameObject.gameObjects.forEach((g) => g.start());

        this._requestAnimationFrameHandle = requestAnimationFrame(this.update);
    }

    /**
     * Stop scene.
     * @internal
     */
    public async stop(): Promise<void> {
        if (!this._requestAnimationFrameHandle) return;

        await this.dispatchEvent("stop");

        this._requestAnimationFrameHandle = undefined;

        await new Promise<void>((resolve) => {
            new Interval((i) => {
                if (this._updateComplete) {
                    i.clear();
                    resolve();
                }
            }, 10);
        });
    }

    /**
     * Register a Destroyable to destroy at the end of the current frame. Used by Destroy(destroyable: Destroyable)
     * @internal
     */
    public addDestroyable(destroyable: Destroyable): boolean {
        const i = this._destroyables.findIndex((d) => d && d.__destroyID__ === destroyable.__destroyID__);

        if (i === -1) {
            this._destroyables.push(destroyable);
            return true;
        }

        return false;
    }

    /**
     * Destroy all destroyables
     */
    private destroyDestroyables(force?: boolean): void {
        for (let i = this._destroyables.length - 1; i >= 0; i--) {
            if (
                (this._destroyables[i] && !(this._destroyables[i] as Destroyable).__destroyInFrames__) ||
                force
            ) {
                (this._destroyables[i] as Destroyable).destroy();
                Dispose(this._destroyables[i] as Destroyable);
                this._destroyables[i] = undefined;
            } else if (this._destroyables[i])
                ((this._destroyables[i] as Destroyable).__destroyInFrames__ as number)--;
        }
    }

    /**
     * @internal
     */
    public unload(): void {
        Interval.clearAll();

        this.dispatchEvent("unload");

        this.stop();

        GameObject.prepareDestroy();

        Destroy(this.physics);

        this.destroyDestroyables(true);

        Destroy(this.cameraManager);

        this.destroyDestroyables();

        this.dispatchEvent("unloaded");

        clearObject(this, true);
    }
}

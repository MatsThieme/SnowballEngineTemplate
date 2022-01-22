import { AudioMixer } from "Audio/AudioMixer";
import { AudioMixerManager } from "Audio/AudioMixerManager";
import { AudioListener } from "GameObject/Components/AudioListener";
import { Behaviour } from "GameObject/Components/Behaviour";
import { Collider } from "GameObject/Components/Collider";
import { Component } from "GameObject/Components/Component";
import { Rigidbody } from "GameObject/Components/Rigidbody";
import { Destroy, Destroyable, Destroyer } from "GameObject/Destroy";
import { GameObject } from "GameObject/GameObject";
import { Input } from "Input/Input";
import { EventTarget } from "@snowballengine/events";
import { clearObject } from "Utility/Helpers";
import { Interval } from "Utility/Interval/Interval";
import { CameraManager } from "./Camera/CameraManager";
import { Framedata } from "./Framedata";
import { GameTime } from "./GameTime";
import { Physics } from "./Physics/Physics";

export type SceneEventTypes = {
    audiolisteneradd: [listener: AudioListener];
    audiolistenerremove: [listener: AudioListener];
    start: [];
    stop: [];
    unload: [];
    unloaded: [];
};

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

    private readonly _destroyer: Destroyer;

    private _audioListener?: AudioListener;

    public audioMixerManager: AudioMixerManager<string>;

    public constructor(name: SceneName, domElement: HTMLCanvasElement) {
        super();

        this.name = name;

        Input.reset();
        GameObject.reset();
        Component.reset();

        this.audioMixerManager = new AudioMixerManager();

        this.cameraManager = new CameraManager(domElement);
        this.framedata = new Framedata();
        this._destroyer = new Destroyer();

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

        this._destroyer.destroyDestroyables();

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

        this.dispatchEvent("stop");

        this._requestAnimationFrameHandle = undefined;

        await new Interval((i) => {
            if (this._updateComplete) {
                i.clear();
            }
        }, 10);
    }

    public destroySomething(destroyable: Destroyable): boolean {
        return this._destroyer.addDestroyable(destroyable);
    }

    /**
     * @internal
     */
    public unload(): void {
        Interval.clearAll();

        this.dispatchEvent("unload");

        this.stop();

        this.audioMixerManager.reset();

        GameObject.prepareDestroy();

        Destroy(this.physics);

        this._destroyer.destroyDestroyables(true);

        Destroy(this.cameraManager);

        this._destroyer.destroyDestroyables();

        this.dispatchEvent("unloaded");

        clearObject(this, true);
    }
}

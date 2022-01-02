import { Asset } from "Assets/Asset";
import { AssetType } from "Assets/AssetType";
import { ComponentType } from "GameObject/ComponentType";
import { GameObject } from "GameObject/GameObject";
import { VideoEventTypes } from "Utility/Events/EventTypes";
import { Renderable } from "./Renderable";

/**
 *
 * Playback is controlled by asset.datas HTMLVideoElement.
 * @category Component
 *
 */
export class Video extends Renderable<VideoEventTypes> {
    private _asset?: Asset;
    private _el?: HTMLVideoElement;

    private _loop: boolean;
    private _currentTime: number;
    private _rate: number;
    private _muted: boolean;
    private readonly _endListener: () => any;

    public constructor(gameObject: GameObject) {
        super(gameObject, ComponentType.Video);

        this._loop = false;
        this._currentTime = 0;
        this._rate = 0;
        this._muted = false;
        this._endListener = (() => this.dispatchEvent("end")).bind(this);
    }

    public get asset(): Asset | undefined {
        return this._asset;
    }
    public set asset(val: Asset | undefined) {
        if (val?.type === AssetType.Video) {
            this._asset = val;
            this.sprite = val.getPIXISprite();

            this._el = <HTMLVideoElement>val.data;
            this._el.addEventListener("end", this._endListener);

            this._el.loop = this._loop;
            this._el.currentTime = this._currentTime;
        } else if (!val) {
            if (this._el) this._el.removeEventListener("end", this._endListener);
            this.sprite = this._asset = this._el = undefined;
        } else {
            throw new Error("asset.type !== AssetType.Video");
        }
    }

    public get loop(): boolean {
        return this._loop;
    }
    public set loop(val: boolean) {
        this._loop = val;

        if (this._el) this._el.loop = val;
    }

    public get currentTime(): number {
        return this._el?.currentTime || this._currentTime;
    }
    public set currentTime(val: number) {
        this._currentTime = val;

        if (this._el) this._el.currentTime = val;
    }

    public get rate(): number {
        return this._rate;
    }
    public set rate(val: number) {
        this._rate = val;

        if (this._el) this._el.playbackRate = val;
    }

    public get muted(): boolean {
        return this._muted;
    }
    public set muted(val: boolean) {
        this._muted = val;

        if (this._el) this._el.muted = val;
    }

    public get playing(): boolean {
        return <boolean>(this._el && !this._el.paused);
    }

    public get paused(): boolean {
        return this._el?.paused || false;
    }

    public get duration(): number {
        return this._el?.duration || 0;
    }

    public pause(): void {
        this._el?.pause();
        this.dispatchEvent("pause");
    }

    public play(): void {
        this._el?.play();
        this.dispatchEvent("play");
    }

    public reset(): void {
        if (this._el) {
            this.pause();
            this._currentTime = 0;
        }
    }
}

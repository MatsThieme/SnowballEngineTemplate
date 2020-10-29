import { Asset } from '../Assets/Asset.js';
import { AssetType } from '../Assets/AssetType.js';

export class InputMapping {
    [key: string]: any;
    public keyboard: { [key: number]: string };
    public mouse: { [key: number]: string | number };
    public gamepad: { [key: number]: string | number };
    public touch: { [key: number]: number };
    public constructor(mapping?: Asset) {
        this.keyboard = {};
        this.mouse = {};
        this.gamepad = {};
        this.touch = {};

        if (mapping?.type === AssetType.JSON) Object.assign(this, <object>mapping.data);
    }
    public serialize(): string {
        return JSON.stringify(this);
    }
}
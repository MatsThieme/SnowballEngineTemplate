import { Asset } from '../Assets/Asset.js';
import { AssetType } from '../Assets/AssetType.js';
import { D } from '../Debug.js';

export class InputMapping {
    readonly [key: string]: any;
    public keyboard: { [key: number]: string };
    public mouse: { [key: number]: string | number };
    public gamepad: { [key: number]: string | number };
    public touch: { [key: number]: number };
    public constructor(mapping?: Asset) {
        this.keyboard = {};
        this.mouse = {};
        this.gamepad = {};
        this.touch = {};

        if (!mapping) return;

        if (mapping.type !== AssetType.JSON) D.error('Asset.type != AssetType.JSON');
        else if (!mapping.data) D.error('mapping.data == ' + mapping.data);
        else Object.assign(this, this.replaceInputType(mapping.data));
    }
    public serialize(): string {
        return JSON.stringify(this);
    }
    private replaceInputType(mapping: any) {
        const ret: InputMapping = <any>{ keyboard: {}, mouse: {}, gamepad: {}, touch: {} };

        for (let key of Object.keys(mapping)) {
            for (let it in mapping[key]) {
                if (ret[key] != parseInt(ret[key])) Object.assign(ret[key], JSON.parse(`{"${InputType[<any>it]}":${isNaN(mapping[key][it]) ? '"' + mapping[key][it] + '"' : mapping[key][it]}}`));
            }
        }

        return ret;
    }
}
export class InputMapping {
    readonly [key: string]: any;
    public readonly keyboard: Readonly<{ [key: number]: string | undefined }>;
    public readonly mouse: Readonly<{ [key: number]: number | undefined }>;
    public readonly gamepad: Readonly<{ [key: number]: number | undefined }>;
    public readonly touch: Readonly<{ [key: number]: number | undefined }>;
    public constructor(mapping?: InputMapping) {
        this.keyboard = {};
        this.mouse = {};
        this.gamepad = {};
        this.touch = {};

        if (!mapping) return;

        Object.assign(this, this.replaceInputType(mapping));
    }
    public serialize(): string {
        return JSON.stringify(this);
    }
    private replaceInputType(mapping: any): InputMapping {
        const ret: InputMapping = <any>{ keyboard: {}, mouse: {}, gamepad: {}, touch: {} };

        for (const key in mapping) {
            for (const it in mapping[key]) {
                if (ret[key] != parseInt(ret[key])) Object.assign(ret[key], JSON.parse(`{"${InputType[<any>it]}":${isNaN(mapping[key][it]) ? '"' + mapping[key][it] + '"' : mapping[key][it]}}`));
            }
        }

        return ret;
    }
}
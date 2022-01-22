import { InputAxis } from "SnowballEngine/Input/InputAxis";
import { InputButton } from "SnowballEngine/Input/InputButton";
import { InputDevice } from "../InputDevice";
import { KeyboardAxis } from "./KeyboardAxis";
import { KeyboardButton } from "./KeyboardButton";

/** @category Input */
export class Keyboard implements InputDevice {
    private _keys: Map<KeyboardButton, InputButton>;
    private _fireListener: Map<KeyboardButton, boolean>;
    private _axesKeys: Map<KeyboardAxis, KeyboardButton[]>;

    private _onKeyDown: (e: KeyboardEvent) => void;
    private _onKeyUp: (e: KeyboardEvent) => void;

    public constructor() {
        this._keys = new Map();
        this._fireListener = new Map();
        this._axesKeys = new Map();

        this._onKeyDown = ((e: KeyboardEvent) => {
            let btn = this._keys.get(<KeyboardButton>e.code);

            if (!btn) {
                btn = new InputButton();
                this._keys.set(<KeyboardButton>e.code, btn);
            }

            btn.down = true;

            if (!btn.clicked) this._fireListener.set(<KeyboardButton>e.code, true);
        }).bind(this);

        this._onKeyUp = ((e: KeyboardEvent) => {
            let btn = this._keys.get(<KeyboardButton>e.code);

            if (!btn) {
                btn = new InputButton();
                this._keys.set(<KeyboardButton>e.code, btn);
            }

            btn.down = false;

            this._fireListener.set(<KeyboardButton>e.code, true);
        }).bind(this);

        this.addListeners();
    }

    public getButton(btn: KeyboardButton): Readonly<InputButton> | undefined {
        let b = this._keys.get(btn);

        if (b) return b;

        b = new InputButton();

        this._keys.set(btn, b);

        return b;
    }

    public getAxis(ax: KeyboardAxis): Readonly<InputAxis> | undefined {
        const keys = this.axisToKeys(ax);

        if (keys) {
            const b0 = this.getButton(keys[0]);
            if (!b0) return;

            const b1 = this.getButton(keys[1]);
            if (!b1) return;

            return new InputAxis(Number(b1.down) - Number(b0.down));
        }

        return;
    }

    private axisToKeys(axis: KeyboardAxis): KeyboardButton[] | undefined {
        if (this._axesKeys.has(axis)) return this._axesKeys.get(axis)!;

        const keys: KeyboardButton[] | undefined = <KeyboardButton[]>(
            axis.match(/^Axis\((\w+), (\w+)\)$/)?.slice(1)
        );

        if (!keys || keys.length < 2 || !KeyboardButton[keys[0]] || !KeyboardButton[keys[1]]) return;

        this._axesKeys.set(axis, keys);

        return keys;
    }

    public update(): void {
        for (const btn of Array.from(this._keys.values())) {
            btn.update();
        }
    }

    private addListeners(): void {
        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    private removeListeners(): void {
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }

    public dispose(): void {
        this.removeListeners();
    }
}

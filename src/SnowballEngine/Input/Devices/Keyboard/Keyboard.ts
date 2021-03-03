//@ts-ignore
import { Input } from '../../Input';
import { InputAxis } from '../../InputAxis';
import { InputButton } from '../../InputButton';
import { InputEvent } from '../../InputEvent';
import { InputEventTarget } from '../../InputEventTarget';
import { InputDevice } from '../InputDevice';
import { InputDeviceType } from '../InputDeviceType';
import { KeyboardAxis } from './KeyboardAxis';
import { KeyboardButton } from './KeyboardButton';

export class Keyboard extends InputEventTarget implements InputDevice {
    private _keys: Map<KeyboardButton, InputButton>;
    private _fireListener: Map<KeyboardButton, boolean>; // Map<e.code, boolean>
    private _axesKeys: Map<KeyboardAxis, KeyboardButton[]>;

    public constructor() {
        super();

        this._keys = new Map();
        this._fireListener = new Map();
        this._axesKeys = new Map();

        this.addListeners();
    }

    private onKeyDown(e: KeyboardEvent): void {
        e.preventDefault();

        let btn = this._keys.get(<KeyboardButton>e.code);

        if (!btn) {
            btn = new InputButton();
            this._keys.set(<KeyboardButton>e.code, btn);
        }

        btn.down = true;

        if (!btn.clicked) this._fireListener.set(<KeyboardButton>e.code, true);
    }

    private onKeyUp(e: KeyboardEvent): void {
        e.preventDefault();

        let btn = this._keys.get(<KeyboardButton>e.code);

        if (!btn) {
            btn = new InputButton();
            this._keys.set(<KeyboardButton>e.code, btn);
        }

        btn.down = false;

        this._fireListener.set(<KeyboardButton>e.code, true);
    }

    public getButton(btn: KeyboardButton): InputButton | undefined {
        if (!this._keys.get(btn)) this._keys.set(btn, new InputButton());

        return this._keys.get(btn);
    }

    public getAxis(ax: KeyboardAxis): InputAxis | undefined {
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

        const keys: KeyboardButton[] | undefined = <KeyboardButton[]>axis.match(/^Axis\((\w+), (\w+)\)$/)?.slice(1);

        if (!keys || keys.length < 2 || !KeyboardButton[keys[0]] || !KeyboardButton[keys[1]]) return

        this._axesKeys.set(axis, keys);

        return keys;
    }

    public update() {
        for (const btn of this._keys.values()) {
            btn.update();
        }

        for (const { cb, type } of this._listeners.values()) {
            const btn = <KeyboardButton>Input.inputMappingButtons.keyboard[type];
            const ax = <KeyboardAxis>Input.inputMappingAxes.keyboard[type];

            if (!btn && !ax || btn && !this._fireListener.get(btn) && !ax) continue;


            const keys = this.axisToKeys(ax);

            if (keys && keys[0] && !this._fireListener.get(keys[0]) && keys[1] && !this._fireListener.get(keys[1])) continue;


            const e: InputEvent = {
                type,
                deviceType: InputDeviceType.Keyboard,
                axis: ax ? this.getAxis(ax) : undefined,
                button: btn ? this.getButton(btn) : undefined,
                device: this
            }

            if (!e.axis && !e.button) continue;

            cb(e);

            if (btn) this._fireListener.set(btn, false);
        }
    }

    private addListeners(): void {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    private removeListeners(): void {
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
        window.removeEventListener('keyup', this.onKeyUp.bind(this));
    }

    public destroy(): void {
        super.destroy();
        this.removeListeners();
    }
}
import { Input } from './Input';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';
import { InputEvent } from './InputEvent';
import { InputEventTarget } from './InputEventTarget';

export class InputKeyboard extends InputEventTarget {
    private keys: Map<string, InputButton>;
    private fireListener: Map<string, boolean>; // Map<e.code, boolean>

    public constructor() {
        super();

        this.keys = new Map();
        this.fireListener = new Map();

        this.addListeners();
    }
    private onKeyDown(e: KeyboardEvent): void {
        const btn = this.keys.get(e.code) || new InputButton();
        btn.down = true;
        this.keys.set(e.code, btn);

        if (!btn.clicked) this.fireListener.set(e.code, true);
    }
    private onKeyUp(e: KeyboardEvent): void {
        const btn = this.keys.get(e.code) || new InputButton();
        btn.down = false;
        this.keys.set(e.code, btn);

        this.fireListener.set(e.code, true);
    }
    public getButton(key?: string): InputButton | undefined {
        if (key === undefined) return undefined;

        if (!this.keys.get(key)) this.keys.set(key, new InputButton());

        return this.keys.get(key);
    }
    public getAxis(key?: string): InputAxis | undefined {
        if (key === undefined) return undefined;

        const keys = this.axisToKeys(key);

        if (keys && this.getButton(keys[0]) && this.getButton(keys[1])) {
            return new InputAxis(Number(this.getButton(keys[1])!.down) - Number(this.getButton(keys[0])!.down));
        }

        return undefined;
    }
    private axisToKeys(axis?: string): string[] | undefined[] {
        return axis?.match(/^Axis\((\w+), (\w+)\)$/)?.slice(1) || [];
    }
    public update() {
        for (const btn of this.keys.values()) {
            btn.update();
        }

        for (const { cb, type } of this.listeners.values()) {
            const btn = Input.inputMappingButtons.keyboard[type];
            const ax = Input.inputMappingAxes.keyboard[type];
            const [key1, key2] = this.axisToKeys(ax);

            if (!btn && !key1 && !key2 || btn && !this.fireListener.get(btn) && key1 && !this.fireListener.get(key1) && key2 && !this.fireListener.get(key2)) continue;

            const e: InputEvent = {
                type,
                device: InputDevice.Keyboard,
                axis: this.getAxis(ax),
                button: this.getButton(btn)
            }

            if (!e.axis && !e.button) continue;

            cb(e);

            if (btn) this.fireListener.set(btn, false);
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
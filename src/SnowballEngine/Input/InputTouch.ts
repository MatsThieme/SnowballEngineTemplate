import { Input } from './Input';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';
import { InputEvent } from './InputEvent';
import { InputEventTarget } from './InputEventTarget';

export class InputTouch extends InputEventTarget {
    private _positions: InputAxis[];
    private button: InputButton;
    private fireListener: boolean;

    public constructor() {
        super();

        this.button = new InputButton();
        this._positions = [];
        this.fireListener = false;

        this.addListeners();
    }
    private onTouchEvent(e: TouchEvent): void {
        e.preventDefault();

        this._positions.splice(0);

        for (let i = 0; i < e.touches.length; i++) {
            const item = e.touches[i];
            this._positions[i] = new InputAxis([Math.round(item.clientX * window.devicePixelRatio), Math.round(item.clientY * window.devicePixelRatio)]);
        }

        this.button.down = !!e.touches.length;

        this.fireListener = true;
    }
    public getButton(index?: number): InputButton | undefined {
        if (index === undefined) return undefined;

        return index === 0 ? this.button : new InputButton();
    }
    public getAxis(index?: number): Readonly<InputAxis> | undefined {
        if (index === undefined) return undefined;

        return this._positions[index];
    }
    public update(): void {
        this.button.update();

        if (!this.fireListener) return;

        for (const { cb, type } of this.listeners.values()) {
            const btn = Input.inputMappingButtons.mouse[type];
            const ax = Input.inputMappingAxes.mouse[type];

            const e: InputEvent = {
                type,
                device: InputDevice.Keyboard,
                axis: this.getAxis(ax!),
                button: this.getButton(btn!)
            }

            if (!e.axis && !e.button) continue;

            cb(e);
        }

        this.fireListener = false;
    }

    private addListeners(): void {
        window.addEventListener('touchstart', this.onTouchEvent.bind(this));
        window.addEventListener('touchend', this.onTouchEvent.bind(this));
        window.addEventListener('touchmove', this.onTouchEvent.bind(this));
    }

    private removeListeners(): void {
        window.removeEventListener('touchstart', this.onTouchEvent.bind(this));
        window.removeEventListener('touchend', this.onTouchEvent.bind(this));
        window.removeEventListener('touchmove', this.onTouchEvent.bind(this));
    }

    public destroy(): void {
        super.destroy();
        this.removeListeners();
    }
}
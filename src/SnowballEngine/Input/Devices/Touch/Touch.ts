import { Input } from '../../Input';
import { InputAxis } from '../../InputAxis';
import { InputButton } from '../../InputButton';
import { InputEvent } from '../../InputEvent';
import { InputEventTarget } from '../../InputEventTarget';
import { InputDevice } from '../InputDevice';
import { InputDeviceType } from '../InputDeviceType';
import { TouchAxis } from './TouchAxis';
import { TouchButton } from './TouchButton';

/** @category Input */
export class Touch extends InputEventTarget implements InputDevice {
    private _positions: InputAxis[];
    private _button: InputButton;
    private _fireListener: boolean;

    public constructor() {
        super();

        this._button = new InputButton();
        this._positions = [];
        this._fireListener = false;

        this.addListeners();
    }

    private onTouchEvent(e: TouchEvent): void {
        e.preventDefault();

        this._positions.splice(0);

        for (let i = 0; i < e.touches.length; i++) {
            const item = e.touches[i];
            this._positions[i] = new InputAxis([Math.round(item.clientX * window.devicePixelRatio), Math.round(item.clientY * window.devicePixelRatio)]);
        }

        this._button.down = !!e.touches.length;

        this._fireListener = true;
    }

    public getButton(btn: TouchButton): Readonly<InputButton> | undefined {
        if (btn === 0) return this._button;

        return;
    }

    public getAxis(ax: TouchAxis): Readonly<InputAxis> | undefined {
        return this._positions[ax];
    }

    public update(): void {
        this._button.update();

        if (!this._fireListener) return;

        for (const { cb, type } of this._listeners.values()) {
            const btn = <TouchButton | undefined>Input.inputMappingButtons.touch[type];
            const ax = <TouchAxis | undefined>Input.inputMappingAxes.touch[type];

            const e: InputEvent = {
                type,
                deviceType: InputDeviceType.Touch,
                axis: ax ? this.getAxis(ax) : undefined,
                button: btn ? this.getButton(btn) : undefined,
                device: this
            }

            if (!e.axis && !e.button) continue;

            cb(e);
        }

        this._fireListener = false;
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
import projectConfig from 'Config';
import { Input } from '../../Input';
import { InputAxis } from '../../InputAxis';
import { InputButton } from '../../InputButton';
import { InputEvent } from '../../InputEvent';
import { InputEventTarget } from '../../InputEventTarget';
import { InputDevice } from '../InputDevice';
import { InputDeviceType } from '../InputDeviceType';
import { MouseAxis } from './MouseAxis';
import { MouseButton } from './MouseButton';

/** @category Input */
export class Mouse extends InputEventTarget implements InputDevice {
    /**
     * 
     * Pointer position on canvas.
     * 
     */
    private _position: InputAxis;
    private _prevPosition: InputAxis;
    private _buttons: InputButton[];
    private _fireListener: boolean;

    public constructor() {
        super();

        this._buttons = [];
        this._position = new InputAxis();
        this._prevPosition = new InputAxis();
        this._fireListener = false;

        this.addListeners();
    }

    private onMouseMove(e: MouseEvent): void {
        this._prevPosition.values = this._position.values;
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        this._fireListener = true;
    }

    private onMouseUp(e: MouseEvent): void {
        this._prevPosition.values = this._position.values;
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        if (!this._buttons[e.button]) this._buttons[e.button] = new InputButton();

        this._buttons[e.button].down = false;

        this._fireListener = true;
    }

    private onMouseDown(e: MouseEvent): void {
        this._prevPosition.values = this._position.values;
        this._position.values = [Math.round(e.clientX * window.devicePixelRatio), Math.round(e.clientY * window.devicePixelRatio)];

        if (!this._buttons[e.button]) this._buttons[e.button] = new InputButton();

        this._buttons[e.button].down = true;

        this._fireListener = true;
    }

    private onContextMenu(e: MouseEvent): void {
        e.preventDefault()
    }

    public getButton(btn: MouseButton): Readonly<InputButton> | undefined {
        return this._buttons[btn];
    }

    public getAxis(ax: MouseAxis): Readonly<InputAxis> | undefined {
        if (ax === 0) return this._position;
        if (ax === 1) return new InputAxis([this._position.values[0]]);
        if (ax === 2) return new InputAxis([this._position.values[1]]);
        if (ax === 3) return new InputAxis(this._prevPosition.v2.sub(this._position.v2).values);

        return undefined;
    }

    public update(): void {
        this._buttons.forEach(b => b.update());

        if (!this._fireListener) return;

        for (const { cb, type } of this._listeners.values()) {
            const btn = <MouseButton | undefined>Input.inputMappingButtons.mouse[type];
            const ax = <MouseAxis | undefined>Input.inputMappingAxes.mouse[type];

            const e: InputEvent = {
                type,
                deviceType: InputDeviceType.Mouse,
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
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        if (!projectConfig.settings.allowContextMenu) window.addEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    private removeListeners(): void {
        window.removeEventListener('mousedown', this.onMouseDown.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('contextmenu', this.onContextMenu.bind(this));
    }

    public destroy(): void {
        super.destroy();
        this.removeListeners();
    }
}
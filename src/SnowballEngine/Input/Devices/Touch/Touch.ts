import { Scene } from 'SnowballEngine/Scene';
import { EventTarget } from 'Utility/Events/EventTarget';
import { InputEventTypes } from 'Utility/Events/EventTypes';
import { Input } from '../../Input';
import { InputAxis } from '../../InputAxis';
import { InputButton } from '../../InputButton';
import { InputEvent } from '../../InputEvent';
import { InputDevice } from '../InputDevice';
import { InputDeviceType } from '../InputDeviceType';
import { TouchAxis } from './TouchAxis';
import { TouchButton } from './TouchButton';

/** @category Input */
export class Touch extends EventTarget<InputEventTypes> implements InputDevice {
    private _positions: InputAxis[];
    private _button: InputButton;
    private _fireListener: boolean;

    private _onTouchEvent: (e: TouchEvent) => void;

    public constructor() {
        super();

        this._button = new InputButton();
        this._positions = [];
        this._fireListener = false;



        this._onTouchEvent = ((e: TouchEvent) => {
            e.preventDefault();

            this._positions.splice(0);

            for (let i = 0; i < e.touches.length; i++) {
                const item = e.touches[i];
                this._positions[i] = new InputAxis([Math.round(item.clientX * window.devicePixelRatio * Scene.currentScene.cameraManager.renderScale), Math.round(item.clientY * window.devicePixelRatio * Scene.currentScene.cameraManager.renderScale)]);
            }

            this._button.down = !!e.touches.length;

            this._fireListener = true;
        }).bind(this);



        this.addListeners();
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

        for (const type of <InputAction[]>Object.keys(this.getEvents())) {
            const btn = <TouchButton | undefined>Input.inputMappingButtons.touch[type];
            const ax = <TouchAxis | undefined>Input.inputMappingAxes.touch[type];

            if (btn === undefined && ax === undefined) continue;

            const e: InputEvent = {
                type,
                deviceType: InputDeviceType.Touch,
                axis: ax !== undefined ? this.getAxis(ax) : undefined,
                button: btn !== undefined ? this.getButton(btn) : undefined,
                device: this
            }

            if (!e.axis && !e.button) continue;

            this.dispatchEvent(type, e);
        }


        this._fireListener = false;
    }

    private addListeners(): void {
        window.addEventListener('touchstart', this._onTouchEvent);
        window.addEventListener('touchend', this._onTouchEvent);
        window.addEventListener('touchmove', this._onTouchEvent);
    }

    private removeListeners(): void {
        window.removeEventListener('touchstart', this._onTouchEvent);
        window.removeEventListener('touchend', this._onTouchEvent);
        window.removeEventListener('touchmove', this._onTouchEvent);
    }

    public dispose(): void {
        this.removeListeners();
    }
}
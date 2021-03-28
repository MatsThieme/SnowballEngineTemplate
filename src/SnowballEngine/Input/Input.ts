import { Dispose } from 'GameObject/Dispose';
import InputMappingAxes from '../../../Assets/InputMappingAxes.json';
import InputMappingButtons from '../../../Assets/InputMappingButtons.json';
import { Gamepad } from './Devices/Gamepad/Gamepad';
import { InputDeviceType } from './Devices/InputDeviceType';
import { Keyboard } from './Devices/Keyboard/Keyboard';
import { Mouse } from './Devices/Mouse/Mouse';
import { Touch } from './Devices/Touch/Touch';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputEvent } from './InputEvent';
import { InputMapping } from './InputMapping';

/** @category Input */
export class Input {
    private static _devices: InputDeviceType = 0b1111;
    public static readonly touch?: Touch;
    public static readonly mouse?: Mouse;
    public static readonly keyboard?: Keyboard;
    public static readonly gamepad?: typeof Gamepad;

    public static inputMappingButtons: InputMapping;
    public static inputMappingAxes: InputMapping;

    public static start() {
        if (Input._devices & InputDeviceType.Touch) (<any>Input).touch = new Touch();
        if (Input._devices & InputDeviceType.Mouse) (<any>Input).mouse = new Mouse();
        if (Input._devices & InputDeviceType.Keyboard) (<any>Input).keyboard = new Keyboard();
        if (Input._devices & InputDeviceType.Gamepad) {
            (<any>Input).gamepad = Gamepad;
            Gamepad.init();
        }

        Input.inputMappingButtons = new InputMapping(<any>InputMappingButtons);
        Input.inputMappingAxes = new InputMapping(<any>InputMappingAxes);
    }

    /**
    *
    * Control which devices should be updated and considered when calling getButton or getAxis.
    *
    */
    public static get devices(): InputDeviceType {
        return Input._devices;
    }

    public static set devices(val: InputDeviceType) {
        Input._devices = val;


        if (val & InputDeviceType.Gamepad) {
            if (!Input.gamepad) {
                (<any>Input).gamepad = Gamepad;
                Input.gamepad!.init();
            }
        } else {
            if (Input.gamepad) {
                Input.gamepad.reset();
                delete (<any>Input).gamepad;
            }
        }


        if (val & InputDeviceType.Keyboard) {
            if (!Input.keyboard) {
                (<any>Input).keyboard = new Keyboard();
            }
        } else {
            if (Input.keyboard) {
                Dispose(Input.keyboard);
                delete (<any>Input).keyboard;
            }
        }


        if (val & InputDeviceType.Mouse) {
            if (!Input.mouse) {
                (<any>Input).mouse = new Mouse();
            }
        } else {
            if (Input.mouse) {
                Dispose(Input.mouse);
                delete (<any>Input).mouse;
            }
        }


        if (val & InputDeviceType.Touch) {
            if (!Input.touch) {
                (<any>Input).touch = new Touch();
            }
        } else {
            if (Input.touch) {
                Dispose(Input.touch);
                delete (<any>Input).touch;
            }
        }
    }

    /**
     * 
     * Returns an InputButton object mapped to the given inputtype.
     * 
     */
    public static getButton(t: InputAction): InputButton {
        const btns: InputButton[] = [];

        for (const device of ['keyboard', 'mouse', 'gamepad', 'touch']) {
            if ((<any>this)[device] && this.inputMappingButtons[device][t] !== undefined) {

                const b = <InputButton>(<any>this)[device].getButton(this.inputMappingButtons[device][t]);

                if (b) {
                    if (b.down && b.click) return b;
                    else if (b.down) btns.unshift(b);
                    else if (b.clicked) btns.push(b);
                }
            }
        }

        return btns[0] || new InputButton();
    }

    /**
     * 
     * Returns an InputAxis object mapped to the given inputtype.
     * 
     */
    public static getAxis(t: InputAction): InputAxis {
        const axes: InputAxis[] = [];

        for (const device of ['keyboard', 'mouse', 'gamepad', 'touch']) {
            if ((<any>Input)[device] && Input.inputMappingAxes[device][t] !== undefined) {

                const a = <InputAxis>(<any>Input)[device].getAxis(<string | number>Input.inputMappingAxes[device][t]);

                if (a) {
                    if (a.values.reduce((t, c) => t + Math.abs(c), 0) / a.values.length < 0.1) continue;

                    if (!axes[0] || Math.abs(a.values[0]) + a.values.reduce((t, c) => t + Math.abs(c), 0) > Math.abs(axes[0].values[0]) + axes[0].values.reduce((t, c) => t + Math.abs(c), 0)) axes.unshift(a);
                    else if (a.values[0] !== undefined) axes.push(a);
                }
            }
        }

        return axes[0] || new InputAxis();
    }

    public static update(): void {
        if (Input.touch) Input.touch.update();
        if (Input.mouse) Input.mouse.update();
        if (Input.keyboard) Input.keyboard.update();
        if (Input.gamepad) Input.gamepad.update();
    }

    /**
     * 
     * Listener will only be added to existing devices.
     * If Input.devices changes afterwards, existing listeners won't be added to new devices, but removed from removed devices
     * 
     */
    public static addListener(type: InputAction, cb: (event: InputEvent) => any, id: string = 'inputListenerID' + Math.random() + performance.now(), devices: InputDeviceType = 0b1111): string {
        if (devices & InputDeviceType.Touch && Input.touch) Input.touch.addListener(type, cb, id);
        if (devices & InputDeviceType.Mouse && Input.mouse) Input.mouse.addListener(type, cb, id);
        if (devices & InputDeviceType.Keyboard && Input.keyboard) Input.keyboard.addListener(type, cb, id);
        if (devices & InputDeviceType.Gamepad && Input.gamepad) Input.gamepad.addListener(type, cb, id);

        return id;
    }

    public static removeListener(id: string, devices: InputDeviceType = 0b1111): void {
        if (devices & InputDeviceType.Touch && Input.touch) Input.touch.removeListener(id);
        if (devices & InputDeviceType.Mouse && Input.mouse) Input.mouse.removeListener(id);
        if (devices & InputDeviceType.Keyboard && Input.keyboard) Input.keyboard.removeListener(id);
        if (devices & InputDeviceType.Gamepad && Input.gamepad) Input.gamepad.removeListener(id);
    }

    public static reset(): void {
        if (Input.touch) Dispose(Input.touch);
        if (Input.mouse) Dispose(Input.mouse);
        if (Input.keyboard) Dispose(Input.keyboard);
        Input.gamepad?.reset();

        Input.start();
    }
}
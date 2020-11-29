import InputMappingAxes from '../../../Assets/InputMappingAxes.json';
import InputMappingButtons from '../../../Assets/InputMappingButtons.json';
import { clearObject } from '../Helpers';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';
import { InputEvent } from './InputEvent';
import { InputGamepad } from './InputGamepad';
import { InputKeyboard } from './InputKeyboard';
import { InputMapping } from './InputMapping';
import { InputMouse } from './InputMouse';
import { InputTouch } from './InputTouch';

export class Input {
    private static _devices: InputDevice = 0b1111;
    public static readonly touch?: InputTouch;
    public static readonly mouse?: InputMouse;
    public static readonly keyboard?: InputKeyboard;
    public static readonly gamepad?: InputGamepad;
    public static inputMappingButtons: InputMapping;
    public static inputMappingAxes: InputMapping;
    public static start() {
        if (Input._devices & InputDevice.Touch) (<any>Input).touch = new InputTouch();
        if (Input._devices & InputDevice.Mouse) (<any>Input).mouse = new InputMouse();
        if (Input._devices & InputDevice.Keyboard) (<any>Input).keyboard = new InputKeyboard();
        if (Input._devices & InputDevice.Gamepad) (<any>Input).gamepad = new InputGamepad();


        Input.inputMappingButtons = new InputMapping(<any>InputMappingButtons);
        Input.inputMappingAxes = new InputMapping(<any>InputMappingAxes);
    }

    /**
    *
    * Control which devices should be updated and considered when calling getButton or getAxis.
    *
    */
    public static get devices(): InputDevice {
        return Input._devices;
    }

    public static set devices(val: InputDevice) {
        Input._devices = val;

        for (const i of [{ p: 'touch', c: InputTouch, t: InputDevice.Touch }, { p: 'mouse', c: InputMouse, t: InputDevice.Mouse }, { p: 'keyboard', c: InputKeyboard, t: InputDevice.Keyboard }, { p: 'gamepad', c: InputGamepad, t: InputDevice.Gamepad }]) {
            if (val & i.t) {
                if (!(<any>this)[i.p]) {
                    (<any>this)[i.p] = new i.c();
                }
            } else if (this.touch) {
                (<any>this)[i.p].destroy();
                delete (<any>this)[i.p];
            }
        }
    }


    /**
     * 
     * Returns a InputButton object mapped to the given inputtype.
     * 
     */
    public static getButton(t: InputType): InputButton {
        if (['keyboard', 'mouse', 'gamepad', 'touch'].map(n => this.inputMappingButtons[n][t]).filter(x => x == undefined).length === 0) return new InputButton();

        const btns = [this.keyboard?.getButton(<string>this.inputMappingButtons.keyboard[t]), this.touch?.getButton(<number>this.inputMappingButtons.touch[t]), this.mouse?.getButton(<number>this.inputMappingButtons.mouse[t]), this.gamepad?.getButton(<number>this.inputMappingButtons.gamepad[t])].filter(e => e && e.down != undefined).sort((a, b) => (b!.down ? b!.clicked ? 2 : 1 : 0) - (a!.down ? a!.clicked ? 2 : 1 : 0));

        return <InputButton>btns[0] || new InputButton();
    }

    /**
     * 
     * Returns the axis with the largest absolute value mapped to the given inputtype.
     * 
     */
    public static getAxis(t: InputType): InputAxis {
        const axes: InputAxis[] = <any>[Input.keyboard?.getAxis(<string>Input.inputMappingAxes.keyboard[t]), Input.touch?.getAxis(<number>Input.inputMappingAxes.touch[t]), Input.mouse?.getAxis(<number>Input.inputMappingAxes.mouse[t]), Input.gamepad?.getAxis(<number>Input.inputMappingAxes.gamepad[t])].filter(e => e && e.values.length).sort((a, b) => Math.abs(b!.values.reduce((t, c) => t + c, 0)) - Math.abs(a!.values.reduce((t, c) => t + c, 0)));

        for (const axis of axes) {
            if (axis.values.length && axis.values.reduce((t, c) => t + c, 0) !== 0) return axis;
        }

        return axes[0] || new InputAxis();
    }
    public static update(): void {
        Input.touch?.update();
        Input.mouse?.update();
        Input.keyboard?.update();
        Input.gamepad?.update();
    }

    public static addListener(type: InputType, cb: (event: InputEvent) => any, id: string = 'ilid' + Math.random() + performance.now(), devices: InputDevice = 0b1111): string {
        if (devices & InputDevice.Touch) Input.touch?.addListener(type, cb, id);
        if (devices & InputDevice.Mouse) Input.mouse?.addListener(type, cb, id);
        if (devices & InputDevice.Keyboard) Input.keyboard?.addListener(type, cb, id);
        if (devices & InputDevice.Gamepad) Input.gamepad?.addListener(type, cb, id);

        return id;
    }

    public static removeListener(id: string, devices: InputDevice = 0b1111): void {
        if (devices & InputDevice.Touch) Input.touch?.removeListener(id);
        if (devices & InputDevice.Mouse) Input.mouse?.removeListener(id);
        if (devices & InputDevice.Keyboard) Input.keyboard?.removeListener(id);
        if (devices & InputDevice.Gamepad) Input.gamepad?.removeListener(id);
    }

    public static reset(): void {
        Input.touch?.destroy();
        Input.mouse?.destroy();
        Input.keyboard?.destroy();
        Input.gamepad?.destroy();

        Input.start();
    }
}
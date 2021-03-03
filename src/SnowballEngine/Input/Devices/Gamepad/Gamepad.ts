import { Input } from '../../Input';
import { InputAxis } from '../../InputAxis';
import { InputButton } from '../../InputButton';
import { InputEvent } from '../../InputEvent';
import { InputEventTarget } from '../../InputEventTarget';
import { InputDevice } from '../InputDevice';
import { InputDeviceType } from '../InputDeviceType';
import { GamepadAxis } from './GamepadAxis';
import { GamepadButton } from './GamepadButton';

export class Gamepad extends InputEventTarget implements InputDevice {
    private static _gamepads: (Gamepad | undefined)[] = [];

    public readonly gamepad: globalThis.Gamepad;
    public readonly id: number;

    private readonly _buttons: InputButton[];

    public constructor(gamepad: globalThis.Gamepad) {
        super();

        this.gamepad = gamepad;
        this.id = gamepad.index;

        console.log(this.gamepad);

        this._buttons = [];
    }

    public get connected(): boolean {
        return this.gamepad.connected;
    }

    public getButton(btn: GamepadButton): InputButton | undefined {
        if (!this._buttons[btn]) return;

        return this._buttons[btn];
    }

    /**
     * 
     * Query the gamepads axes, indecies > axes.length will return button.value (axes.length+1 == buttons[0].value) 
     * 
     */
    public getAxis(ax: GamepadAxis): InputAxis | undefined {
        if (this.gamepad.axes[ax]) return new InputAxis(ax % 2 !== 0 ? -this.gamepad.axes[ax] : this.gamepad.axes[ax]);

        if (ax === GamepadAxis.LeftTrigger) return new InputAxis(this.gamepad.buttons[6].value);

        if (ax === GamepadAxis.RightTrigger) return new InputAxis(this.gamepad.buttons[7].value);

        if (ax === GamepadAxis.LeftStick) return new InputAxis([this.gamepad.axes[0], -this.gamepad.axes[1]]);

        if (ax === GamepadAxis.RightStick) return new InputAxis([this.gamepad.axes[2], -this.gamepad.axes[3]]);


        return;
    }

    /**
     * Gamepad vibration
     * 
     * @param value intensity 0-1
     * @param duration duration in milliseconds
     * 
     * TODO: 
     * Fit the specification when final(https://w3c.github.io/gamepad/extensions.html#dom-gamepadhapticactuator)
     * change id: number to type: 'vibration' | 'etc'
     */
    public async pulse(id: number, value: number, duration: number): Promise<boolean> {
        if ('vibrationActuator' in this.gamepad) {
            return await (<any>this.gamepad).vibrationActuator.playEffect('dual-rumble', {
                duration,
                strongMagnitude: value,
                weakMagnitude: value
            });
        }

        return await this.gamepad.hapticActuators[id]?.pulse(value, duration);
    }

    public update(): void {
        for (let i = 0; i < this.gamepad.buttons.length; i++) {
            if (!this._buttons[i]) this._buttons[i] = new InputButton();

            this._buttons[i].down = this.gamepad.buttons[i].pressed;

            this._buttons[i].update();
        }

        for (const { cb, type } of this._listeners.values()) {
            const btn = <GamepadButton>Input.inputMappingButtons.gamepad[type];
            const ax = <GamepadAxis>Input.inputMappingAxes.gamepad[type];

            if (!btn && !ax) continue;

            const e: InputEvent = {
                type,
                deviceType: InputDeviceType.Gamepad,
                axis: ax ? this.getAxis(ax) : undefined,
                button: btn ? this.getButton(btn) : undefined,
                device: this
            }

            if (!e.axis && !e.button) continue;

            cb(e);
        }
    }

    /** TODO: return button / axis with most input */
    public static getButton(key: number): InputButton | undefined {
        return Gamepad.gamepads[0]?.getButton(key);
    }

    public static getAxis(key: number): InputAxis | undefined {
        return Gamepad.gamepads[0]?.getAxis(key);
    }

    // private static updateGamepads(): void {
    //     const gpads = [...<globalThis.Gamepad[]>navigator.getGamepads()].filter(g => g?.mapping === 'standard');

    //     for (let i = 0; i < Math.max(gpads.length, Gamepad._gamepads.length); i++) {
    //         if (!Gamepad._gamepads[i] && gpads[i]) Gamepad._gamepads[i] = new Gamepad(gpads[i]);
    //         if (Gamepad._gamepads[i] && !gpads[i]) Gamepad._gamepads[i] = undefined;
    //     }
    // }

    public static get gamepads(): Gamepad[] {
        return <Gamepad[]>Gamepad._gamepads.filter(Boolean);
    }

    private static onGamepadConnected(e: GamepadEvent) {
        if (!Gamepad._gamepads[e.gamepad.index]) Gamepad._gamepads[e.gamepad.index] = new Gamepad(e.gamepad);
    }

    private static onGamepadDisconnected(e: GamepadEvent) {
        if (Gamepad._gamepads[e.gamepad.index]) {
            Gamepad._gamepads[e.gamepad.index]!.destroy();
            Gamepad._gamepads[e.gamepad.index] = undefined;
        }
    }

    public static update(): void {
        const gpads = navigator.getGamepads();

        for (let i = 0; i < gpads.length; i++) {
            if (this._gamepads[i]) {
                if ((<any>window).chrome) {
                    (<any>this)._gamepads[i].gamepad = gpads[i];
                }

                this._gamepads[i]!.update();
            }
        }

    }

    public static init(): void {
        Gamepad._gamepads = [];

        Gamepad.addListeners();
    }

    public static reset() {
        for (const g of Gamepad.gamepads) {
            g.destroy();
        }

        Gamepad._gamepads = [];
        Gamepad.removeListeners();
    }

    private static addListeners(): void {
        window.addEventListener(<any>'gamepadconnected', Gamepad.onGamepadConnected);
        window.addEventListener(<any>'gamepaddisconnected', Gamepad.onGamepadDisconnected);
    }

    private static removeListeners(): void {
        window.removeEventListener(<any>'gamepadconnected', Gamepad.onGamepadConnected);
        window.removeEventListener(<any>'gamepaddisconnected', Gamepad.onGamepadDisconnected);
    }



    public static addListener(type: InputAction, cb: (e: InputEvent) => any, id: string): string {
        for (const g of Gamepad._gamepads) {
            if (g) {
                g.addListener(type, cb, id);
            }
        }

        return id;
    }

    public static removeListener(id: string): void {
        for (const g of Gamepad._gamepads) {
            if (g) {
                g.removeListener(id);
            }
        }
    }
}
import { Dispose } from "GameObject/Dispose";
import { InputAxis } from "SnowballEngine/Input/InputAxis";
import { InputButton } from "SnowballEngine/Input/InputButton";
import { InputDevice } from "../InputDevice";
import { GamepadAxis } from "./GamepadAxis";
import { GamepadButton } from "./GamepadButton";

/** @category Input */
export class Gamepad implements InputDevice {
    private static _gamepads: (Gamepad | undefined)[] = [];

    public readonly gamepad: globalThis.Gamepad;
    public readonly id: number;

    private readonly _buttons: InputButton[];

    public constructor(gamepad: globalThis.Gamepad) {
        this.gamepad = gamepad;
        this.id = gamepad.index;

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
    public getAxis(ax: GamepadAxis): Readonly<InputAxis> | undefined {
        if (this.gamepad.axes[ax])
            return new InputAxis(ax % 2 !== 0 ? -this.gamepad.axes[ax] : this.gamepad.axes[ax]);

        if (ax === GamepadAxis.LeftTrigger) return new InputAxis(this.gamepad.buttons[6].value);

        if (ax === GamepadAxis.RightTrigger) return new InputAxis(this.gamepad.buttons[7].value);

        if (ax === GamepadAxis.LeftStick) return new InputAxis([this.gamepad.axes[0], -this.gamepad.axes[1]]);

        if (ax === GamepadAxis.RightStick)
            return new InputAxis([this.gamepad.axes[2], -this.gamepad.axes[3]]);

        return;
    }

    public update(): void {
        for (let i = 0; i < this.gamepad.buttons.length; i++) {
            if (!this._buttons[i]) this._buttons[i] = new InputButton();

            this._buttons[i].down = this.gamepad.buttons[i].pressed;

            this._buttons[i].update();
        }
    }

    /** TODO: return button / axis with most input */
    public static getButton(key: number): Readonly<InputButton> | undefined {
        return Gamepad.gamepads[0]?.getButton(key);
    }

    public static getAxis(key: number): Readonly<InputAxis> | undefined {
        return Gamepad.gamepads[0]?.getAxis(key);
    }

    public static get gamepads(): Gamepad[] {
        return <Gamepad[]>Gamepad._gamepads.filter(Boolean);
    }

    private static onGamepadConnected(e: GamepadEvent) {
        if (!Gamepad._gamepads[e.gamepad.index]) Gamepad._gamepads[e.gamepad.index] = new Gamepad(e.gamepad);
    }

    private static onGamepadDisconnected(e: GamepadEvent) {
        if (Gamepad._gamepads[e.gamepad.index]) {
            Dispose(Gamepad._gamepads[e.gamepad.index]!);
            Gamepad._gamepads[e.gamepad.index] = undefined;
        }
    }

    public static update(): void {
        const gpads = (<any>window).chrome ? navigator.getGamepads() : undefined;

        for (let i = 0; i < (gpads ? gpads.length : this._gamepads.length); i++) {
            if (this._gamepads[i]) {
                if (gpads) {
                    (<Mutable<Gamepad>>this._gamepads[i]).gamepad = gpads[i]!;
                }

                this._gamepads[i]!.update();
            }
        }
    }

    public static init(): void {
        Gamepad._gamepads = [];

        Gamepad.addListeners();
    }

    public static reset(): void {
        for (const g of Gamepad.gamepads) {
            Dispose(g);
        }

        Gamepad._gamepads = [];
        Gamepad.removeListeners();
    }

    private static addListeners(): void {
        window.addEventListener(<any>"gamepadconnected", Gamepad.onGamepadConnected);
        window.addEventListener(<any>"gamepaddisconnected", Gamepad.onGamepadDisconnected);
    }

    private static removeListeners(): void {
        window.removeEventListener(<any>"gamepadconnected", Gamepad.onGamepadConnected);
        window.removeEventListener(<any>"gamepaddisconnected", Gamepad.onGamepadDisconnected);
    }
}

import { GamepadAxis } from './Devices/Gamepad/GamepadAxis';
import { GamepadButton } from './Devices/Gamepad/GamepadButton';
import { KeyboardAxis } from './Devices/Keyboard/KeyboardAxis';
import { KeyboardButton } from './Devices/Keyboard/KeyboardButton';
import { MouseAxis } from './Devices/Mouse/MouseAxis';
import { MouseButton } from './Devices/Mouse/MouseButton';
import { TouchAxis } from './Devices/Touch/TouchAxis';
import { TouchButton } from './Devices/Touch/TouchButton';

export class InputMapping {
    readonly [key: string]: any;
    public readonly keyboard: Readonly<{ [key in InputAction]?: KeyboardButton | KeyboardAxis }>;
    public readonly mouse: Readonly<{ [key in InputAction]?: MouseButton | MouseAxis }>;
    public readonly gamepad: Readonly<{ [key in InputAction]?: GamepadButton | GamepadAxis }>;
    public readonly touch: Readonly<{ [key in InputAction]?: TouchButton | TouchAxis }>;

    public constructor(mapping: InputMapping) {
        this.keyboard = <any>{};
        this.mouse = <any>{};
        this.gamepad = <any>{};
        this.touch = <any>{};

        Object.assign(this, mapping);
    }

    public serialize(): string {
        return JSON.stringify(this);
    }
}
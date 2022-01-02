import { GamepadAxis } from "./Devices/Gamepad/GamepadAxis";
import { GamepadButton } from "./Devices/Gamepad/GamepadButton";
import { KeyboardAxis } from "./Devices/Keyboard/KeyboardAxis";
import { KeyboardButton } from "./Devices/Keyboard/KeyboardButton";
import { MouseAxis } from "./Devices/Mouse/MouseAxis";
import { MouseButton } from "./Devices/Mouse/MouseButton";
import { TouchAxis } from "./Devices/Touch/TouchAxis";
import { TouchButton } from "./Devices/Touch/TouchButton";

/** @category Input */
export interface InputMapping {
    readonly [key: string]: any;
    readonly keyboard: Readonly<{ [key in InputAction]?: KeyboardButton | KeyboardAxis }>;
    readonly mouse: Readonly<{ [key in InputAction]?: MouseButton | MouseAxis }>;
    readonly gamepad: Readonly<{ [key in InputAction]?: GamepadButton | GamepadAxis }>;
    readonly touch: Readonly<{ [key in InputAction]?: TouchButton | TouchAxis }>;
}

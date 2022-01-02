import { InputAxis } from "../InputAxis";
import { InputButton } from "../InputButton";

/** @category Input */
export interface InputDevice {
    getButton(key: string | number): Readonly<InputButton> | undefined;
    getAxis(key: string | number): Readonly<InputAxis> | undefined;
}

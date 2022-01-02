import { InputDevice } from "./Devices/InputDevice";
import { InputDeviceType } from "./Devices/InputDeviceType";
import { InputAxis } from "./InputAxis";
import { InputButton } from "./InputButton";

/** @category Input */
export interface InputEvent {
    readonly button?: Readonly<InputButton>;
    readonly axis?: Readonly<InputAxis>;
    readonly deviceType: InputDeviceType;
    readonly type: InputAction;
    readonly device: InputDevice;
}

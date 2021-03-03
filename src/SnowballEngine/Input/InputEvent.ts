import { InputDevice } from './Devices/InputDevice';
import { InputDeviceType } from './Devices/InputDeviceType';
import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';

export interface InputEvent {
    readonly button?: InputButton,
    readonly axis?: InputAxis,
    readonly deviceType: InputDeviceType,
    readonly type: InputAction,
    readonly device: InputDevice
}
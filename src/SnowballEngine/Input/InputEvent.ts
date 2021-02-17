import { InputAxis } from './InputAxis';
import { InputButton } from './InputButton';
import { InputDevice } from './InputDevice';

export interface IInputEvent {
    readonly button?: InputButton,
    readonly axis?: InputAxis,
    readonly device: InputDevice,
    readonly type: InputType
}
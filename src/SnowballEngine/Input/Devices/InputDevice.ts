import { InputAxis } from '../InputAxis';
import { InputButton } from '../InputButton';

export interface InputDevice {
    getButton(key: string | number): InputButton | undefined;
    getAxis(key: string | number): InputAxis | undefined;
}
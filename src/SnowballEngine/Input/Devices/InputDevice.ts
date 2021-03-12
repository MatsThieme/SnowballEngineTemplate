import { InputAxis } from '../InputAxis';
import { InputButton } from '../InputButton';

export interface InputDevice {
    getButton(key: string | number): Readonly<InputButton> | undefined;
    getAxis(key: string | number): Readonly<InputAxis> | undefined;
}
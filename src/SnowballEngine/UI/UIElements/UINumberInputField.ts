import { Asset } from '../../Assets/Asset.js';
import { Input } from '../../Input/Input.js';
import { UIElementType } from '../UIElementType.js';
import { UIMenu } from '../UIMenu.js';
import { UIInputField } from './UIInputField.js';

export class UINumberInputField extends UIInputField {
    public _value: number;
    public constructor(menu: UIMenu, input: Input, font: Asset) {
        super(menu, input, font, UIElementType.NumberInputField);

        this._value = 0;
    }
    public set value(val: number) {
        this._value = val;
        this.domElement.value = val.toString();
    }
    public get value(): number {
        return this._value;
    }
}
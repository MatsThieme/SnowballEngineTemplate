import { Asset } from '../../Assets/Asset';
import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIInputField } from './UIInputField';

export class UINumberInputField extends UIInputField {
    public _value: number;

    public constructor(menu: UIMenu, font: Asset) {
        super(menu, font, UIElementType.NumberInputField);

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
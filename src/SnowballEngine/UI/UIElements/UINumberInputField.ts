import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIInputField } from './UIInputField';

/** @category UI */
export class UINumberInputField extends UIInputField<number> {
    public constructor(menu: UIMenu) {
        super(menu, UIElementType.NumberInputField);

        this.value = this._prevValue = 0;
    }
}
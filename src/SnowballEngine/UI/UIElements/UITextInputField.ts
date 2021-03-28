import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIInputField } from './UIInputField';

/** @category UI */
export class UITextInputField extends UIInputField<string> {
    public constructor(menu: UIMenu) {
        super(menu, UIElementType.TextInputField);

        this.value = this._prevValue = 'text';
    }
}
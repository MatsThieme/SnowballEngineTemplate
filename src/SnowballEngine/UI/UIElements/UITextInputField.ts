import { Asset } from '../../Assets/Asset.js';
import { Input } from '../../Input/Input.js';
import { UIElementType } from '../UIElementType.js';
import { UIMenu } from '../UIMenu.js';
import { UIInputField } from './UIInputField.js';

export class UITextInputField extends UIInputField {
    public value: string;
    public constructor(menu: UIMenu, input: Input, font: Asset) {
        super(menu, input, font, UIElementType.TextInputField);

        this.value = '';
    }
}
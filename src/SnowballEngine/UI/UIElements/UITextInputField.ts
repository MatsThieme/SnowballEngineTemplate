import { Asset } from '../../Assets/Asset';
import { Input } from '../../Input/Input';
import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIInputField } from './UIInputField';

export class UITextInputField extends UIInputField {
    public value: string;
    public constructor(menu: UIMenu, input: Input, font: Asset) {
        super(menu, input, font, UIElementType.TextInputField);

        this.value = '';
    }
}
import { Asset } from '../../Assets/Asset';
import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIInputField } from './UIInputField';

export class UITextInputField extends UIInputField {
    public value: string;

    public constructor(menu: UIMenu, font: Asset) {
        super(menu, font, UIElementType.TextInputField);

        this.value = '';
    }
}
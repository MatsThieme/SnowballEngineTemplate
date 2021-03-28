import { UIElementType } from '../UIElementType';
import { UIMenu } from '../UIMenu';
import { UIText } from './UIText';

/** @category UI */
export class UIButton extends UIText {
    public constructor(menu: UIMenu) {
        super(menu, UIElementType.Button);
    }

    public update(): boolean {
        if (!super.update()) return false;

        if (this.click && this.onInput) {
            this.onInput(this);
        }

        return true;
    }
}
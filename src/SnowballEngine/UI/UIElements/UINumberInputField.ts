import { UIElementType } from "UI/UIElementType";
import { UIMenu } from "UI/UIMenu";
import { UIInputField } from "./UIInputField";

/** @category UI */
export class UINumberInputField extends UIInputField<number> {
    public constructor(menu: UIMenu, name: string) {
        super(menu, name, UIElementType.NumberInputField);

        this.value = this._prevValue = 0;
    }
}

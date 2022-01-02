import { UIElementType } from "UI/UIElementType";
import { UIMenu } from "UI/UIMenu";
import { UIInputField } from "./UIInputField";

/** @category UI */
export class UITextInputField extends UIInputField<string> {
    public constructor(menu: UIMenu, name: string) {
        super(menu, name, UIElementType.TextInputField);

        this.value = this._prevValue = "text";
    }
}

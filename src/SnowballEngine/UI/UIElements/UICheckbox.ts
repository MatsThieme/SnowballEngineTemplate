import { Sprite } from '@pixi/sprite';
import { BitmapText } from '@pixi/text-bitmap';
import { Asset } from 'SnowballEngine/Assets/Asset';
import { AssetType } from 'SnowballEngine/Assets/AssetType';
import { Client } from 'SnowballEngine/Client';
import { Scene } from 'SnowballEngine/Scene';
import { Color } from 'SnowballEngine/Utilities/Color';
import { Shape } from 'SnowballEngine/Utilities/Shape/Shape';
import { Vector2 } from 'SnowballEngine/Utilities/Vector2';
import { UIElementType } from '../UIElementType';
import { UIFonts } from '../UIFonts';
import { UIMenu } from '../UIMenu';
import { UIElement } from './UIElement';

export class UICheckbox extends UIElement {
    private _checked: boolean;

    private _defaultCheckmark: boolean;
    private _defaultCheckbox: boolean;
    private _checkmarkAsset!: Asset;
    private _checkboxAsset!: Asset;
    private _checkmarkSprite!: Sprite;
    private _checkboxSprite!: Sprite;

    private _bitmapText: BitmapText;

    public constructor(menu: UIMenu) {
        super(menu, UIElementType.Checkbox);

        this._checked = true;

        this._bitmapText = new BitmapText('', { fontName: menu.font || Scene.currentScene.ui.font });

        this.container.addChild(this._bitmapText);

        this._defaultCheckmark = this._defaultCheckbox = true;

        this.checkboxAsset = Shape.createSprite('Rect', Color.black, new Vector2(500, 500), 3);
        this.checkmarkAsset = Shape.createSprite('Checkmark', Color.black, new Vector2(500, 500), 3);
    }

    /**
     * 
     * Checkbox checked?
     * 
     */
    public get checked(): boolean {
        return this._checked;
    }
    public set checked(val: boolean) {
        this._checked = val;

        this._checkmarkSprite.visible = val;
    }


    public get checkboxAsset(): Asset {
        return this._checkboxAsset;
    }
    public set checkboxAsset(val: Asset) {
        if (val?.type !== AssetType.Image) throw new Error('Asset.type !== AssetType.Image');

        if (this._defaultCheckbox && this._checkboxSprite) {
            this._checkboxSprite.destroy({ children: true, texture: true, baseTexture: true });
            this._defaultCheckbox = false;
        } else if (this._checkboxSprite) this._checkboxSprite.destroy({ children: true, texture: true, baseTexture: false });

        this._checkboxSprite = val.getPIXISprite()!;
        this._checkboxAsset = val;

        this.container.addChild(this._checkboxSprite);
    }

    public get checkmarkAsset(): Asset {
        return this._checkmarkAsset;
    }
    public set checkmarkAsset(val: Asset) {
        if (val?.type !== AssetType.Image) throw new Error('Asset.type !== AssetType.Image');

        if (this._defaultCheckmark && this._checkmarkSprite) {
            this._checkmarkSprite.destroy({ children: true, texture: true, baseTexture: true });
            this._defaultCheckmark = false;
        } else if (this._checkmarkSprite) this._checkmarkSprite.destroy({ children: true, texture: true, baseTexture: false });

        this._checkmarkSprite = val.getPIXISprite()!;
        this._checkmarkAsset = val;

        this.container.addChild(this._checkmarkSprite);

        this._checkmarkSprite.visible = this._checked;
    }


    public get font(): UIFont {
        return <UIFont>this._bitmapText.fontName;
    }
    public set font(val: UIFont) {
        this._bitmapText.fontName = val;
        this._bitmapText.updateText();
    }

    public get text(): string {
        return this._bitmapText.text;
    }
    public set text(val: string) {
        this._bitmapText.text = val;
    }

    public get tint(): Color {
        const color = new Color();

        color.rgb = this._bitmapText.tint;

        return color;
    }
    public set tint(val: Color) {
        this._bitmapText.tint = this._checkmarkSprite.tint = this._checkboxSprite.tint = val.rgb;
    }

    /**
     * 
     * Update checked property.
     * 
     */
    public update(): boolean {
        if (!super.update()) return false;

        if (this.click) {
            this.checked = !this._checked;

            if (this.onInput) {
                this.onInput(this);
            }
        }

        this._bitmapText.scale.set(Client.resolution.y / Client.resolution.x, 1);

        const style = UIFonts.getStyle(<UIFont>this._bitmapText.fontName)!;
        const fontSize = <number>style.fontSize;

        const lines = [...this._bitmapText.text.matchAll(/\n/g)].length + 1;


        const ratio = this._bitmapText.width / this._bitmapText.height;

        this._bitmapText.height = fontSize * lines + fontSize * 0.11;
        this._bitmapText.width = ratio * fontSize * lines * (1 + 0.2 / lines);


        this._checkboxSprite.width = this._checkmarkSprite.width = this._bitmapText.height * (Client.resolution.y / Client.resolution.x);
        this._checkboxSprite.height = this._checkmarkSprite.height = this._bitmapText.height;

        this._checkmarkSprite.position.copyFrom(this._scaledPadding);
        this._checkboxSprite.position.copyFrom(this._scaledPadding);

        this._bitmapText.position.copyFrom(this._scaledPadding.clone.add(new Vector2(this._checkboxSprite.width, 0)));


        return true;
    }
}
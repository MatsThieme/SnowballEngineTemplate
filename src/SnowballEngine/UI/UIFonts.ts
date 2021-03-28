import { TextStyle } from '@pixi/text';
import { BitmapFont } from '@pixi/text-bitmap';
import { Client } from 'SnowballEngine/Client';
import { Debug } from '../Debug';

/** @category UI */
export class UIFonts {
    private static readonly _fonts: Map<UIFont, { style: BitmapTextStyle, font: BitmapFont }>;

    public static init(): void {
        (<any>UIFonts)._fonts = new Map();

        this.add('Default-Small', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 2.5
        }));

        this.add('Default-Normal', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 5,
            padding: 100
        }));

        this.add('Default-Large', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 10
        }));

        window.addEventListener('resize', () => {
            UIFonts.update();
        });
    }

    public static add(name: UIFont, style: BitmapTextStyle, chars: string | string[] | string[][] = BitmapFont.ASCII): void {
        if (UIFonts._fonts.has(name)) throw new Error(`Font with name ${name} exists`);

        if (typeof style.fontSize !== 'number') throw new Error('FontStyle.fontSize must be of type number');

        const resolution = <number>style.fontSize / 100 * (Client.resolution.y / <number>style.fontSize);

        UIFonts._fonts.set(name, { style, font: BitmapFont.from(name, style, { resolution: Math.round(512 * resolution) / 512, textureHeight: Math.round(512 * resolution), textureWidth: Math.round(512 * resolution), chars }) });
    }

    public static remove(name: UIFont): void {
        if (!UIFonts._fonts.has(name)) return Debug.warn(`Font with name ${name} does not exist`);

        BitmapFont.uninstall(name);

        UIFonts._fonts.delete(name);
    }

    public static modify(name: UIFont, newstyle: BitmapTextStyle): void {
        if (!UIFonts._fonts.has(name)) throw new Error(`Font with name ${name} does not exist`);

        UIFonts.remove(name);

        UIFonts.add(name, newstyle);
    }

    private static update(): void {
        for (const [name, font] of [...UIFonts._fonts.entries()]) {
            UIFonts.modify(name, font.style);
        }
    }

    public static get(name: UIFont): BitmapFont | undefined {
        return UIFonts._fonts.get(name)?.font;
    }

    public static getStyle(name: UIFont): BitmapTextStyle | undefined {
        return UIFonts._fonts.get(name)?.style;
    }
}
import { TextStyle } from '@pixi/text';
import { BitmapFont } from '@pixi/text-bitmap';
import { Client } from 'SnowballEngine/Client';
import { Debug } from 'SnowballEngine/Debug';

/** @category UI */
export class UIFonts {
    private static readonly _fonts: Map<UIFont, { style: BitmapTextStyle, font: BitmapFont, bytes: number }>;
    private static lastInnerHeight: number = 0;

    public static init(): void {
        (<any>UIFonts)._fonts = new Map();

        this.add('Default-Small', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 2.5
        }));

        this.add('Default-Normal', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 5
        }));

        this.add('Default-Large', new TextStyle({
            fontFamily: 'Verdana, Tahoma, sans-serif',
            fontSize: 10
        }));

        window.addEventListener('resize', () => {
            if (Client.resolution.y !== this.lastInnerHeight) {
                UIFonts.update();
                this.lastInnerHeight = Client.resolution.y;
            }
        });
    }

    public static get bytesUsed(): number {
        let bytes = 0;

        for (const f of this._fonts.values()) {
            bytes += f.bytes;
        }

        return bytes;
    }

    public static add(name: UIFont, style: BitmapTextStyle, chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789;:-/\\&%$"!.,() '): void {
        if (UIFonts._fonts.has(name)) throw new Error(`Font with name ${name} exists`);

        if (typeof style.fontSize !== 'number') throw new Error('FontStyle.fontSize must be of type number');

        const fontSize = Math.floor(style.fontSize / 100 * Client.resolution.y);
        const strokeThickness = Math.floor((style.strokeThickness || 0) / 100 * Client.resolution.y);

        let width = fontSize * 1.5 * chars.length;
        if (width > 4096) width /= Math.ceil(width / 4096);
        width = Math.round(width);

        const font = BitmapFont.from(name, { ...style, fontSize, strokeThickness }, { resolution: 1, textureHeight: Math.round(fontSize * 1.3), textureWidth: width, chars });

        const pageTextures = font.pageTextures;

        let size = 0;

        for (const id in pageTextures) {
            size += pageTextures[id].baseTexture.width * pageTextures[id].baseTexture.height;
        }

        size *= 4;

        UIFonts._fonts.set(name, { style, font, bytes: size });
    }

    public static remove(name: UIFont): void {
        if (!UIFonts._fonts.has(name)) return Debug.warn(`Font with name ${name} does not exist`);

        UIFonts._fonts.get(name)!.font.destroy();

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
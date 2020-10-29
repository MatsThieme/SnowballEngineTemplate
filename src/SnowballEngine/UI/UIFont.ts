import { Client } from '../Client.js';
import { Vector2 } from '../Vector2.js';
import { UIFontSize } from './UIFontSize.js';

export class UIFont {
    /**
     * 
     * Returns a font string, font size adjusts to menu size.
     * 
     */
    public static getCSSFontString(name: string, size: UIFontSize = UIFontSize.Medium) {
        return `${Math.round(size * Client.resolution.magnitude / 200)}px ${name}`;
    }

    /**
     * 
     * Returns values parsed from a font string.
     * 
     */
    public static parseFontString(font: string): { size: number, name: string } {
        return { size: parseInt((<any>font.match(/[^\d]*(\d+)px.*/))[1]), name: (<any>font.match(/.*px (\w+).*/))[1] };
    }

    /**
     * 
     * Calculates the width and height in % of the text relative to the viewport using the font string.
     * 
     */
    public static measureText(text: string, font: string): Vector2 {
        const { size, name } = UIFont.parseFontString(font);
        const el = document.createElement('div');
        el.style.fontFamily = name;
        el.style.fontSize = size + 'px';
        el.textContent = text;
        el.style.display = 'inline-block';
        el.style.visibility = 'hidden';
        document.body.appendChild(el);


        const cS = getComputedStyle(el);
        const width = parseFloat(cS.width);
        const height = parseFloat(cS.height);

        el.remove();

        return new Vector2(width / Client.resolution.x * 100, height / Client.resolution.y * 100);
    }
}
import { Client } from '../Client';
import { Vector2 } from '../Utilities/Vector2';
import { UIFontSize } from './UIFontSize';

export class UIFont {
    /**
     * 
     * Returns a font string, font size adjusts to menu size.
     * 
     */
    public static getCSSFontString(name: string, size: UIFontSize = UIFontSize.Medium): string {
        return `${Math.round(size * (<Vector2>Client.resolution).magnitude / 200)}px ${name}`;
    }

    /**
     * 
     * Returns values parsed from a font string.
     * 
     */
    public static parseFontString(font: string): { size: number, name: string } {
        let match = font.match(/[^\d]*(\d+)px.*/);

        if (!match) throw new Error('Invalid font-string');

        const size = parseInt(match[1]);

        match = font.match(/.*px (\w+).*/);

        if (!match) throw new Error('Invalid font-string');

        const name = match[1];

        return { size, name };
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
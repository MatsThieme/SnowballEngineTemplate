import { D } from './Debug.js';

export function Canvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');

    canvas.width = width || 1;
    canvas.height = height || 1;

    if (!canvas.getContext('2d'))
        D.error('canvas.getContext(\'2d\') == null');

    return canvas;
}
import { Asset } from './Assets/Asset';
import { AssetType } from './Assets/AssetType';
import { Canvas } from './Canvas';
import { D } from './Debug';

/**
 * 
 * Clamps a number between min and max.
 * 
 */
export const clamp = (min: number, max: number, val: number) => val < min ? min : val > max ? max : val;

/**
 * 
 * Resolves after ms.
 * 
 * @param ms milliseconds to wait before resolve.
 * 
 */
export const asyncTimeout = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 *
 * Computes the linear interpolation between a and b for the parameter t.
 *
 */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * 
 * Calculate the average of numbers.
 * 
 */
export const average = (...numbers: number[]): number => numbers.reduce((t, c) => t + c, 0) / numbers.length;

/**
 * 
 * Execute code that may only be executed in a user event triggered context, e.g. fullscreen api or pointerlock api.
 * 
 * @param cb Call on user event.
 * @param params Parameters to pass the callback on user event.
 * 
 * @returns Returns Promise which resolves as result of callback.
 * 
 */
export function triggerOnUserInputEvent<T>(cb: (...args: any[]) => T | Promise<T>, ...params: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
        async function end(e: MouseEvent | KeyboardEvent | TouchEvent) {
            if (!e.isTrusted) return;

            try {
                const result = await cb(...params);
                resolve(result);
            }
            catch (error) {
                D.error(error);
            }

            window.removeEventListener('mousedown', end);
            window.removeEventListener('mouseup', end);
            window.removeEventListener('keypress', end);
            window.removeEventListener('keyup', end);
            window.removeEventListener('touchstart', end);
        }

        window.addEventListener('mousedown', end);
        window.addEventListener('mouseup', end);
        window.addEventListener('keypress', end);
        window.addEventListener('touchstart', end);
        window.addEventListener('touchmove', end);
    });
}

/**
 * 
 * Simplified version of setInterval, the interval can be cleared by calling cb's parameter clear.
 * 
 */
export function interval(cb: (clear: () => void) => void, ms: number): void {
    const i = window.setInterval(() => cb(() => window.clearInterval(i)), ms);
}

/**
 * 
 * Create an Image Asset from a canvas.
 * 
 */
export function createSprite(f: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => any, width: number = 100, height: number = 100): Asset {
    const canvas = Canvas(width, height);
    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    f(context, canvas);

    return new Asset(canvas.toDataURL(), AssetType.Image, canvas);
}

/**
 * 
 * Returns a function which returns the elapsed time in milliseconds since stopwatch() was called.
 * 
 */
export function stopwatch(): () => number {
    const start = performance.now();
    return () => performance.now() - start;
}

/**
 * 
 * Deletes properties and prototype.
 * 
 * @param setnull if true, properties will be set to null instead of deletion
 */
export function clearObject(object: object, setnull: boolean = false) {
    Object.setPrototypeOf(object, null);

    for (const key of Object.keys(object)) {
        if (setnull) (<any>object)[key] = null
        else delete (<any>object)[key];
    }
}

/**
 * 
 * internally used for InputType
 * 
 */
export function createENUM<T>(): T {
    const props = new Map<string, number>();
    const nums = new Map<number, string>();

    let counter = 0;

    const handler = {
        get: function (target: any, property: string) {
            if (props.has(property)) return props.get(property);
            if (!isNaN(<any>property)) return nums.get(parseInt(property));

            props.set(property, counter);
            nums.set(counter, property);

            return counter++;
        }
    };

    return <T>new Proxy({}, handler);
}

export function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
}


export const cantorPairingFunction = (a: number, b: number) => ((a + b) / 2) * (a + b + 1) + b;
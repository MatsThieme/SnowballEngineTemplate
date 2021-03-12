import { Asset } from '../Assets/Asset';
import { AssetType } from '../Assets/AssetType';
import { D } from '../Debug';
import { Canvas } from './Canvas';
import { Color } from './Color';

/**
 * 
 * Clamps a number between min and max.
 * 
 */
export const clamp = (min: number, max: number, val: number): number => val < min ? min : val > max ? max : val;

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
export function triggerOnUserInputEvent<T, U>(cb: (...args: U[]) => T | Promise<T>, ...params: U[]): Promise<T> {
    return new Promise(resolve => {
        async function end(e: MouseEvent | KeyboardEvent | TouchEvent) {
            if (!e.isTrusted) return;

            try {
                const result = await cb(...params);
                resolve(result);
            }
            catch (error) {
                D.warn(error);
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


const intervals: number[] = [];

/**
 * 
 * Simplified version of setInterval, the interval can be cleared by calling cb's parameter clear.
 * 
 */
export function interval(cb: (clear: () => void, handle: number) => void, ms: number, dontClearOnUnload = false): void {
    const clear = () => window.clearInterval(intervals.splice(intervals.findIndex(v => v === i), 1)[0]);

    const i: number = window.setInterval(() => cb(clear, i), ms);

    if (!dontClearOnUnload) intervals.push(i);
}

export function clearAllIntervals(): void {
    for (const i of intervals.splice(0)) {
        window.clearInterval(i);
    }
}

/**
 * 
 * Create an Image Asset from a canvas.
 * 
 */
export function createSprite(f: Color | ((context: CanvasRenderingContext2D, canvas: Canvas) => void), width = 1, height = 1): Asset {
    const canvas = new Canvas(width, height);
    const context = canvas.context2D();

    context.imageSmoothingEnabled = false;

    if ('rgba' in f) {
        context.fillStyle = f.rgbaString;
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else f(context, canvas);

    return new Asset(canvas.toDataURL(), AssetType.Image, canvas);
}

/**
 * 
 * Deletes properties and prototype to remove references and allow garbage collection.
 * 
 * @param setnull if true, properties will be set to null instead of deletion
 */
export function clearObject(object: Record<string, any>, setnull = false): void {
    Object.setPrototypeOf(object, null);

    for (const key of Object.keys(object)) {
        if (setnull) object[key] = null
        else delete object[key];
    }
}

/**
 * 
 * Dynamically created and initialized ENUM.
 * 
 */
export function createENUM<T>(): T {
    let counter = 0;

    return <T>(<unknown>new Proxy({ props: new Map<string, number>(), nums: new Map<number, string>() }, {
        get: function (target, property: string) {
            if (target.props.has(property)) return target.props.get(property);
            if (!isNaN(Number(property))) return target.nums.get(parseInt(property));

            target.props.set(property, counter);
            target.nums.set(counter, property);

            return counter++;
        }
    }));
}

export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export const cantorPairingFunction = (a: number, b: number): number => ((a + b) / 2) * (a + b + 1) + b;
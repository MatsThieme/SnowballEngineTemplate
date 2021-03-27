import { D } from '../Debug';

/**
 * 
 * Clamps a number between min and max.
 * 
 */
export const clamp = (min: number, max: number, val: number): number => val < min ? min : val > max ? max : val;

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

export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
import { Debug } from "../Debug";

/**
 * Clamp a number between min and max.
 */
export const clamp = (min: number, max: number, val: number): number => Math.max(min, Math.min(max, val));

/**
 * Compute the linear interpolation between a and b for the parameter t.
 */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Calculate the average of numbers.
 */
export function average(...numbers: number[]): number {
    let sum = 0;

    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }

    return sum / numbers.length;
}

/**
 * Execute code that may only be executed in a user event triggered context, e.g. fullscreen api or pointerlock api.
 *
 * @param cb Call on user event.
 * @param params Parameters to pass the callback on user event.
 *
 * @returns Returns Promise which resolves as result of callback.
 */
export function triggerOnUserInputEvent<T, U>(
    cb: (...args: U[]) => T = () => undefined as unknown as T,
    ...params: U[]
): Promise<T> {
    return new Promise((resolve) => {
        const end = (event: MouseEvent | KeyboardEvent | TouchEvent): void => {
            if (!event.isTrusted) return;

            try {
                resolve(cb(...params));
            } catch (error) {
                Debug.warn(typeof error === "object" ? JSON.stringify(error) : String(error));
            }

            window.removeEventListener("mousedown", end);
            window.removeEventListener("mouseup", end);
            window.removeEventListener("keypress", end);
            window.removeEventListener("keyup", end);
            window.removeEventListener("touchstart", end);
        };

        window.addEventListener("mousedown", end);
        window.addEventListener("mouseup", end);
        window.addEventListener("keypress", end);
        window.addEventListener("touchstart", end);
        window.addEventListener("touchmove", end);
    });
}

/**
 * Remove properties and prototype to remove references and help garbage collection.
 * @param setnull if true, properties will be set to null instead of beeing deleted.
 */
export function clearObject<T extends string | number | symbol>(
    object: Partial<Record<T, unknown>>,
    setnull = false
): void {
    Object.setPrototypeOf(object, null);

    if (setnull) {
        for (const key in object) {
            object[key] = null;
        }
    } else {
        for (const key in object) {
            delete object[key];
        }
    }
}

/**
 * @returns Returns a number greater than or equal to min but less than max.
 *
 */
export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
/**
 * @returns Returns an integer greater than or equal to min but less than max.
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}

export function randomString(
    length = 10,
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
): string {
    let str = "";

    for (let i = 0; i < length; i++) {
        str += characters[randomInt(0, characters.length)];
    }

    return str;
}

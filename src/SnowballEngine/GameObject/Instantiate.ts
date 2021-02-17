import { GameObject } from './GameObject';

/**
 * 
 * @param name GameObject's name
 * @param cbs initializer functions, gameObject is the newly instantiated gameObject
 */
export async function Instantiate(name: string, ...cbs: ((gameObject: GameObject) => any)[]): Promise<GameObject> {
    const gameObject = new GameObject(name);

    for (const cb of cbs) {
        await cb(gameObject);
    }

    return gameObject;
}
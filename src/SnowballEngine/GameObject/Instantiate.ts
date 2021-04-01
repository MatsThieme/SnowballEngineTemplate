import { GameObject } from './GameObject';

/**
 * @category Scene
 * @param name GameObject's name
 * @param initializer initializer functions, gameObject is the newly instantiated gameObject
 */
export async function Instantiate(name: string, ...initializer: ((gameObject: GameObject) => any)[]): Promise<GameObject> {
    if (name.includes('/')) throw new Error('Name must not include /');

    const gameObject = new GameObject(name);

    for (const i of initializer) {
        await i(gameObject);
    }

    return gameObject;
}
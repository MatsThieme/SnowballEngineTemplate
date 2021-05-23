import { GameObject } from './GameObject';

/**
 * @category Scene
 * @param name GameObject's name
 * @param initializer initializer function, gameObject is the newly instantiated gameObject
 * @param moreInitializer optional rest parameter for more initializer functions
 */
export async function Instantiate(name: string, initializer: (gameObject: GameObject) => any, ...moreInitializer: ((gameObject: GameObject) => any)[]): Promise<GameObject> {
    if (name.includes('/')) throw new Error('Name must not include /');

    const gameObject = new GameObject(name, false);

    await initializer(gameObject);

    for (const i of moreInitializer) {
        await i(gameObject);
    }

    if (gameObject.scene.isRunning) {
        gameObject.start();
    }

    return gameObject;
}
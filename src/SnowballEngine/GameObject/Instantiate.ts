import { GameObject } from "./GameObject";

/**
 * @category Scene
 * @param name GameObject's name
 * @param initializer initializer function, gameObject is the newly instantiated gameObject
 * @param moreInitializer optional rest parameter for more initializer functions
 */
export function Instantiate(
    name: string,
    initializer: (gameObject: GameObject) => unknown,
    ...moreInitializer: ((gameObject: GameObject) => unknown)[]
): GameObject {
    name = name.trim();

    if (!/[\w()]+/.test(name))
        throw new Error("Name may contain a-z, A-Z, 0-9, _ and () only");

    const gameObject = new GameObject(name, false);

    initializer(gameObject);

    moreInitializer.forEach((initializer) => initializer(gameObject));

    if (gameObject.scene.isRunning) {
        gameObject.start();
    }

    return gameObject;
}

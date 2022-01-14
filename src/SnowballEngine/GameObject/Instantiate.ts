import { GameObject } from "./GameObject";

/**
 * @category Scene
 * @param name GameObject's name
 * @param initializer initializer functions with the newly instantiated gameObject as parameter.
 */
export function Instantiate(
    name: string,
    ...initializer: [(gameObject: GameObject) => void, ...((gameObject: GameObject) => void)[]]
): GameObject {
    name = name.trim();

    if (!/[\w()]+/.test(name)) throw new Error("Name may contain a-z, A-Z, 0-9, _ and () only");

    const gameObject = new GameObject(name, false);

    for (const init of initializer) {
        init(gameObject);
    }

    gameObject.scene.isRunning && gameObject.start();

    return gameObject;
}

import { Scene } from "./Scene";

/** @category Scene */
export class SceneManager {
    private static _scene?: Scene;
    private static readonly _scenes: Partial<Record<SceneName, (scene: Scene) => Promise<void> | void>> = {};

    public static add(name: SceneName, sceneInitializer: (scene: Scene) => Promise<void> | void): void {
        if (this._scenes[name]) throw new Error("Scene exists");

        this._scenes[name] = sceneInitializer;
    }

    public static async load(name: SceneName): Promise<Scene | undefined> {
        const initializer = this._scenes[name];

        if (!initializer) throw new Error(`No Scene named ${name} found`);

        if (this._scene) this._scene.unload();
        this._scene = new Scene(name);
        await initializer(this._scene);
        this._scene.start();

        return this._scene;
    }

    /**
     *
     * Returns the loaded Scene instance.
     *
     */
    public static getScene(): Scene | undefined {
        return this._scene;
    }
}

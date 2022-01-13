import { Scene } from "./Scene";

/** @category Scene */
export class SceneManager {
    public readonly canvasElement: HTMLCanvasElement;
    public readonly domElement: HTMLElement;

    private _scene?: Scene;
    private readonly _scenes: Partial<Record<SceneName, (scene: Scene) => Promise<void> | void>> = {};

    private static _instance: SceneManager;

    constructor(id: string) {
        SceneManager._instance = this;

        this.domElement = document.getElementById(id) || document.body;
        this.canvasElement = document.createElement("canvas");
        this.domElement.appendChild(this.canvasElement);
    }

    public add(name: SceneName, sceneInitializer: (scene: Scene) => Promise<void> | void): void {
        if (this._scenes[name]) throw new Error("Scene exists");

        this._scenes[name] = sceneInitializer;
    }

    public async load(name: SceneName): Promise<Scene> {
        const initializer = this._scenes[name];

        if (!initializer) throw new Error(`No Scene named ${name} found`);

        if (this._scene) this._scene.unload();
        this._scene = new Scene(name, this.canvasElement);
        await initializer(this._scene);
        this._scene.start();

        return this._scene;
    }

    /**
     * Returns the loaded Scene instance.
     */
    public getCurrentScene(): Scene | undefined {
        return this._scene;
    }

    public static getInstance(): SceneManager | undefined {
        return this._instance;
    }
}

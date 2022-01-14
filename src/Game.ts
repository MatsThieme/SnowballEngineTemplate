import { MainScene } from "Scenes/MainScene";
import { Assets, Color, SceneManager, Shape, Timeout } from "SE";

export class Game {
    async initialize(sceneManager: SceneManager): Promise<void> {
        // register scenes
        sceneManager.add("Main Scene", MainScene);

        /**
         * load from asset database:
         * await Assets.loadFromAssetDB();
         *
         * or load a single asset
         * await Assets.load("path/to/asset", AssetType.Image, "some image");
         *
         * or create and register an asset manually:
         */
        Assets.set("some image", Shape.createSprite("Rect", Color.orange));

        // timeout to show example loadingscreen
        await new Timeout(1000);

        await sceneManager.load("Main Scene");
    }
}

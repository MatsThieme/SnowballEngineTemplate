import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, asyncTimeout, Color, createSprite, SceneManager } from 'se';

export class Game {
    public constructor() {
        this.initialize(new SceneManager());
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        // create scenes
        sceneManager.add('Loadingscreen', LoadingScreenScene);
        sceneManager.add('Main Scene', MainScene);


        // load scene
        await sceneManager.load('Loadingscreen');

        /**
         * load from asset database:
         * await Assets.loadFromAssetDB();
         * 
         * or load a single asset
         * await Assets.load('path/to/asset', AssetType.Image, 'some image');
         * 
         * or create and register an asset manually:
         */
        Assets.set(createSprite(Color.orange), 'some image');


        // timeout to show example loadingscreen
        await asyncTimeout(1000);


        await sceneManager.load('Main Scene');
    }
}
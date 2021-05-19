import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, Color, SceneManager, Shape, Timeout } from 'SE';

export class Game {
    public constructor(private readonly sceneManager = new SceneManager()) {
        this.initialize(this.sceneManager);
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        // register scenes
        sceneManager.add('Loading Screen Scene', LoadingScreenScene);
        sceneManager.add('Main Scene', MainScene);


        // load scene
        await sceneManager.load('Loading Screen Scene');


        /**
         * load from asset database:
         * await Assets.loadFromAssetDB();
         * 
         * or load a single asset
         * await Assets.load('path/to/asset', AssetType.Image, 'some image');
         * 
         * or create and register an asset manually:
         */
        Assets.set(Shape.createSprite('Rect', Color.orange), 'some image');


        // timeout to show example loadingscreen
        await new Timeout(1000);


        await sceneManager.load('Main Scene');
    }
}
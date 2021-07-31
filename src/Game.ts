import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, Color, GameObject, SceneManager, Shape, Timeout } from 'SE';
import { RunTestsBehaviour } from 'test/RunTestsBehaviour';
import { TestScene } from 'test/TestScene';

export class Game {
    async initialize(sceneManager: SceneManager): Promise<void> {
        // register scenes
        sceneManager.add('Loading Screen Scene', LoadingScreenScene);
        sceneManager.add('Main Scene', MainScene);
        sceneManager.add('Test Scene', TestScene);


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
        Assets.set('some image', Shape.createSprite('Rect', Color.orange));


        // timeout to show example loadingscreen
        await new Timeout(1000);

        RunTestsBehaviour; GameObject; // keep references to not remove their imports when imports are organized
        // uncomment to run tests
        // await Assets.loadFromAssetDB();
        // await sceneManager.load('Test Scene');
        // await GameObject.find('run tests')!.getComponent(RunTestsBehaviour)!.getEventPromise('destroy');


        await sceneManager.load('Main Scene');
    }
}
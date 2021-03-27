import { CameraPrefab } from 'Prefabs/CameraPrefab';
import { ExampleGameObjectPrefab } from 'Prefabs/ExampleGameObjectPrefab';
import { FPSDisplayPrefab } from 'Prefabs/FPSDisplayPrefab';
import { Instantiate, Scene } from 'se';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await Instantiate('something', ExampleGameObjectPrefab);

    // add a camera
    await Instantiate('Camera', CameraPrefab);

    await scene.ui.addMenu('FPS Display', FPSDisplayPrefab);
}
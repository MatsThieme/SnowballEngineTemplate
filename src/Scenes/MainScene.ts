import { CameraPrefab } from '../Prefabs/CameraPrefab';
import { ExampleGameObjectPrefab } from '../Prefabs/ExampleGameObjectPrefab';
import { FPSDisplayPrefab } from '../Prefabs/FPSDisplayPrefab';
import { Scene } from '../SnowballEngine/SE';

export async function MainScene(scene: Scene) {
    // add gameobjects to scene
    await scene.addGameObject('something', ExampleGameObjectPrefab);

    // add a camera
    scene.addGameObject('Camera', CameraPrefab);

    scene.ui.addMenu('fpsDisplay', FPSDisplayPrefab);
}
import { CameraPrefab } from '../Prefabs/CameraPrefab';
import { LoadingScreenPrefab } from '../Prefabs/LoadingScreenPrefab';
import { Scene } from '../SnowballEngine/SE';

export function LoadingScreenScene(scene: Scene) {
    // add a camera
    scene.addGameObject('Camera', CameraPrefab);

    // show something to the waiting user
    scene.ui.addMenu('Loadingscreen', LoadingScreenPrefab);
}
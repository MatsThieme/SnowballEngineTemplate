import { CameraPrefab } from '../Prefabs/CameraPrefab';
import { LoadingScreenPrefab } from '../Prefabs/LoadingScreenPrefab';
import { Instantiate } from '../SnowballEngine/GameObject/Instantiate';
import { Scene } from '../SnowballEngine/SE';

export function LoadingScreenScene(scene: Scene) {
    // add a camera
    Instantiate('Camera', CameraPrefab);

    // show something to the waiting user
    scene.ui.addMenu('Loadingscreen', LoadingScreenPrefab);
}
import { CameraPrefab } from 'Prefabs/CameraPrefab';
import { LoadingScreenPrefab } from 'Prefabs/LoadingScreenPrefab';
import { Instantiate, Scene } from 'SE';

export async function LoadingScreenScene(scene: Scene) {
    await Instantiate('Camera', CameraPrefab);

    await scene.ui.addMenu('Loadingscreen', LoadingScreenPrefab);
}
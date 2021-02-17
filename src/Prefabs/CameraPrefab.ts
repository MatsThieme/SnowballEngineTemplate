import { Camera, Client, GameObject } from '../SnowballEngine/SE';

export function CameraPrefab(gameObject: GameObject) {
    gameObject.addComponent(Camera, camera => {
        camera.size = Client.aspectRatio;
    });
}
import { Camera, Client, GameObject } from 'se';

export function CameraPrefab(gameObject: GameObject) {
    gameObject.addComponent(Camera, camera => {
        camera.size = Client.aspectRatio;
    });
}
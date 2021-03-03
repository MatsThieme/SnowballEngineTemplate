import { Camera, Client, GameObject, Vector2 } from '../SnowballEngine/SE';

export function CameraPrefab(gameObject: GameObject) {
    gameObject.addComponent(Camera, camera => {
        camera.size = Client.aspectRatio;
        camera.screenSize = new Vector2(75, 75);
        camera.screenPosition = new Vector2(12.5, 12.5);
    });
}
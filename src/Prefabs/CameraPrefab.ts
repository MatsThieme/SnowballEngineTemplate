import { Camera, Client, GameObject, Vector2 } from '../SnowballEngine/SE';

export function CameraPrefab(gameObject: GameObject) {
    gameObject.addComponent(Camera, camera => {
        camera.size = Client.aspectRatio;
        camera.screenSize = new Vector2(50, 50);
        camera.screenPosition = new Vector2(25, 25);
    });
}
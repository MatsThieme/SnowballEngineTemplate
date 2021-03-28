import { ExampleBehaviour } from 'Behaviours/ExampleBehaviour';
import { Assets, GameObject, Texture } from 'SE';

export async function ExampleGameObjectPrefab(gameObject: GameObject) {
    gameObject.addComponent(Texture, texture => {
        texture.asset = Assets.get('some image');
    });

    // adding a behaviour will execute it's "Awake" method which is asynchronous
    await gameObject.addComponent(ExampleBehaviour);
}
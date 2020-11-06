import { ExampleBehaviour } from '../Behaviours/ExampleBehaviour.js';
import { Assets, GameObject, Texture } from '../SnowballEngine/SE.js';

export async function ExampleGameObjectPrefab(gameObject: GameObject) {
    gameObject.addComponent(Texture, texture => {
        texture.sprite = Assets.get('some image');
    });

    // adding a behaviour will execute it's "Awake" method which is asynchronous
    await gameObject.addComponent(ExampleBehaviour);
}
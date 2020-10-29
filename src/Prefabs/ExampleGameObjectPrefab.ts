import { ExampleBehaviour } from '../Behaviours/ExampleBehaviour.js';
import { Assets, GameObject, Texture } from '../SnowballEngine/SE.js';

export async function ExampleGameObjectPrefab(gameObject: GameObject) {
    gameObject.addComponent(Texture, texture => {
        texture.sprite = Assets.get('some image');
    });

    await gameObject.addComponent(ExampleBehaviour);
}
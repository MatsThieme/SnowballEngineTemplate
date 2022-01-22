import { ExampleBehaviour } from "Behaviours/ExampleBehaviour";
import { Assets, GameObject, Text, Texture } from "SE";

export function ExampleGameObjectPrefab(gameObject: GameObject) {
    const text = gameObject.addComponent(Text, (text) => {
        text.setStyle({
            fontFamily: "arial",
            align: "center",
            fontSize: 0.05 * innerHeight,
        });

        text.text = "Move me with\nW/A/S/D or\nusing a Gamepad";

        text.setZIndex(1);
    });

    gameObject.addComponent(Texture, (texture) => {
        texture.setSize(text.getSize());
        texture.asset = Assets.get("some image");
    });

    gameObject.addComponent(ExampleBehaviour);
}

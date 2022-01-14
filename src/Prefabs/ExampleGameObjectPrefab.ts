import { ExampleBehaviour } from "Behaviours/ExampleBehaviour";
import { AlignV, Assets, GameObject, Text, Texture } from "SE";

export function ExampleGameObjectPrefab(gameObject: GameObject) {
    const text = gameObject.addComponent(Text, (text) => {
        text.setStyle({
            fontFamily: "arial",
            align: "center",
            fontSize: 0.03 * innerHeight,
        });

        text.text = "Move me with\nW/A/S/D or\nusing a Gamepad";

        text.alignV = AlignV.Center;

        text.zIndex = 1;
    });

    gameObject.addComponent(Texture, (texture) => {
        texture.asset = Assets.get("some image");
        texture.size = text.size;
    });

    gameObject.addComponent(ExampleBehaviour);
}

import { AlignH, Color, Interval, SceneManager, Shape, UIMenu, UIText } from "SE";

export function FPSDisplayPrefab(menu: UIMenu): void {
    menu.active = true;
    menu.pauseScene = false;

    menu.addUIElement("FPS Display", UIText, (text) => {
        new Interval(
            () => (text.text = SceneManager.getInstance()?.getCurrentScene()?.framedata.fps.toString() ?? ""),
            1000
        );
        text.alignH = AlignH.Right;
        text.position.x = 100;
        text.font = "Default-Small";
        text.background = Shape.createSprite("Rect", Color.lime);
    });
}

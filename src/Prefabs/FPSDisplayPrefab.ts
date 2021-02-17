import { AABB, AlignH, Color, interval, UIFontSize, UIMenu, UIText, Vector2 } from '../SnowballEngine/SE';

export function FPSDisplayPrefab(menu: UIMenu): void {
    menu.aabb = new AABB(new Vector2(100, 100), new Vector2());
    menu.active = true;
    menu.pauseScene = false;
    
    menu.addUIElement(UIText, (text, scene) => {
        interval(() => text.label = scene.framedata.fps.toString(), 1000);
        text.alignH = AlignH.Right;
        text.localAlignH = AlignH.Right;
        text.fontSize = UIFontSize.Small;
        text.padding = new Vector2(1, 1);
        text.color = Color.white.rgbaString;
    });
}
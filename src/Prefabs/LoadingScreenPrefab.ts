import { AlignH, AlignV, createSprite, interval, UIFontSize, UIMenu, UIText, Vector2 } from '../SnowballEngine/SE';

export function LoadingScreenPrefab(menu: UIMenu) {
    menu.addUIElement(UIText, text => {
        text.localAlignH = AlignH.Center;
        text.localAlignV = AlignV.Center;
        text.alignH = AlignH.Center;
        text.alignV = AlignV.Center;


        let counter = 0;
        interval(clear => text.label = 'loading' + '.'.repeat(counter = ++counter % 4), 500)


        text.fontSize = UIFontSize.Medium;

        text.padding = new Vector2(1, 1);
    });

    menu.background = createSprite(c => { c.fillStyle = '#fff'; c.fillRect(0, 0, 1, 1); }, 1, 1);

    menu.active = true;
}
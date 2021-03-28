import { AlignH, AlignV, Color, Interval, Shape, UIMenu, UIText, Vector2 } from 'SE';

export function LoadingScreenPrefab(menu: UIMenu) {
    menu.addUIElement(UIText, text => {
        text.alignH = AlignH.Center;
        text.alignV = AlignV.Center;

        text.position.x = text.position.y = 50;

        let counter = 0;
        new Interval(clear => text.text = 'loading' + '.'.repeat(counter = ++counter % 4), 500)


        text.font = 'Default-Normal';

        text.padding = new Vector2(1, 1);
    });

    menu.background = Shape.createSprite('Rect', Color.white);

    menu.active = true;
}
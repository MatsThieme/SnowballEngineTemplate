import { AlignH, AlignV, Color, Interval, Shape, UIMenu, UIText } from 'SE';

export function LoadingScreenPrefab(menu: UIMenu) {
    menu.addUIElement('Loading Screen', UIText, text => {
        text.alignH = AlignH.Center;
        text.alignV = AlignV.Center;

        text.position.x = text.position.y = 50;

        text.text = 'loading';

        let counter = 0;
        new Interval(clear => text.text = 'loading' + '.'.repeat(counter = ++counter % 4), 500)


        text.font = 'Default-Normal';
    });

    menu.background = Shape.createSprite('Rect', Color.white);

    menu.active = true;
}
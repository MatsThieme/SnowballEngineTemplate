import { Behaviour, GameTime, Input, KeyboardButton, Vector2 } from 'SE';

export class MoveBehaviour extends Behaviour {
    update() {
        const horizontal = +!!(Input.keyboard?.getButton(KeyboardButton.ArrowRight)?.down) - +!!(Input.keyboard?.getButton(KeyboardButton.ArrowLeft)?.down);
        const vertical = +!!(Input.keyboard?.getButton(KeyboardButton.ArrowUp)?.down) - +!!(Input.keyboard?.getButton(KeyboardButton.ArrowDown)?.down);

        this.gameObject.transform.position.add(new Vector2(horizontal * GameTime.deltaTimeSeconds * 5, vertical * GameTime.deltaTimeSeconds * 5));
    }
}
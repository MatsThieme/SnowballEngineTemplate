import { Asset } from '../../Assets/Asset.js';
import { Frame } from '../../Camera/Frame.js';
import { Vector2 } from '../../Vector2.js';
import { AlignH, AlignV } from '../Align.js';
import { Alignable } from '../Alignable.js';
import { Drawable } from '../Drawable.js';
import { GameObject } from '../GameObject.js';
import { Component } from './Component.js';
import { ComponentType } from './ComponentType.js';
import { Sprite } from '../../Sprite.js';

export class Texture extends Component implements Drawable, Alignable {
    public relativePosition: Vector2;
    public size: Vector2;
    public sprite?: Asset;
    public alignH: AlignH;
    public alignV: AlignV;
    public constructor(gameObject: GameObject, relativePosition: Vector2 = new Vector2(), size: Vector2 = new Vector2(1, 1), alignH: AlignH = AlignH.Center, alignV: AlignV = AlignV.Center) {
        super(gameObject, ComponentType.Texture);
        this.relativePosition = relativePosition;
        this.size = size;
        this.alignH = alignH;
        this.alignV = alignV;
    }
    public get currentFrame(): Frame | undefined {
        return this.sprite ? new Frame(this.position, this.scaledSize, new Sprite(this.sprite), this.gameObject.transform.rotation, this.gameObject.drawPriority, 1) : undefined;
    }
    public get scaledSize(): Vector2 {
        return new Vector2(this.size.x * this.gameObject.transform.scale.x, this.size.y * this.gameObject.transform.scale.y);
    }
    public get position(): Vector2 {
        return Vector2.add(this.relativePosition, this.gameObject.transform.position, this.align);
    }
    public get align(): Vector2 {
        return new Vector2(this.alignH === AlignH.Right ? -this.scaledSize.x : this.alignH === AlignH.Center ? -this.scaledSize.x / 2 : 0, this.alignV === AlignV.Top ? -this.scaledSize.y : this.alignV === AlignV.Center ? -this.scaledSize.y / 2 : 0);
    }
}
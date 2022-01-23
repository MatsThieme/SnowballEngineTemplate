import { Asset } from "Assets/Asset";
import { AssetType } from "Assets/AssetType";
import { Canvas } from "Utility/Canvas/Canvas";
import { Color } from "Utility/Color";
import { Vector2 } from "Utility/Vector2";

/** @category Utility */
export class Shape {
    /**
     * @param shape
     * @param fill true = fill, false = stroke; checkmark will always fill
     * @param size size of the image in px
     * @param color
     */
    public static createSprite(
        shape: ShapeType | ((context: CanvasRenderingContext2D, canvas: Canvas) => void),
        color: Readonly<Color> = Color.orange,
        size: Vector2 = new Vector2(100, 100),
        lineWidth = 2,
        fill = true
    ): Asset {
        if (shape === "Rect") return Shape.createRect(color, size, lineWidth, fill);
        else if (shape === "Checkmark") return Shape.createCheckmark(color, size, lineWidth, false);
        else if (shape === "Circle") return Shape.createCircle(color, size, lineWidth, fill);
        else {
            const canvas = new Canvas(size.x, size.y);
            const context = canvas.context2D();

            context.lineWidth = (size.magnitude / 50) * lineWidth;
            context.fillStyle = context.strokeStyle = color.rgbaString;
            context.imageSmoothingEnabled = false;

            shape(context, canvas);

            return new Asset(
                "Shape.createSprite" + performance.now() + Math.random(),
                AssetType.Image,
                canvas
            );
        }
    }

    public static createRect(
        color: Readonly<Color> = Color.orange,
        size: Vector2 = new Vector2(1, 1),
        lineWidth = 2,
        fill = true
    ): Asset {
        return Shape.createSprite(
            (context) => {
                if (fill) context.fillRect(0, 0, size.x, size.y);
                else context.strokeRect(0, 0, size.x, size.y);
            },
            color,
            size,
            lineWidth,
            fill
        );
    }

    /**
     *
     * Fill only
     */
    public static createCheckmark(
        color: Readonly<Color> = Color.orange,
        size: Vector2 = new Vector2(100, 100),
        lineWidth = 2,
        fill = false
    ): Asset {
        return Shape.createSprite(
            (context) => {
                context.beginPath();
                context.moveTo(0.12 * size.x, 0.5 * size.y);
                context.lineTo(0.38 * size.x, 0.75 * size.y);
                context.lineTo(0.88 * size.x, 0.25 * size.y);
                context.stroke();
            },
            color,
            size,
            lineWidth,
            fill
        );
    }

    public static createCircle(
        color: Readonly<Color> = Color.orange,
        size: Vector2 = new Vector2(100, 100),
        lineWidth = 2,
        fill = true
    ): Asset {
        return Shape.createSprite(
            (context) => {
                if (fill) {
                    context.arc(size.x / 2, size.y / 2, Math.min(size.x, size.y) / 2, 0, 2 * Math.PI);
                    context.fill();
                } else {
                    context.arc(
                        size.x / 2,
                        size.y / 2,
                        Math.min(size.x, size.y) / 2 - context.lineWidth / 2,
                        0,
                        2 * Math.PI
                    );
                    context.stroke();
                }
            },
            color,
            size,
            lineWidth,
            fill
        );
    }
}

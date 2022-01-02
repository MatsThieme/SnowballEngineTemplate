import { GameObject } from "SE";
import { TestBehaviour } from "../../TestBehaviour";

export class GameObjectFind extends TestBehaviour {
    name = "GameObject.Find";
    description = "GameObject.Find";

    test() {
        const path1 = "/lalala/bla/blub/food";
        this.createGameObjectChain(path1);
        const path2 = "/1stGO/aChild/onemore/bla/blub";
        this.createGameObjectChain(path2);

        const paths = [path1, path2, "aChild/onemore/bla", "bla/blub", "blub", "food"];

        for (const path of paths) {
            const gameObject = GameObject.find(path);

            if (!gameObject) throw new Error("gameObject not found");
            if (!this.verifyChain(path, gameObject)) throw new Error("failed to verify parents");

            console.log(path);
            console.log(gameObject);
        }
    }

    createGameObjectChain(path: string): void {
        const names = path.split("/").filter(Boolean);
        let parent: GameObject | undefined;

        for (const name of names) {
            const go = new GameObject(name);
            if (parent) parent.addChild(go);
            parent = go;
        }
    }

    verifyChain(path: string, gameObject: GameObject): boolean {
        const parents = path.split("/").filter(Boolean).reverse().splice(1);

        for (const parent of parents) {
            if (!gameObject.parent || gameObject.parent.name !== parent) return false;
            gameObject = gameObject.parent;
        }

        return true;
    }
}

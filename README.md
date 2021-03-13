## Status:
PIXI.js integrated for rendering game assets, ui is still rendered using a 2d context
<br>
Matter.js not yet integrated && physics currently not working properly

# SnowballEngine

**SnowballEngine is a 2D TypeScript game engine.**
It manages scenes, game assets, simulates physics, renders assets, provides a simple structure and more

### setup
<pre>npm i</pre>

### build
<pre>npm run build</pre>

### debug build
<pre>npm run builddebug</pre>

### generate AssetDB.json from Assets folder
<pre>npm run newadb</pre>

### generate AssetDB.json from Assets folder and merge with existing AssetDB.json
<pre>npm run mnewadb</pre>

### start debug server
<pre>npm run server</pre>

<br>

## Getting Started

### Recommended directory structure
<pre>
Assets/
src/
  Behaviours/
  Configurables/
  Prefabs/
  Scenes/
  SnowballEngine/
  Game.ts
dist/
</pre>

#### Configurables
Configurables contains engine files the user will edit during the development process.\
e.g. InputAction.d.ts for input mapping

#### Prefabs
Prefabs are functions that initialize a GameObject.

<br>

### Engine code structure
<pre>
SceneManager
  Scene
    GameObject
      Component
    UI
</pre>


### The main file 'Game.ts' looks like this
```typescript
import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, SceneManager } from 'se';

export class Game {
    public constructor() {
        this.initialize(new SceneManager());
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        sceneManager.add('Loadingscreen', LoadingScreenScene);
        sceneManager.add('Game', MainScene);

        await sceneManager.load('Loadingscreen');

        await Assets.loadFromAssetDB();

        await sceneManager.load('Game');
    }
}
```

### Behaviour
A Behaviour is a Component with user-defined functionality.

### Component
A Component controls the behavior of the corresponding GameObject.

### GameObject
A GameObject is a container for components.
It has a Transform component by default.

<br>

## Components
### AnimatedSprite
Switch between multiple SpriteAnimations
</br>

### AudioListener
Can exist once per scene, it's the "ears" of the player.
It's the audio counterpart of Camera.
</br>

### AudioSource
Emits positional Audio from a file(Asset).
Can hold an AudioMixer object.
</br>

### Behaviour
Base class for all Behaviours.
</br>

### Camera
A Camera component displays a part of the world on screen.
</br>

### CircleCollider
</br>

### CircleRenderer
Debug renderer, renders the CircleCollider on the same GameObject.
</br>

### Collider
Base class for CircleCollider and PolygonCollider.
</br>

### Component
Base class for all components.
</br>

### ParallaxBackground
A graphical component for rendering parallax scrolling images.
</br>

### ParticleSystem
</br>

### PolygonCollider
</br>

### PolygonRenderer
Debug renderer, renders the PolygonCollider on the same GameObject.
</br>

### RigidBody
</br>

### Texture
Controls the rendering of an image.
</br>

### TileMap
</br>

### Transform
A Transform Component stores position, rotation and scale of their GameObject.
A child-GameObjects Transform is relative to their parents.
</br>

<br>

## Assets
Assets are all non-script files utilized by the game.

**All asset types**
```typescript
enum AssetType {
    Image = 0,
    Audio = 1,
    Video = 2,
    Text = 3,
    Blob = 4,
    JSON = 5,
    Font = 6
}
```

### AssetDB
Assets/AssetDB.json contains information about all assets.\
It can be generated with <code>npm run newadb</code>.

Typescript signature of 'AssetDB.json's content:
```typescript
type AssetDB = { [path: string]: { type: AssetType, name?: string, mimeType: string } };
```

<br>

### InputMapping
InputMappingAxes.json and InputMappingButtons.json, placed in the Asset root, contain input mapping information.

The signature of an input mapping file looks like this:
```typescript
interface InputMapping {
    keyboard: { [key in InputAction]?: KeyboardButton | KeyboardAxis },
    mouse: { [key in InputAction]?: MouseButton | MouseAxis },
    gamepad:  { [key in InputAction]?: GamepadButton | GamepadAxis },
    touch: { [key in InputAction]?: TouchButton | TouchAxis }
}
```
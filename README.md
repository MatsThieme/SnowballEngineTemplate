## Status:
PIXI.js integrated for rendering game assets and ui
<br>
Matter.js not yet integrated && physics currently not working properly

[Documentation](https://matsthieme.github.io/SnowballEngineTemplate)

# SnowballEngine

**SnowballEngine is a 2D TypeScript game engine.**
It manages scenes, game assets, simulates physics, renders assets, provides a simple structure and more.

### setup
<pre>npm i</pre>

### build
<pre>npm run build</pre>
<pre>node SEB --b</pre>
<pre>node SEB -build</pre>

### debug build
<pre>npm run debugbuild</pre>
<pre>node SEB --d</pre>
<pre>node SEB -debugbuild</pre>

### generate AssetDB.json from Assets folder
<pre>npm run createadb</pre>
<pre>node SEB --c</pre>
<pre>node SEB -createADB</pre>

### update AssetDB.json, copy named assets from the existing db to a newly generated one
<pre>npm run updateadb</pre>
<pre>node SEB --u</pre>
<pre>node SEB -updateADB</pre>

### start debug server
<pre>npm run server</pre>
<pre>npm SEB --s</pre>
<pre>npm SEB --server</pre>

### generate documentation
<pre>npm run doc</pre>

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

#### Behaviours
[Behaviour](#behaviour)

#### Configurables
Configurables contains typedefinition files (.d.ts) the user will edit during the development process.\
e.g. InputAction.d.ts for input mapping

#### Prefabs
Prefabs are files that export a function to initialize a GameObject.

#### Scenes
Scenes are files that export a function to initialize a Scene.


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
A Behaviour is a Component with user-defined functionality.\
Base class for all Behaviours.

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
Emits positional Audio.
Can hold an AudioMixer object to filter/modify output.
</br>

### Behaviour
[Behaviour](#behaviour)
</br>

### Camera
A Camera component displays a part of the world on screen.
</br>

### Component
Base class for all components.
</br>

### ParallaxBackground
A graphical component for rendering parallax scrolling images.
</br>

### ParticleSystem
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
type AssetDB = { [path: string]: { type: AssetType, "asset name"?: 0 } };
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
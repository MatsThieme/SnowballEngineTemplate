# SnowballEngine

SnowballEngine is a resolution independent 2D TypeScript game engine.
SnowballEngine manages scenes, game assets, simulates physics, renders assets and provides an easy to understand structure similar to Unity. It integrates [pixi.js](https://github.com/pixijs/pixi.js) for fast rendering and [matter-js](https://github.com/liabru/matter-js) for accurate and performant physics simulation.

[Documentation](https://matsthieme.github.io/SnowballEngineTemplate)

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

### generate AssetDB.json
<pre>npm run createadb</pre>
<pre>node SEB --c</pre>
<pre>node SEB -createADB</pre>

### update AssetDB.json
<pre>npm run updateadb</pre>
<pre>node SEB --u</pre>
<pre>node SEB -updateADB</pre>

### start debug server
<pre>npm run server</pre>
<pre>npm SEB --s</pre>
<pre>npm SEB -server</pre>

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
Contains files with classes derived from Behaviour.

#### Configurables
Contains typedefinition files (.d.ts) the user may edit during the development process, e.g. InputAction.d.ts for input mapping

#### Prefabs
Contains files that export a function to initialize a GameObject.

#### Scenes
Contains files that export a function to initialize a Scene.

#### SnowballEngine
Contains all the GameEngine files.

#### Game.ts
Game.ts is the entry point, it may look like this:
```typescript
import { LoadingScreenScene } from 'Scenes/LoadingScreenScene';
import { MainScene } from 'Scenes/MainScene';
import { Assets, SceneManager } from 'SE';

export class Game {
    public constructor() {
        this.initialize(new SceneManager());
    }
    private async initialize(sceneManager: SceneManager): Promise<void> {
        sceneManager.add('Loading Screen Scene', LoadingScreenScene);
        sceneManager.add('Main Scene', MainScene);

        await sceneManager.load('Loading Screen Scene');

        await Assets.loadFromAssetDB();

        await sceneManager.load('Main Scene');
    }
}
```

</br>

### SceneManager
A SceneManager instance loads Scenes and stores their Initializer-function.

### Scene
A Scene manages GameObjects and the graphical user interface. It contains the gameloop.

### GameObject
A GameObject is a container for components.
It has a Transform component by default.

### Component
A Component controls the behavior of the corresponding GameObject.

### Engine code structure
<pre>
SceneManager
  Scene
    GameObject
      Component
    UI
</pre>


<br>

## Components
### AnimatedSprite implements Renderable
Manages SpriteAnimation objects to render and switch sprite animations.
</br>
</br>

### AudioListener
Can exist once per scene, it's the "ears" of the player.
It's the audio equivalent of Camera.
</br>
</br>

### AudioSource
Emits positional Audio.
Can hold an AudioMixer object to filter/modify output.
</br>
</br>

### Behaviour
A Behaviour is a Component with user-defined functionality.\
The Base class for all Behaviours.
</br>
</br>

### Camera
The size and position of a camera component specify which area of the scene is rendered to the screen.
</br>
</br>

### Component
The Base class for all components.
</br>
</br>

### Renderable
The Base class for all renderable components.
Examlpes are [Texture](#texture), [Video](#video), [ParallaxBackground](#parallaxbackground) and [Text](#text).
</br>
</br>

### ParallaxBackground implements Renderable
A graphical component for rendering parallax scrolling images. [Wikipedia: Parallax scrolling](https://en.wikipedia.org/wiki/Parallax_scrolling)
</br>
</br>

### ParticleSystem implements Renderable
</br>
</br>

### Text implements Renderable
Render a string.
</br>
</br>

### Texture implements Renderable
Render an image.
</br>
</br>

### TileMap implements Renderable
Render a tilemap and collide with other objects.
</br>
</br>

### Transform
The Transform Component is by default added to every GameObject on creation, only one Transform is allowed per GameObject.
A Transform Component stores position, rotation and scale of their GameObject.
A child-GameObjects Transform is relative to their parents.
</br>
</br>

### Video implements Renderable
Render a Video/Movie, playback is controlled through an HTMLVideoElement.
</br>
</br>


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
Assets/AssetDB.json contains all asset information required for loading.\
It can be generated with <code>[npm run createadb](#generate-assetdbjson)</code>.

Typescript signature of 'AssetDB.json's content:
```typescript
type AssetDB = { [path: string]: { type: AssetType, "optional asset name"?: 0 } };
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


### Units
#### Angles
All angles are clockwise. To allow and simplify the mixed use of radian and degree, [Angle](src/SnowballEngine/Utilities/Angle.ts) objects are used.

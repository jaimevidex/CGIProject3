# WebGL 3D Scene — Scene Graph, Lighting and a Live Inspector

A small 3D engine written directly against **WebGL2**: a hierarchical scene graph, Phong lighting, an orbit camera, and a `dat.GUI` panel that lets you inspect and change the scene while it renders.

**[Live demo](https://jaimevidex.github.io/CGIProject3/)**

## What's in the scene

A floor plane plus a collection of primitives — cube, sphere, cylinder, pyramid, torus, the Stanford bunny and the cow — arranged as a tree. Each node carries its own transform, material and children, so moving a parent moves its whole subtree.

## Features

| Feature | Where |
|---|---|
| Hierarchical transforms (push/pop matrix stack) | `libs/stack.js`, `app.js` |
| Phong lighting with configurable lights | `shaders/shader.vert` / `shader.frag` |
| Perspective camera, orbit + zoom | `app.js` |
| Backface culling toggle | `dat.GUI` panel |
| Depth-buffer toggle | `dat.GUI` panel |
| Animated rotation | `dat.GUI` panel |
| Shape swap on any node | `dat.GUI` panel |
| Visibility of light helpers | `dat.GUI` panel |

The inspector is the interesting part: every control mutates the same state the render loop reads, so you can watch the effect of culling, depth testing or lighting changes in real time.

## Structure

```
app.js              render loop, camera, GUI wiring
objects.js          scene graph: nodes, transforms, materials, children
shaders/            Phong vertex + fragment shaders
libs/               course-provided scaffolding (MV.js, stack.js, geometry, dat.GUI)
```

## Run

ES modules need an HTTP origin:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Context

Built for the *Computação Gráfica e Interfaces* course at Instituto Superior Técnico. The rendering scaffolding under `libs/` is the course material (vendored here from a public copy of the same course setup) so the project runs standalone.

# Toy Blocks

Web application where you can build a 3D scene by adding and managing predefined 3D Objects. Apply translations, rotations, scaling, and group up Objects in a Hierarchical structure. Edit Camera and lighting properties.

You can try out the app [HERE](https://sites.unimi.it/albertoalzati/geocomp2025/toy-blocks/app.html)!

![screen-app](https://github.com/user-attachments/assets/ab98ade9-be3d-4202-bb80-780d72321e15)

### Controls
- **Viewport:** Upper-left gizmo visualizes directional light orientation. Upper-right gizmo functions as "compass" for global axis. Selected Object is rendered as wireframe. Objects are only selectable and editable via the side panels.
- **Camera translation:** Left mouse drag / WASDQE
- **Camera rotation:** Right mouse drag / Arrow keys
- **Hierarchy:** Click an element to select the Object. Drag and drop over another item to set as its child, drag on *Root* to move back to move back into world-space. Press item buttons to delete (irreversible!) or show/hide children.

Written in Javascript, using WebGL and React. Built with Vite.

---

*Final project submission for course Geometria Computazionale (Università Statale di Milano) - June 2025*

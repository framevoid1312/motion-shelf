# Editable motion rebuild

Edit `project.json` (layers: id, kind text|rect|ellipse|path|group, parent, text, path, style, start, end, frames[t,x,y,w,h,opacity,rotation,reveal,ease]).
Run `node sync-project.cjs`, then open index.html (`?t=2.5` freezes a time, `?play` plays) or `npm i && npm run render` with HyperFrames.

- Scene 1: Big digits are traced vector outlines of the reference glyphs; all other type is Inter, a close stand-in for the reference grotesk.
- Scene 1: Grid lines fade out where the reference wipes them; tiny counter text is approximate.

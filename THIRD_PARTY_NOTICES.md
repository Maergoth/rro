# Third-party notices

This notice reflects the clean native V1 source line. The retired React/Vite prototype is under the unshipped `legacy/` audit tree and is not part of a generated V1 artifact.

## Runtime components

### Godot Engine

The native game client is built with Godot Engine 4.4.1 or a compatible later 4.x release.

Copyright © 2007-present Juan Linietsky, Ariel Manzur and contributors.

Godot Engine is available under the MIT License. Official source and full third-party engine notices are available from <https://github.com/godotengine/godot> and are included by the Godot export process where required.

### Node.js

The standalone Windows server package bundles the Node.js 24.14.0 Windows x64 runtime. Node.js is copyright Node.js contributors and is available under the MIT License. Node.js also contains third-party components under their own compatible licenses.

Runtime provenance and the verified npm tarball digest are recorded in `runtime/RUNTIME_SOURCE.txt` inside the standalone server. The complete Node.js license bundle and source are available from <https://github.com/nodejs/node/tree/v24.14.0>.

### ws 8.21.1

The standalone server includes the `ws` WebSocket implementation under the MIT License.

Copyright © 2011 Einar Otto Stangvik.  
Copyright © 2013 Arnout Kazemier and contributors.  
Copyright © 2016 Luigi Pinca and contributors.

## Development-only components

The GitHub source declares these tools; they are not embedded as game logic in the standalone server:

- TypeScript 5.9.3 — Apache License 2.0, Microsoft Corporation;
- `@gdscript-analyzer/core` 0.6.1 — MIT OR Apache-2.0, Yaniv Kalfa and contributors;
- Node.js type declarations — MIT, DefinitelyTyped contributors;
- `@types/ws` — MIT, DefinitelyTyped contributors.

CI uses third-party GitHub Actions and a Godot setup action under their respective repository licenses. A production publishing pipeline must generate a per-artifact SBOM and collect exact transitive license texts; this alpha notice is not a substitute for that release gate.

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Apache License 2.0

The full Apache License 2.0 text is available at <https://www.apache.org/licenses/LICENSE-2.0>. Source redistributors must retain the exact license and notices supplied with each Apache-licensed dependency.

import { readFileSync } from "fs";
import glob from "glob";
import WebSocket from "ws";

export function extensionReloaderBuildStep(manifestPath) {
  return {
    name: "vite-extension-reloader-build-step",
    apply: "build",
    generateBundle() {
      const manifest = JSON.parse(readFileSync(manifestPath));
      if (manifest.background.service_worker) {
        manifest.background.service_worker =
          manifest.background.service_worker.replace(".ts", ".js");
      }
      if (manifest.content_scripts) {
        manifest.content_scripts.forEach((script) => {
          script.js = script.js.map((js) => js.replace(".ts", ".js"));
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2),
      });
    },
  };
}

export function extensionReloaderWebSocket(options = {}) {
  const { port = 3001 } = options; // Default port is 3001

  return {
    name: "vite-extension-reloader-websocket",
    apply: "build",
    closeBundle() {
      const ws = new WebSocket(`ws://localhost:${port}`);
      ws.onopen = () => {
        console.log(`websocket (vite) connected on port ${port}`);
        ws.send("reload");
        ws.close();
      };
      ws.onerror = (e) => {
        console.log(
          "websocket (vite) error - is the websocket server running?",
          e
        );
      };
      ws.onclose = () => {
        console.log("websocket (vite) closed");
      };
    },
  };
}

export function extensionReloaderWatchExternal(targetSrc) {
  return {
    name: "vite-extension-reloader-watch-external",
    async buildStart() {
      glob(targetSrc, (err, files) => {
        if (err) {
          console.error(err);
          return;
        }
        for (let file of files) {
          this.addWatchFile(file);
        }
      });
    },
  };
}

import { App } from "./control/app";

if(!navigator.gpu) {
    alert("Unfortunately, your browser does not support WebGL. Ath the moment. There is a way. Just google it. I mean, you've come this far right?");
} else {
    console.log("WebGPU Loaded.");
}

const canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('gfx-main');
const app = new App(canvas);

app.initialize()
app.run()
# WebGPU-main

This repository contains the source code for a simple WebGPU demo. WebGPU is a new graphics and computing API that provides low-level access to modern GPUs, enabling high-performance and power-efficient applications. With WebGPU, developers can leverage the full potential of modern GPUs, while still using standard web technologies such as HTML, CSS, and JavaScript.

To run this demo, you will need to use a browser that supports WebGPU. Currently, the best option is to use Google Chrome Canary, which can be downloaded from the official website.

Once you have Chrome Canary installed, you will need to enable the WebGPU flags by navigating to `chrome://flags/#enable-unsafe-webgpu` and turning the flag on.

Next, you will need to install the required dependencies by running the following command in the terminal:

cli command : `npm i`

Once the dependencies are installed, you can build the project by running:

cli command : `npm run build`

And then serve it using any HTTP server of your choice, or by running the following command:

cli command : `npm run serve`


Finally, open the demo in your browser by double-clicking on the canvas. You can navigate the demo using the following controls:

- `W`: Move forward
- `A`: Move left
- `S`: Move back
- `D`: Move right
- `W` + `LShift`: Speed up

Thank you for trying out this demo! We hope it gives you a good idea of what's possible with WebGPU.

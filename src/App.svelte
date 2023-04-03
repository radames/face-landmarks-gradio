<script lang="ts">
  import { onMount } from "svelte";
  import { FaceMesh as _FaceMesh } from "@mediapipe/face_mesh";
  import { Camera as _Camera } from "@mediapipe/camera_utils";
  import {
    drawingModeFn,
    DrawingMode,
    type DrawingModeType,
  } from "./lib/drawingModes";

  const FaceMesh = _FaceMesh || window.FaceMesh;
  const Camera = _Camera || window.Camera;

  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;
  let snapCanvasElement: HTMLCanvasElement;
  let snapCanvasCtx: CanvasRenderingContext2D;
  let landmarksCanvasElement: HTMLCanvasElement;
  let landmarksCtx: CanvasRenderingContext2D;
  let baseRootEl: HTMLDivElement;
  let drawingMode: DrawingModeType = DrawingMode.LANDMARKS;
  let maxNumFaces = 5;

  onMount(() => {
    baseRootEl = document.getElementById("canvas-root") as HTMLDivElement;
    if (!baseRootEl._data) baseRootEl._data = { image: null };
    if (baseRootEl.dataset.mode) {
      const mode = baseRootEl.dataset.mode;
      drawingMode = DrawingMode[mode.toUpperCase()];
      maxNumFaces = parseInt(baseRootEl.dataset.maxNumFaces) || 5;
    }
    canvasCtx = canvasElement.getContext("2d");
    // offscreen canvas for landmarks
    landmarksCanvasElement = document.createElement("canvas");
    landmarksCtx = landmarksCanvasElement.getContext("2d");
    landmarksCanvasElement.width = canvasElement.width;
    landmarksCanvasElement.height = canvasElement.height;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: maxNumFaces,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 512,

      height: 512,
    });
    camera.start();
  });

  function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    landmarksCtx.clearRect(
      0,
      0,
      landmarksCanvasElement.width,
      landmarksCanvasElement.height
    );
    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawingModeFn[drawingMode](landmarksCtx, landmarks);
      }
    }
    canvasCtx.drawImage(
      landmarksCanvasElement,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
  }
  function snapImage() {
    snapCanvasCtx = snapCanvasElement.getContext("2d");
    snapCanvasCtx.save();
    snapCanvasCtx.fillStyle =
      drawingMode === DrawingMode.POINTS ? "white" : "black";
    snapCanvasCtx.fillRect(
      0,
      0,
      snapCanvasElement.width,
      snapCanvasElement.height
    );
    snapCanvasCtx.drawImage(
      landmarksCanvasElement,
      0,
      0,
      snapCanvasElement.width,
      snapCanvasElement.height
    );
    if (drawingMode === "points") {
      snapCanvasCtx.globalCompositeOperation = "difference";
      snapCanvasCtx.fillStyle = "white";
      snapCanvasCtx.fillRect(
        0,
        0,
        snapCanvasElement.width,
        snapCanvasElement.height
      );
      snapCanvasCtx.drawImage(
        landmarksCanvasElement,
        0,
        0,
        snapCanvasElement.width,
        snapCanvasElement.height
      );
    }
    snapCanvasCtx.restore();

    baseRootEl._data.image = snapCanvasElement.toDataURL();
  }
</script>

<div class="relative container">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={videoElement} class="hidden" muted playsinline />
  <canvas
    bind:this={canvasElement}
    width="512
    
    px"
    height="512
    
    px"
    class="w-full"
  />

  <div class="flex absolute bottom-1 left-1 items-end">
    <button on:click={snapImage} class="capture-btn">Snap</button>
    <canvas
      bind:this={snapCanvasElement}
      width="512
      
      px"
      height="512
      
      px"
      class="w-32"
    />
  </div>
</div>

<style lang="postcss" scoped>
  canvas {
    @apply rounded-lg shadow-sm;
  }
  .capture-btn {
    @apply text-black font-bold z-10 bg-slate-50 rounded-lg px-2 py-1 shadow-sm hover:bg-cyan-100;
  }
  .container :global(*) {
    color: black !important;
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { FaceMesh as _FaceMesh } from "@mediapipe/face_mesh";
  import { Camera as _Camera } from "@mediapipe/camera_utils";

  const FaceMesh = _FaceMesh || window.FaceMesh;
  const Camera = _Camera || window.Camera;

  import {
    LEFT_EYE,
    RIGHT_EYE,
    RIGHT_EYE_BROW,
    LEFT_EYE_BROW,
    OUTER_LIPS,
    INNER_LIPS,
    NOSE_TOP,
    NOSE_BASE,
    SILLHOUETTE,
  } from "./lib/constants";
  import type { NormalizedLandmarkList } from "@mediapipe/face_mesh";

  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;
  let snapCanvasElement: HTMLCanvasElement;
  let snapCanvasCtx: CanvasRenderingContext2D;
  let landmarksCanvasElement: HTMLCanvasElement;
  let landmarksCtx: CanvasRenderingContext2D;
  let baseRootEl: HTMLDivElement;

  onMount(() => {
    baseRootEl = document.getElementById("canvas-root") as HTMLDivElement;
    if (!baseRootEl._data) baseRootEl._data = { image: null };

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
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 720,
      height: 720,
    });
    camera.start();
  });

  function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList,
    connections: number[],
    color = "lime",
    lineWidth = 4,
    fill = false
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    for (const [i, id] of connections.entries()) {
      const p = landmarks[id];
      if (i === 0)
        ctx.moveTo(p.x * canvasElement.width, p.y * canvasElement.height);
      else ctx.lineTo(p.x * canvasElement.width, p.y * canvasElement.height);
    }
    if (fill) {
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.restore();
  }
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
        drawLandmarks(landmarksCtx, landmarks, LEFT_EYE, "magenta", 8, true);
        drawLandmarks(landmarksCtx, landmarks, RIGHT_EYE, "magenta", 8, true);
        drawLandmarks(
          landmarksCtx,
          landmarks,
          RIGHT_EYE_BROW,
          "yellow",
          8,
          false
        );
        drawLandmarks(
          landmarksCtx,
          landmarks,
          LEFT_EYE_BROW,
          "yellow",
          8,
          false
        );
        drawLandmarks(landmarksCtx, landmarks, OUTER_LIPS, "cyan", 8, true);
        drawLandmarks(landmarksCtx, landmarks, INNER_LIPS, "blue", 8, true);
        drawLandmarks(landmarksCtx, landmarks, NOSE_TOP, "orange", 8, false);
        drawLandmarks(landmarksCtx, landmarks, NOSE_BASE, "orange", 8, false);
        drawLandmarks(landmarksCtx, landmarks, SILLHOUETTE, "lime", 8, false);
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
    snapCanvasCtx.fillStyle = "black";
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

    baseRootEl._data.image = snapCanvasElement.toDataURL();
  }
</script>

<div class="relative container">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={videoElement} class="hidden" />
  <canvas
    bind:this={canvasElement}
    width="720px"
    height="720px"
    class="w-full"
  />

  <div class="flex absolute bottom-1 left-1 items-end">
    <button on:click={snapImage} class="capture-btn">Snap</button>
    <canvas
      bind:this={snapCanvasElement}
      width="720px"
      height="720px"
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

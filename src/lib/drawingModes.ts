import type { NormalizedLandmarkList } from "@mediapipe/face_mesh";
import {
    LEFT_EYE,
    RIGHT_EYE,
    RIGHT_EYE_BROW_TOP,
    RIGHT_EYE_BROW_BOTTOM,
    LEFT_EYE_BROW_TOP,
    LEFT_EYE_BROW_BOTTOM,
    OUTER_LIPS,
    INNER_LIPS,
    NOSE_TOP,
    NOSE_BASE,
    SILLHOUETTE,
    LEFT_IRIS,
    RIGHT_IRIS,
    FACE_OVAL
} from "./constants";

// drawing mode landmarks, points, crucibleAI
export enum DrawingMode {
    LANDMARKS = "landmarks",
    POINTS = "points",
    CRUCIBLEAI = "crucibleAI",
}
export type DrawingModeType = `${DrawingMode}`;

export const drawingModeFn = {
    [DrawingMode.LANDMARKS]: drawLandmarksaMask,
    [DrawingMode.POINTS]: drawPointsMask,
    [DrawingMode.CRUCIBLEAI]: drawCrucibleAIMask,
};


function drawCrucibleAIMask(ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList) {

    drawLandmarks(ctx, landmarks, LEFT_EYE, "rgb(180, 200, 10)", 4, false, true, true);
    drawLandmarks(ctx, landmarks, RIGHT_EYE, "rgb(10, 200, 180)", 4, false, true, true);
    drawLandmarks(
        ctx,
        landmarks,
        RIGHT_EYE_BROW_TOP,
        "rgb(10, 200, 180)",
        4,
        false,
        true,
        false
    );
    drawLandmarks(
        ctx,
        landmarks,
        RIGHT_EYE_BROW_BOTTOM,
        "rgb(10, 200, 180)",
        4,
        false,
        true,
        false
    );
    drawLandmarks(
        ctx,
        landmarks,
        LEFT_EYE_BROW_TOP,
        "rgb(180, 200, 10)",
        4,
        false,
        true,
        false
    );
    drawLandmarks(
        ctx,
        landmarks,
        LEFT_EYE_BROW_BOTTOM,
        "rgb(180, 200, 10)",
        4,
        false,
        true,
        false
    );
    drawLandmarks(ctx, landmarks, OUTER_LIPS, "rgb(10, 180, 10)", 4, false, true, true);
    drawLandmarks(ctx, landmarks, INNER_LIPS, "rgb(10, 180, 10)", 4, false, true, true);
    drawLandmarks(ctx, landmarks, FACE_OVAL, "rgb(10, 200, 10)", 4, false, true, true);
    drawPoints(ctx, landmarks, LEFT_IRIS, "rgb(250, 200, 10)", 2, 'square');
    drawPoints(ctx, landmarks, RIGHT_IRIS, "rgb(10, 200, 250)", 2, 'square');

}


function drawLandmarksaMask(ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList) {

    drawLandmarks(ctx, landmarks, LEFT_EYE, "magenta", 4, true, false, true);
    drawLandmarks(ctx, landmarks, RIGHT_EYE, "magenta", 4, true, false, true);
    drawLandmarks(
        ctx,
        landmarks,
        RIGHT_EYE_BROW_TOP,
        "yellow",
        4,
        false,
        true,
        false
    );
    drawLandmarks(
        ctx,
        landmarks,
        LEFT_EYE_BROW_TOP,
        "yellow",
        4,
        false,
        true,
        false
    );
    drawLandmarks(ctx, landmarks, OUTER_LIPS, "cyan", 4, true, false, true);
    drawLandmarks(ctx, landmarks, INNER_LIPS, "blue", 4, true, false, true);
    drawLandmarks(ctx, landmarks, NOSE_TOP, "orange", 4, false, true, false);
    drawLandmarks(ctx, landmarks, NOSE_BASE, "orange", 4, false, true, false);
    drawLandmarks(ctx, landmarks, SILLHOUETTE, "lime", 4, false, true, false);
}

function drawPointsMask(ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList) {

    drawPoints(ctx, landmarks, LEFT_EYE, "black", 2);
    drawPoints(ctx, landmarks, RIGHT_EYE, "black", 2);
    drawPoints(
        ctx,
        landmarks,
        RIGHT_EYE_BROW_TOP,
        "black",
        2
    );
    drawPoints(
        ctx,
        landmarks,
        LEFT_EYE_BROW_TOP,
        "black",
        2
    );
    drawPoints(ctx, landmarks, OUTER_LIPS, "black", 2);
    drawPoints(ctx, landmarks, INNER_LIPS, "black", 2,);
    drawPoints(ctx, landmarks, NOSE_TOP, "black", 2,);
    drawPoints(ctx, landmarks, NOSE_BASE, "black", 2,);
    drawPoints(ctx, landmarks, SILLHOUETTE, "black", 2,);
}

function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList,
    connections: number[],
    color = "lime",
    lineWidth = 4,
    fill = false,
    stroke = true,
    close = false,
) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    for (const [i, id] of connections.entries()) {
        const p = landmarks[id];
        if (i === 0)
            ctx.moveTo(p.x * ctx.canvas.width, p.y * ctx.canvas.height);
        else ctx.lineTo(p.x * ctx.canvas.width, p.y * ctx.canvas.height);
    }
    if (close) ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
    ctx.restore();
}

function drawPoints(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList,
    connections: number[],
    color = "black",
    radius = 2.5,
    shape = "circle",
    fill = true,
    stroke = false,
) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    for (const [i, id] of connections.entries()) {
        const p = landmarks[id];
        ctx.beginPath();
        if (shape === "circle") {
            ctx.ellipse(
                p.x * ctx.canvas.width,
                p.y * ctx.canvas.height,
                radius,
                radius,
                0,
                0,
                2 * Math.PI
            );
            ctx.closePath();
        } else if (shape === "square") {
            ctx.rect(
                p.x * ctx.canvas.width - radius,
                p.y * ctx.canvas.height - radius,
                radius * 2,
                radius * 2
            );
        }
        if (stroke) ctx.stroke();
        if (fill) ctx.fill();
    }
    ctx.restore();
}
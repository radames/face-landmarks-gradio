export interface Color {
	color: number[];
}
export type RGB = `rgb(${number},${number},${number})`;
export interface Brush {
	color: RGB;
	size: number;
}

interface Point {
	x: number;
	y: number;
}
interface pxPoint {
	from: Point;
	to: Point;
}
export interface DrawingLayer {
	brush: Brush;
	points: pxPoint[];
}



declare global {
	interface HTMLDivElement {
		_data: {
			image: string;
		}
	}
}
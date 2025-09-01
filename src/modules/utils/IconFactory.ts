/*
 *
 * Copyright (c) 1999-2025 Luciad All Rights Reserved.
 *
 * Luciad grants you ("Licensee") a non-exclusive, royalty free, license to use,
 * modify and redistribute this software in source and binary code form,
 * provided that i) this copyright notice and license appear on all copies of
 * the software; and ii) Licensee does not utilize the software in a manner
 * which is disparaging to Luciad.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 * IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
 * NON-INFRINGEMENT, ARE HEREBY EXCLUDED. LUCIAD AND ITS LICENSORS SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING
 * OR DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES. IN NO EVENT WILL LUCIAD OR ITS
 * LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 * INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 * CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 * OR INABILITY TO USE SOFTWARE, EVEN IF LUCIAD HAS BEEN ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGES.
 */
export interface IconOptions {
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface GradientCircleIconOptions extends IconOptions {
    fading?: string;
}

export interface TextIconOptions extends IconOptions {
    font?: string;
}

const DEFAULT_WIDTH = 64;
const DEFAULT_HEIGHT = 64;
const DEFAULT_STROKESTYLE = "rgba(155,167,23,1)";
const DEFAULT_FILLSTYLE = "rgba(155,167,23,1)";
const DEFAULT_FADINGSTYLE = "rgba(155,167,23,0.1)";
const DEFAULT_STROKEWIDTH = 1;

function toRadians(angle: number): number {
    return angle * Math.PI / 180;
}

function makeContext(options: Required<IconOptions>): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;

    canvas.width = options.width;
    canvas.height = options.height;

    context.strokeStyle = options.stroke;
    context.fillStyle = options.fill;
    context.lineWidth = options.strokeWidth;

    return [canvas, context];
}

function normalizeOptions(options?: IconOptions): Required<IconOptions> {
    options = options || {};
    return {
        width: options.width ?? DEFAULT_WIDTH,
        height: options.height ?? DEFAULT_HEIGHT,
        strokeWidth: options.strokeWidth ?? DEFAULT_STROKEWIDTH,
        stroke: options.stroke ?? DEFAULT_STROKESTYLE,
        fill: options.fill ?? DEFAULT_FILLSTYLE
    }
}

interface IconDomain extends Required<IconOptions> {
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    offset: number,
    radius: number,
    xCenter: number,
    yCenter: number,
    xRight: number,
    yBottom: number,
    solid: boolean
}

function getDomain(options?: IconOptions): IconDomain {
    const solid = !options ? false : !!options.fill; // no fill means hollow shapes to draw

    const opts = normalizeOptions(options);

    const ct = makeContext(opts);
    const canvas = ct[0];
    const offset = opts.strokeWidth / 2;
    const radius = (canvas.width - opts.strokeWidth) / 2;

    return {
        canvas: canvas,
        context: ct[1],
        offset: offset,
        radius: radius,
        xCenter: canvas.width / 2,
        yCenter: canvas.width / 2,
        xRight: canvas.width - offset,
        yBottom: canvas.height - offset,
        solid: solid,
        ...opts
    };
}

function drawPath(context: CanvasRenderingContext2D, xyPoints: [number, number][], solid?: boolean): void {
    context.beginPath();
    let moveTo = true;

    xyPoints.forEach(xy => {
        if (moveTo) {
            context.moveTo(xy[0], xy[1]);
            moveTo = false;
        } else {
            context.lineTo(xy[0], xy[1]);
        }
    });

    if (solid) {
        context.fill();
    }
    context.stroke();
}

function regularPolygon(options: IconOptions | undefined, size: number, startAngle?: number): HTMLCanvasElement {
    const domain = getDomain(options);
    const xyPoints = getPointRegularPolygon(domain.xCenter, domain.yCenter, domain.radius, size, startAngle);
    drawPath(domain.context, xyPoints, domain.solid);
    return domain.canvas;
}

function getPointRegularPolygon(xCenter: number, yCenter: number, radius: number, size: number,
                                startAngle?: number): [number, number][] {
    startAngle = startAngle ? startAngle * (Math.PI / 180) : 0.0;

    const angleAxisCorrection = Math.PI / 2; // -90 degrees
    const angleDrift = startAngle - angleAxisCorrection;
    let angle;

    const points: [number, number][] = [];
    points.push([xCenter + radius * Math.cos(angleDrift), yCenter + radius * Math.sin(angleDrift)]);

    for (let i = 1; i <= size; i += 1) {
        angle = (i * 2 * Math.PI / size) + angleDrift;
        points.push([xCenter + radius * Math.cos(angle), yCenter + radius * Math.sin(angle)]);
    }
    return points;
}

function cross(options?: IconOptions, angle?: number): HTMLCanvasElement {
    const domain = getDomain(options);
    const xyPoints = getPointRegularPolygon(domain.xCenter, domain.yCenter, domain.radius, 4, angle);
    drawPath(domain.context, [xyPoints[0], xyPoints[2]]);
    drawPath(domain.context, [xyPoints[1], xyPoints[3]]);
    return domain.canvas;
}

/**
 * Creates a circle icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image:createCircle({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createCircle(options?: IconOptions): HTMLCanvasElement {
    const domain = getDomain(options);
    const context = domain.context;
    const center = domain.xCenter;
    let radius = domain.radius;
    if (radius <= 0) {
        radius = 1;
    }
    context.arc(center, center, radius, 0, Math.PI * 2, false);
    if (domain.solid) {
        context.fill();
    }
    context.stroke();
    return domain.canvas;
}

/**
 * Creates a circle icon will a radial gradient of 2 colors that can be used as an image
 * in GeoCanvas.drawIcon The 2 colors are specified by the options.fill & option.fading
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image:createGradientCircle({fill: "rgba(255, 255, 225, 1.0)",
 *                                            fading: "rgba(225, 225, 225,0.2)",
 *                                            width: 30,
 *                                            height: 30})
 *              }
 *            );
 *
 *
 */
export function createGradientCircle(options?: GradientCircleIconOptions): HTMLCanvasElement {
    const domain = getDomain(options);
    const context = domain.context;

    const center = domain.xCenter;
    let radius = domain.radius;

    if (radius <= 4) {
        radius = 4;
    }

    const smallestRadius = radius * 0.25;
    const smallerRadius = radius * 0.75;

    const grd = context.createRadialGradient(center, center, smallestRadius, center, center, smallerRadius);
    grd.addColorStop(0, options?.fill ?? DEFAULT_FILLSTYLE);
    grd.addColorStop(1, options?.fading ?? DEFAULT_FADINGSTYLE);

    context.fillStyle = grd;
    context.arc(center, center, radius, 0, Math.PI * 2, false);
    context.fill();

    return domain.canvas;
}

/**
 * Creates a rectangle icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image: createRectangle({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createRectangle(options?: IconOptions): HTMLCanvasElement {
    const domain = getDomain(options);
    const context = domain.context;
    const canvas = domain.canvas;
    const offset = domain.offset;
    if (domain.solid) {
        context.fillRect(offset, offset, canvas.width - 2 * offset, canvas.height - 2 * offset);
    }
    context.strokeRect(offset, offset, canvas.width - 2 * offset, canvas.height - 2 * offset);
    return canvas;
}

/**
 * Creates a square icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image:createSquare({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createSquare(options?: IconOptions): HTMLCanvasElement {
    return regularPolygon(options, 4, 45);
}

/**
 * Creates a triangle icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image:createTriangle({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createTriangle(options?: IconOptions): HTMLCanvasElement {
    return regularPolygon(options, 3);
}

/**
 * Creates a pentagon icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image: createPentagon({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createPentagon(options?: IconOptions): HTMLCanvasElement {
    return regularPolygon(options, 5);
}

/**
 * Creates a hexagon icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image: createHexagon({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createHexagon(options?: IconOptions): HTMLCanvasElement {
    return regularPolygon(options, 6);
}

/**
 * Creates a star icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image:createStar({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createStar(options?: IconOptions): HTMLCanvasElement {
    const domain = getDomain(options);
    const size = 5; // number of vertices
    const startAngle = (360 / size) / 2;
    const xyInnerPoints = getPointRegularPolygon(domain.xCenter, domain.yCenter, domain.radius * 0.5, size, startAngle);
    const xyOuterPoints = getPointRegularPolygon(domain.xCenter, domain.yCenter, domain.radius, size, 0);
    const xyPoints = [];

    for (let idx = 0; idx < size; idx++) {
        xyPoints.push(xyOuterPoints[idx]);
        xyPoints.push(xyInnerPoints[idx]);
    }
    xyPoints.push(xyOuterPoints[0]);
    drawPath(domain.context, xyPoints, domain.solid);
    return domain.canvas;
}

/**
 * Creates a cross icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image: createCross({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */

export function createCross(options?: IconOptions): HTMLCanvasElement {
    return cross(options, 0);
}

/**
 * Creates a 'x' icon that can be used as an image in GeoCanvas.drawIcon
 * @example
 *  geoCanvas.drawIcon(
 *              shape,
 *              {
 *                width:"30px",
 *                height:"30px",
 *                image: createX({width:30, height:30, stroke:"#FF0000"})
 *              }
 *          );
 */
export function createX(options?: IconOptions): HTMLCanvasElement {
    return cross(options, 45)
}

/**
 * Creates a text icon that can be used as an image in GeoCanvas.drawIcon The text
 * is centered inside the icon.
 * @example
 * geoCanvas.drawIcon(
 *   shape, {
 *     width:"30px",
 *     height:"30px",
 *     image: createText("text", {width:30, height:30, fill:"#FF0000", font:"10pt Arial"})
 *   }
 * );
 */
export function createText(text: string, options?: TextIconOptions): HTMLCanvasElement {
    options = options || {};
    const domain = getDomain(options);
    const canvas = domain.canvas;
    const context = domain.context;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = options.font || "10pt Arial";
    context.fillText(text, domain.width / 2, domain.height / 2);

    return canvas;
}

/**
 * Creates a navaid icon consisting of 3 circles, that can be used as an image in
 * GeoCanvas.drawIcon
 * @example
 * geoCanvas.drawIcon(
 *   shape, {
 *     width:"30px",
 *     height:"30px",
 *     image: createNavaid({width:30, height:30, stroke:"#FF0000"})
 *   }
 * );
 */
export function createNavaid(options?: IconOptions): HTMLCanvasElement {
    const domain = getDomain(options);
    const context = domain.context;

    const xCenter = domain.xCenter;
    const yCenter = domain.yCenter;

    // outer circle
    context.beginPath();
    context.arc(xCenter, yCenter, domain.radius, 0, Math.PI * 2);
    context.closePath();
    context.stroke();

    //inner circle
    context.beginPath();
    context.arc(xCenter, yCenter, domain.radius / 8, 0, Math.PI * 2);
    context.closePath();
    context.stroke();

    //Ticks on circle
    const outerRadius = domain.radius - (domain.strokeWidth / 2);
    for (let i = 0; i < 12; i++) {
        const cosAngle = Math.cos(toRadians(30 * i));
        const sinAngle = Math.sin(toRadians(30 * i));
        const innerRadius = (i % 3 === 0) ? (domain.radius / 2) : (domain.radius * 0.75);

        context.beginPath();
        context.moveTo(xCenter + cosAngle * outerRadius, yCenter + sinAngle * outerRadius);
        context.lineTo(xCenter + cosAngle * innerRadius, yCenter + sinAngle * innerRadius);
        context.stroke();
    }

    //middle circle at double stroke width
    context.beginPath();
    context.lineWidth = context.lineWidth * 2;
    context.arc(xCenter, yCenter, domain.radius / 2, 0, Math.PI * 2);
    context.closePath();
    context.stroke();

    return domain.canvas;
}

interface FrustumIconOptions {
    size: number;
    colorStroke?: string;
    fillColor0?: string;
    fillColor1?: string;
}

/**
 * Creates a HTMLCanvasElement representing a frustum icon.
 *
 * This function creates a frustum icon visualized as a left-oriented triangle with a corner angle of 60 degrees.
 * The frustum's fill color is a gradient (interactive between `fillColor0` and `fillColor1`), and the stroke color is defined by `colorStroke`.
 * The size of the frustum is squared-off, guaranteeing a field of view angle of 60 degrees, which is the default value on 3D maps.
 *
 * @param options - Contains the customization options for the frustum icon:
 *    - size: The length of the sides of the square canvas onto which the frustum will be drawn.
 *    - colorStroke: The stroke color of the frustum (default is 'rgba(80,155,133,1)').
 *    - fillColor0: The starting color of the gradient fill (default is 'rgba(80,155,133,0.95)').
 *    - fillColor1: The ending color of the gradient fill (default is 'rgba(80,155,133,0)').
 *
 * @throws Will throw an error if unable to get the canvas context.
 *
 * @returns The canvas element onto which the frustum icon has been drawn.
 *
 * @example
 * createFrustum({ size: 60 });
 */
export function createFrustum({
                                  size,
                                  colorStroke = 'rgba(0,155,133,1)',
                                  fillColor0 = 'rgba(80,155,133,0.95)',
                                  fillColor1 = 'rgba(80,155,133,0)'
                              }: FrustumIconOptions): HTMLCanvasElement {
    // the square guarantees that the fov angle is 60 degrees, which is the default value on 3D maps.
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    if (!ctx) {
        throw new Error('IconFactory: Cannot get canvas context');
    }
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colorStroke;
    ctx.strokeStyle = colorStroke;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const cameraY = canvas.height / 2;
    const frustumEndX = canvas.width;

    const gradient = ctx.createLinearGradient(0, cameraY, frustumEndX, cameraY);
    gradient.addColorStop(0, fillColor0);
    gradient.addColorStop(1, fillColor1);

    // 2D frustum
    ctx.beginPath();
    ctx.moveTo(frustumEndX, 0);
    ctx.lineTo(0, cameraY);
    ctx.lineTo(frustumEndX, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();
    return canvas;
}

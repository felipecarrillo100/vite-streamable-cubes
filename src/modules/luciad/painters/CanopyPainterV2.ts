import {FeaturePainter, PaintState} from "@luciad/ria/view/feature/FeaturePainter.js";
import {GeoCanvas} from "@luciad/ria/view/style/GeoCanvas.js";
import {Feature} from "@luciad/ria/model/feature/Feature.js";
import {Shape} from "@luciad/ria/shape/Shape.js";
import {Layer} from "@luciad/ria/view/Layer.js";
import {LabelCanvas} from "@luciad/ria/view/style/LabelCanvas.js"
import {Map} from "@luciad/ria/view/Map.js";

import {Icon3DStyle} from "@luciad/ria/view/style/Icon3DStyle.js";
import {create3DCylinder} from "../meshes/simple3DMeshes/Simple3DMeshFactory.ts";
import {createPoint} from "@luciad/ria/shape/ShapeFactory.js";
import {Point} from "@luciad/ria/shape/Point.js";
import {PointLabelPosition} from "@luciad/ria/view/style/PointLabelPosition.js";
import {TypicalGoogleScaleRanges} from "../queryproviders/CubeQueryProvider.ts";
import {PerspectiveCamera} from "@luciad/ria/view/camera/PerspectiveCamera.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {createCartesianGeodesy} from "@luciad/ria/geodesy/GeodesyFactory.js";
import {LocationMode} from "@luciad/ria/transformation/LocationMode.js";

const CARTESIAN_GEODESY = createCartesianGeodesy(getReference("EPSG:4978"));

const OwnerColorMap = {
    1: "#d61616", // red
    2: "#3ed10d", // green
    3: "#165bc3", // blue
    4: "#ccc217", // yellow
    5: "#a64bcf", // purple
    6: "#16c3b5", // teal
    7: "#e67e22", // orange
    8: "#c3c3c3", // gray
    9: "#f06292", // pink
    10:"#8d6e63"  // brown
}
type OwnerId = keyof typeof OwnerColorMap;

const shapeStyle = {
    stroke: {
        width: 1,
        color: "rgb(188,186,186)"
    },
    fill: {
        // color: "rgb(55,255,0)"
        color: "rgb(170,255,0)"
    }
}

const cellColor = "rgba(170,255,0,0.5)";


const selectedShapeStyle = {
    stroke: {
        width: 1,
        color: "rgb(188,186,186)"
    },
    fill: {
        color: "rgb(0,72,255)"
    }
}

const IconStyle: Icon3DStyle = {
    mesh: create3DCylinder(Math.SQRT2 / 2, 1, 4),
    color: "rgba(255,255,255,1)",
    rotation: {
        x: 0,
        y: 0,
        z: 45
    },
    translation: {
        x: 0,
        y: 0,
        z: 0
    },
    scale: {
        x: 1,
        y: 1,
        z: 1
    },
    legacyAxis: false
};

const Transparent = "rgba(0,0,0,0)";
export class CanopyPainterV2 extends FeaturePainter {

    getDetailLevelScales(): number[] {
        return TypicalGoogleScaleRanges;
    }

    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        if (feature.id === "bounds") {
            this.paintPolygon(geoCanvas, feature, shape, layer, map, paintState);
            return;
        }

        //if (feature.properties.availability_rate) {
        if (paintState.level===0) {
            const ref = getCenterScreenInMapCoords(map);
            const eye = map.camera.eyePoint;
            const distance = CARTESIAN_GEODESY.distance3D(ref, eye);
            const lookAt = (map.camera as PerspectiveCamera).asLookAt(distance);
            if (lookAt.pitch<-15) {
                this.paintFileFeatures(geoCanvas, feature, shape, layer, map, paintState);
            }
            return;
        }

        if (typeof feature.properties.a === "undefined") return;

        let fillColor = shapeStyle.fill.color;
        if (feature.properties.o > 0) {
            fillColor = OwnerColorMap[feature.properties.o as OwnerId];
        }
        if (paintState.selected) {
            fillColor = lightenColor(fillColor);
        }

        const {minH, maxH} = getCubeHeights(feature.properties);
        const scaleZ = maxH - minH;
        const translationZ = scaleZ / 2;

        const p = shape as Point;
        const point = createPoint(shape.reference, [p.x, p.y, minH + translationZ]);

        const icon3dStyle: Icon3DStyle = {
            ...IconStyle,
            color: fillColor,
            scale: {x: 1, y: 1, z: scaleZ},
        }
        geoCanvas.drawIcon3D(point, icon3dStyle);
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, paintState: PaintState) {
        if (paintState.selected) {
            const {maxH} = getCubeHeights(feature.properties);
            const p = shape.focusPoint as Point;
            const point = createPoint(shape.reference, [p.x, p.y, maxH]);
            const name = `id_${feature.id}`;
            const label = `<div class="painter_state_label"><span>${name}</span></div>`
            labelCanvas.drawLabel(label, point, {positions: [PointLabelPosition.NORTH]});
        }
    }

    paintFileFeatures(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, _paintState: PaintState) {
        if (typeof feature.properties.availability_rate === "undefined") return;

        const {minH, maxH} = getCubeHeights(feature.properties);
        const scaleXY = feature.properties.scale;
        const scaleZ = maxH - minH;
        const translationZ = scaleZ / 2;

        const p = shape as Point;
        const point = createPoint(shape.reference, [p.x, p.y, minH + translationZ]);
        const fillColor = cellColor;

        const icon3dStyle: Icon3DStyle = {
            ...IconStyle,
            color: fillColor,
            scale: {x: scaleXY, y: scaleXY, z: scaleZ},
        }
        geoCanvas.drawIcon3D(point, icon3dStyle);
    }


    paintPolygon(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, _layer: Layer, _map: Map, paintState: PaintState) {
            const baseStyle = paintState.selected ? selectedShapeStyle : shapeStyle;

            // Determine fill color based on feature properties
            let fillColor = baseStyle.fill?.color;
            let strokeColor = baseStyle.stroke?.color;
            if (feature.properties.available === false) {
                fillColor = Transparent;
                strokeColor = Transparent;
            } else if (feature.properties.o) {
                fillColor = paintState.selected ? "rgb(209,117,23)" : "rgb(75,152,54, 0.9999)";
            }

            // Create a safe copy of the style with updated fill color
            const myShapeStyle = {
                ...baseStyle,
                fill: {
                    ...baseStyle.fill,
                    color: fillColor
                },
                stroke: {
                    ...baseStyle.stroke,
                    color: strokeColor
                }
            };
            geoCanvas.drawShape(shape, myShapeStyle);
    }

}

function roundTo2(num: number): number {
   // return Math.round(num * 100) / 100;
    return Math.round(num);
}

function getCubeHeights(properties: Record<string, number>) {
    return {
        minH:roundTo2(properties.minH),
        maxH:roundTo2(properties.maxH)
    }
}

function lightenColor(fillColor: string, percent: number = 50): string  {
    // Clamp a value between a min and max
    const clamp = (val: number, max: number = 255) => Math.max(0, Math.min(max, val));

    // Convert HEX to RGB
    const hexToRgb = (hex: string): [number, number, number] | null => {
        const match = hex.replace(/^#/, "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return match
            ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
            : null;
    };

    // Try to parse RGB format
    const rgbMatch = fillColor.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
    let r: number, g: number, b: number;

    if (rgbMatch) {
        r = parseInt(rgbMatch[1], 10);
        g = parseInt(rgbMatch[2], 10);
        b = parseInt(rgbMatch[3], 10);
    } else {
        const rgbFromHex = hexToRgb(fillColor);
        if (!rgbFromHex) return fillColor;
        [r, g, b] = rgbFromHex;
    }

    // Convert percent to factor (0–1 range)
    const lightenFactor = clamp(percent,  100) / 100;

    // Lighten each channel toward white
    r = clamp(r + (255 - r) * lightenFactor);
    g = clamp(g + (255 - g) * lightenFactor);
    b = clamp(b + (255 - b) * lightenFactor);

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function getCenterScreenInMapCoords(map: Map) {
    return map.getViewToMapTransformation(LocationMode.CLOSEST_SURFACE).transform(
        createPoint(null, [map.viewSize[0] / 2, map.viewSize[1] / 2]));
}

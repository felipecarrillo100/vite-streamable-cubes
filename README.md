## Advanced Styling with Painters for Feature Layers

For a comprehensive guide on styling vector layers, refer to the following article:
- [Painter Documentation](https://dev.luciad.com/portal/productDocumentation/LuciadRIA/docs/articles/tutorial/getting_started/vector_styling.html)

### Introduction to Painters

In LuciadRIA, every `FeatureLayer` requires a painter to render geometries on the screen using the specified colors and styles. If a painter is not explicitly assigned, LuciadRIA defaults to using the `BasicFeaturePainter`, as demonstrated in the `WFS` example.

The `BasicFeaturePainter` is suitable for basic visualization needs where the appearance of features is not a priority. It offers limited customization options. For more extensive customization, creating a custom painter provides the flexibility to style features according to specific requirements.

### Creating a Custom Painter

To develop a custom painter, extend the `FeaturePainter` class and implement the `paintBody` and, if necessary, `paintLabel` methods. Here's an example:

```typescript
class YourCustomPainter extends FeaturePainter {
    paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
        // Your custom code to draw the shape's body goes here...
        geoCanvas.drawShape(shape, style);
    }

    paintLabel(labelCanvas: LabelCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
      // Your custom code to draw the shape's labe goes here...
        const name = feature.properties.STATE_NAME;
        const label = `<div class="painter_state_label"><span>${name}</span></div>`;
        labelCanvas.drawLabel(label, shape, {});
    }
}
```

- `FeaturePainter.paintBody`: Renders the feature's shape on the map.
- `FeaturePainter.paintLabel`: Renders a label at the feature's location.

### Drawing Methods

- **GeoCanvas Methods**:
    - `GeoCanvas.drawShape`: Draws polylines and polygons.
    - `GeoCanvas.drawIcon`: Draws an icon at a point's location.
    - `GeoCanvas.drawIcon3D`: Draws a 3D icon at a point's location.

For further details, explore the [GeoCanvas API](https://dev.luciad.com/portal/productDocumentation/LuciadRIA/docs/reference/LuciadRIA/interfaces/_luciad_ria_view_style_GeoCanvas.GeoCanvas.html).

- **LabelCanvas Methods**:
    - `LabelCanvas.drawLabel`: Draws labels at a point.
    - `LabelCanvas.drawLabelInPath`: Draws a label inside a polygon.
    - `LabelCanvas.drawLabelOnPath`: Draws a label along a line.

For more information, refer to the [LabelCanvas API](https://ldp.luciad.com/portal/productDocumentation/LuciadRIA/docs/reference/LuciadRIA/interfaces/_luciad_ria_view_style_LabelCanvas.LabelCanvas.html).

### Conditional Styling

The appearance of a feature can be dynamically adjusted based on its properties or status (e.g., selected, hovered). For more insights, see the [PaintState documentation](https://dev.luciad.com/portal/productDocumentation/LuciadRIA/docs/reference/LuciadRIA/interfaces/_luciad_ria_view_feature_FeaturePainter.PaintState.html).

#### Example of Conditional Styling

```typescript
paintBody(geoCanvas: GeoCanvas, feature: Feature, shape: Shape, layer: Layer, map: Map, paintState: PaintState) {
    const style = paintState.selected ? selectedStyle : normalStyle;
    if (paintState.hovered) {
        style.height = 20;
        style.width = 20;
    } else {
        style.height = 16;
        style.width = 16;
    }
    geoCanvas.drawIcon(shape, style);
}
```

This example demonstrates how to alter the icon size based on whether a feature is hovered over or selected, providing a more interactive and visually responsive user experience.

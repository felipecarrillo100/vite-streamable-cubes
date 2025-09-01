# LuciadRIA Canopy Rendering Prototype

This project provides an interactive 3D map visualization using
**LuciadRIA**, focused on rendering canopy features as colored cubes
with dynamic heights and styles.

## Project Structure

### 1. `LuciadMap.tsx`

-   React functional component for setting up the **LuciadRIA WebGL
    map**.
-   Initializes a `FeatureLayer` backed by a `FeatureModel`
    containing canopy data. The FeatureModel retrieves data from `StreamableJSONStore`
-   Integrates the **custom painter** (`CanopyPainter`) for rendering
    cubes.


### 2. `StreamableJSONStore.ts`

`StreamableJSONStore` is a custom data store implementation extending LuciadRIA’s Feature `Store`.  
It provides **incremental (streaming) loading of JSON features** instead of loading everything at once.

It initially retrieves an index file (`grid-metadata.json` file)  that describes the structure of the dataset

The `grid-metadata.json` will point to each individual file that represents a tile.

Each tile is selfcontain and it contains enough data for to reconstrunt the cubes inside.
g-r0c0.json.gz




### 4. `CanopyPainter.ts`

-   Custom `FeaturePainter` that controls how canopy features are drawn.
-   Uses `Icon3DStyle` cylinders to represent cubes with variable
    heights and colors.
-   Implements color mapping based on **owner ID** (1--10).
-   Features marked as **selected** are lightened for emphasis.
-   Features with `unavailable=true` are rendered transparent.
-   Includes utilities for:
  -   Extracting cube heights (`minH`, `maxH`).
  -   Rendering polygons and file-based features with
      `availability_rate`.
  -   Adjusting colors with a `lightenColor` function.

## How It Works

1.  **Data Flow**:\
    `StreamableJSONStore` → assigned to a  → `FeatureModel` → feeds into
    `FeatureLayer` → painted by `CanopyPainter`. As user zooms and pans `StreamableJSONStore.spatialQuery` is called with the new bounds and zoom level to load that the tiles visible on the screen


2.  **Rendering**:

  -   Cubes are drawn in 3D with colors per owner ID.\
  -   Selection highlights and availability-based styling are applied
      dynamically.\
  -   Currently, the bounds and file-based features are rendered so that the cubes are easy to find.

## Requirements

-   **LuciadRIA**
-   React + TypeScript
-   WebGL-enabled browser

## Running the Project

1.  Install dependencies:

    ``` bash
    npm install
    ```

2.  Start the development server:

    ``` bash
    npm run dev
    ```

3.  Open the application in your browser (default:
    `http://localhost:5173`).


# Data representation
### Entry 
Metadata file (grid-metadata.json)
```typescript
type StreamableBSONGrid = {
  originLon: number;            // degrees (EPSG:4326)
  originLat: number;            // degrees (EPSG:4326)
  width: number;                // total number of columns (cells) across the whole grid
  height: number;               // total number of rows (cells) across the whole grid
  chunkSize: number;            // nominal chunk side length in cells (e.g., 256)
  totalChunksX: number;         // number of chunk columns
  totalChunksY: number;         // number of chunk rows
  boundingBox: [minLon, minLat, maxLon, maxLat]; // degrees
  lookup: LookupEntry[][];      // 2D array [row][col] with per-chunk metadata and file path
}
```
## Chunk file (Chunk)

A chunk file (gzipped JSON) contains:
```typescript
interface Chunk {
  lon: number;      // bottom-left longitude of this chunk (degrees)
  lat: number;      // bottom-left latitude of this chunk (degrees)
  width: number;    // cells across in this chunk (may be < chunkSize at edges)
  height: number;   // cells high in this chunk (may be < chunkSize at edges)
  cells: Cell[];    // flat row-major array, length = width * height
}
```
## Cell (Cell)

Each entry in cells[]:
```typescript
interface Cell {
  a: boolean;       // available? (true → create a feature)
  o?: number;       // owner id (0 = free, >0 = owner id)
  minH?: number;    // minimum height (meters)
  maxH?: number;    // maximum height (meters)
}
```

## License

This project is provided under the license terms defined by Luciad
(Hexagon). See the file headers for details.

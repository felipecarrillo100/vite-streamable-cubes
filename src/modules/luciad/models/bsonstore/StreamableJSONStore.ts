import {QueryOptions, Store} from "@luciad/ria/model/store/Store.js";
import {Bounds} from "@luciad/ria/shape/Bounds.js";
import {Cursor} from "@luciad/ria/model/Cursor.js";
import {Feature, FeatureId, FeatureProperties} from "@luciad/ria/model/feature/Feature.js";
import {createBounds, createPoint} from "@luciad/ria/shape/ShapeFactory.js";
import {ArrayCursor} from "@luciad/ria/model/store/ArrayCursor.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import {Shape} from "@luciad/ria/shape/Shape.js";
import {EventedSupport} from "@luciad/ria/util/EventedSupport.js";
import {fetchAndDecompressGzip} from "../../../utils/FetchGridData.ts";

export interface Cell {
    /** Availability flag for the cell */
    a: boolean;

    /** Owner id  (only present if available, 0 means free, o>0 means owner id) */
    o?: number;

    /** Minimum height (only if available) */
    minH?: number;

    /** Maximum height (only if available) */
    maxH?: number;
}

export interface Chunk {
    /** Longitude of bottom-left corner of the chunk */
    lon: number;

    /** Latitude of bottom-left corner of the chunk */
    lat: number;

    /** Number of cells in chunk width (may be less than chunkSize on edges) */
    width: number;

    /** Number of cells in chunk height (may be less than chunkSize on edges) */
    height: number;

    /** List of cells in the chunk */
    cells: Cell[];
}



interface LookupEntry {
    file: string;
};

export type StreamableBSONGrid = {
    originLon: number;
    originLat: number;
    width: number;
    height: number;
    chunkSize: number;
    totalChunksX: number;
    totalChunksY: number;
    boundingBox: [number, number, number, number];
    lookup: LookupEntry[][];
};

interface NeededFile {
    filename: string;
    row: number;
    col: number;
}

interface StreamableBSONStoreContructorOptions {
    url: string;
    options?: RequestInit;
}

/**
 * DynamicGrid represents a 2D grid of 1-meter square cells on Earth's surface.
 * The grid covers a rectangular area defined by an origin coordinate, width, and height.
 * Each grid cell is uniquely identified by its column and row indices.
 *
 * Internally, the grid stores minimal data (no redundant geometry or lat/lon),
 * inferring the geographic location from the cell indices and the origin.
 *
 * This class extends LuciadRIA's MemoryStore to support spatial queries
 * and integration with LuciadRIA features.
 */
export class StreamableJSONStore extends EventedSupport implements Store {
    private url: string;
    private fetchOptions: RequestInit;
    private descriptor: StreamableBSONGrid | undefined;
    private basePath: string;
    private _bounds: Bounds | undefined;

    get bounds(): Bounds | undefined {
        return this._bounds;
    }

    set bounds(value: Bounds) {
        this._bounds = value;
    }

    private ref = getReference("EPSG:4326");

    constructor(o: StreamableBSONStoreContructorOptions) {
        super();
        this.url = o.url;
        this.basePath =  this.getBasePath();
        this.fetchOptions = o.options ? o.options  : {};
        const reference = getReference("EPSG:4326");


        this.fetchEntryPoint().then(data=>{
            this.descriptor = data;
            this._bounds = createBounds(reference,  [
                this.descriptor.boundingBox[0], this.descriptor.boundingBox[2]-this.descriptor.boundingBox[0],
                this.descriptor.boundingBox[1], this.descriptor.boundingBox[3]-this.descriptor.boundingBox[1]]);
            this.emit("StoreReady", {test: 123});
        })
    }

    private getBasePath() {
        let path = this.url;
            // Remove query and hash
            path = path.split(/[?#]/)[0];

            // Split into segments and remove the last segment (file name)
            const segments = path.split("/");
            segments.pop();

            // If there’s nothing left, return '.' (current dir)
            return segments.length ? segments.join("/") || "/" : ".";
    }

    private async fetchEntryPoint(): Promise<StreamableBSONGrid> {
        try {
            const headers = new Headers(this.fetchOptions.headers || {});

            const response = await fetch(this.url, {
                ...this.fetchOptions,
                headers,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }

            // Try parsing JSON, with error handling
            try {
                const data = await response.json();
                return data as StreamableBSONGrid;
            } catch (jsonErr) {
                throw new Error(`Failed to parse JSON response: ${(jsonErr as Error).message}`);
            }

        } catch (err) {
            // Re-throw as a more specific error if needed, or just propagate
            throw new Error(`Fetch error: ${(err as Error).message}`);
        }
    }

    async spatialQuery(
        queryBounds: Bounds,
        queryLevel?: number,
    ): Promise<Cursor<Feature>> {
        // console.log("Query Level" + queryLevel);
        const tolerance: number = 0.5; // fraction of a chunk to expand bounds

        if (!this.descriptor || !this.bounds) return new ArrayCursor([]);
        const descriptor = this.descriptor as StreamableBSONGrid;

        const boxFeature = new Feature(this.bounds, {}, "bounds")
        if (typeof queryLevel !== "undefined" && queryLevel < 1) {
            return new ArrayCursor([boxFeature]);
         //   return new ArrayCursor(this.parentCubes());
        }

        // Normalize query bounds
        const qMinLon = Math.min(queryBounds.x, queryBounds.x + queryBounds.width);
        const qMaxLon = Math.max(queryBounds.x, queryBounds.x + queryBounds.width);
        const qMinLat = Math.min(queryBounds.y, queryBounds.y + queryBounds.height);
        const qMaxLat = Math.max(queryBounds.y, queryBounds.y + queryBounds.height);

        const [minLon, minLat, maxLon, maxLat] = descriptor.boundingBox;

        // Clamp query to dataset bounding box
        const clampedMinLon = Math.max(qMinLon, minLon);
        const clampedMaxLon = Math.min(qMaxLon, maxLon);
        const clampedMinLat = Math.max(qMinLat, minLat);
        const clampedMaxLat = Math.min(qMaxLat, maxLat);

        if (clampedMinLon > clampedMaxLon || clampedMinLat > clampedMaxLat) return new ArrayCursor([boxFeature]);

        // Calculate chunk size in lon/lat
        const lonPerChunk = (maxLon - minLon) / descriptor.totalChunksX;
        const latPerChunk = (maxLat - minLat) / descriptor.totalChunksY;

        // Apply tolerance (fraction of chunk size)
        const tolLon = tolerance * lonPerChunk;
        const tolLat = tolerance * latPerChunk;

        const tolMinLon = clampedMinLon - tolLon;
        const tolMaxLon = clampedMaxLon + tolLon;
        const tolMinLat = clampedMinLat - tolLat;
        const tolMaxLat = clampedMaxLat + tolLat;

        // Compute chunk indices
        const startCol = Math.floor((tolMinLon - minLon) / lonPerChunk);
        const endCol = Math.floor((tolMaxLon - minLon) / lonPerChunk);
        const startRow = Math.floor((tolMinLat - minLat) / latPerChunk);
        const endRow = Math.floor((tolMaxLat - minLat) / latPerChunk);

        if (![startCol, endCol, startRow, endRow].every(Number.isFinite)) return new ArrayCursor([boxFeature]);

        // Clamp to grid limits
        const col0 = Math.max(0, Math.min(descriptor.totalChunksX - 1, Math.min(startCol, endCol)));
        const col1 = Math.max(0, Math.min(descriptor.totalChunksX - 1, Math.max(startCol, endCol)));
        const row0 = Math.max(0, Math.min(descriptor.totalChunksY - 1, Math.min(startRow, endRow)));
        const row1 = Math.max(0, Math.min(descriptor.totalChunksY - 1, Math.max(startRow, endRow)));

        // Collect needed files
        const neededFiles: NeededFile[] = [];
        for (let r = row0; r <= row1; r++) {
            for (let c = col0; c <= col1; c++) {
                const entry = descriptor.lookup[r]?.[c];
                if (entry?.file) neededFiles.push({ filename: entry.file, row: r, col: c });
            }
        }

        // console.log("Needed files:", neededFiles);

        const featureArrays = await this.loadTilesFromFiles(neededFiles);
      //  featureArrays.push([boxFeature]);
        return new ArrayCursor(featureArrays.flat());
    }

    private async loadTilesFromFiles(neededFiles: NeededFile[]): Promise<Feature[]> {
        if (!this.descriptor) return [];

        const { chunkSize } = this.descriptor;
        const allFeatures: Feature[] = [];

        await Promise.all(
            neededFiles.map(async (data) => {
                try {
                    const buffer = await fetchAndDecompressGzip(`${this.basePath}/${data.filename}`);

                    // Convert buffer → string
                    const jsonString = new TextDecoder("utf-8").decode(buffer);
                    //
                    // // Parse JSON
                    const json = JSON.parse(jsonString) as Chunk;

                    const rowBase = data.row * chunkSize;
                    const colBase = data.col * chunkSize;

                    for (let index = 0; index < json.cells.length; index++) {
                        const cell = json.cells[index];
                        if (!cell.a) continue;

                        const row = Math.floor(index / json.width);
                        const col = index % json.width;

                        const lon = json.lon + metersToLonDegrees(col, json.lat);
                        const lat = json.lat + metersToLatDegrees(row);
                        const absRow = rowBase + row;
                        const absCol = colBase + col;

                        const point = createPoint(this.ref, [lon, lat]);

                        allFeatures.push(
                            new Feature(
                                point,
                                {
                                    ...cell,
                                    gr: data.row,
                                    gc: data.col,
                                    row: absRow,
                                    col: absCol
                                },
                                `${absCol}_${absRow}`
                            )
                        );
                    }
                } catch (err) {
                    console.error(`Error loading ${data.filename}:`, err);
                }
            })
        );

        return allFeatures;
    }

    parentCubes() {
        const descriptor = this.descriptor;
        const features: Feature[] = [];
        if (descriptor) {
            const centerChunk = descriptor.chunkSize / 2;
            for (let r = 0; r < descriptor.totalChunksY; r++) {
                for (let c = 0; c < descriptor.totalChunksX; c++) { // fix <= to <
                    const entry = descriptor.lookup[r]?.[c];
                    // @ts-ignore
                    if (!entry && entry.availability_rate===0) continue;

                    // Calculate global meters offset
                    const offsetX = c * descriptor.chunkSize + centerChunk;
                    const offsetY = r * descriptor.chunkSize + centerChunk;

                    // Convert meters offset to lon/lat
                    const lon = descriptor.originLon + metersToLonDegrees(offsetX, descriptor.originLat);
                    const lat = descriptor.originLat + metersToLatDegrees(offsetY);

                    const point = createPoint(this.ref, [lon, lat]);
                    const feature = new Feature(point, { ...entry, scale: descriptor.chunkSize }, `p_${r}_${c}`);
                    features.push(feature);
                }
            }
        }
        return features;
    }


    add?(_feature: Feature<Shape | null, FeatureProperties>, _options?: any): FeatureId | Promise<FeatureId> {
        throw new Error("Method not implemented.");
    }
    get?(_id: FeatureId, _options?: any): Feature<Shape | null, FeatureProperties> | Promise<Feature<Shape | null, FeatureProperties>> | undefined {
        throw new Error("Method not implemented.");
    }
    put?(_feature: Feature<Shape | null, FeatureProperties>, _options?: any): FeatureId | Promise<FeatureId> {
        throw new Error("Method not implemented.");
    }
    remove?(_id: FeatureId): boolean | Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    query(_query?: any, _options?: QueryOptions): Cursor<Feature<Shape | null, FeatureProperties>> | Promise<Cursor<Feature<Shape | null, FeatureProperties>>> {
        throw new Error("Method not implemented.");
    }

}

/**
 * Converts meters to degrees longitude based on latitude.
 */
function metersToLonDegrees(meters: number, latitude: number): number {
    const earthRadius = 6378137; // in meters (WGS84)
    return (meters / (earthRadius * Math.cos((Math.PI * latitude) / 180))) * (180 / Math.PI);
}

/**
 * Converts meters to degrees latitude.
 */
function metersToLatDegrees(meters: number): number {
    const earthRadius = 6378137; // in meters
    return (meters / earthRadius) * (180 / Math.PI);
}

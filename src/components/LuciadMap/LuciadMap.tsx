import React, {useEffect, useRef} from "react";
import {WebGLMap} from "@luciad/ria/view/WebGLMap.js";
import {getReference} from "@luciad/ria/reference/ReferenceProvider.js";
import "./LuciadMap.css";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer.js";

import {LoadSpatially} from "@luciad/ria/view/feature/loadingstrategy/LoadSpatially.js";
import CubeQueryProvider from "../../modules/luciad/queryproviders/CubeQueryProvider.ts";
import {QuadTreeRasterTileSetStructure} from "@luciad/ria/model/tileset/RasterTileSetModel.js";
import {createBounds} from "@luciad/ria/shape/ShapeFactory.js";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel.js";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer.js";
import {StreamableBSONStore} from "../../modules/luciad/models/bsonstore/StreamableBSONStore.ts";
import {CanopyPainter} from "../../modules/luciad/painters/CanopyPainter.ts";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel.js";
import {Bounds} from "@luciad/ria/shape/Bounds.js";

export const LuciadMap: React.FC = () => {
    const divElement = useRef(null as null | HTMLDivElement);
    const nativeMap = useRef(null as null | WebGLMap);

    useEffect(()=>{
        // Initialize Map
        if (divElement.current!==null) {
            nativeMap.current = new WebGLMap(divElement.current, {reference: getReference("EPSG:4978")});
            // @ts-ignore
            nativeMap.current.mapNavigator.constraints.above.minAltitude = 0.5;
            LoadLayers(nativeMap.current);
        }
        return ()=>{
            // Destroy map
            if (nativeMap.current) nativeMap.current.destroy();
        }
    },[])
    return (<div className="LuciadMap" ref={divElement}></div>)
}


function LoadLayers(map: WebGLMap) {
    const webMercatorReference = getReference("EPSG:3857");
    const quadTreeStructure : QuadTreeRasterTileSetStructure = {
        bounds: createBounds(webMercatorReference, [-20037508.3427892, 2 * 20037508.3427892, -20037508.3427892, 2 * 20037508.3427892]),
        level0Columns: 1,
        level0Rows: 1,
        reference: webMercatorReference
    };
    const model = new UrlTileSetModel({
        baseURL: "https://a.tile.openstreetmap.org/{z}/{x}/{-y}.png",
        structure: quadTreeStructure
    })
// Create a layer for the model.
    const layer = new RasterTileSetLayer(model, {
        label: "OpenStreetMap"
    });
    map.layerTree.addChild(layer);
    loadTheaters(map);
}

// Using  WFSFeatureStore.createFromUR
function loadTheaters(map: WebGLMap) {

    const reference = getReference("EPSG:4326");
    const gridStore = new StreamableBSONStore({url: "./data/datasetHuge/grid-metadata.json"});
    const gridModel = new FeatureModel(gridStore, {reference});

    const gridLayer =  new FeatureLayer(gridModel, {
        label: "Grido",
        selectable: true,
      //  hoverable: true,
        loadingStrategy: new LoadSpatially({
            queryProvider: new CubeQueryProvider({limit:10000})
        }),
       // incrementalRendering: true
    });

    gridLayer.painter = new CanopyPainter();
    map.layerTree.addChild(gridLayer);

    gridStore.on("StoreReady", ()=>{
        if (map.mapNavigator) {
            map.mapNavigator.fit({
                bounds: gridStore.bounds as Bounds,
                animate: true
            });
        }
    });

}





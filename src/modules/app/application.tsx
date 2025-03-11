import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import "ol/ol.css";
import { TilfluktsromLayerCheckbox } from "../tilfluktsromLayer";
import { DistrikerLayerCheckbox } from "../sivilforsvarLayer";
import { Layer } from "ol/layer";

// By calling the "useGeographic" function in OpenLayers, we tell that we want coordinates to be in degrees
//  instead of meters, which is the default. Without this `center: [10.6, 59.9]` brings us to "null island"
useGeographic();

// oppretter ny vectorLayer for distrikter kan brukes til fremtidige vectorLayers

// Here we create a Map object. Make sure you `import { Map } from "ol"`. Otherwise, the standard Javascript
//  map data structure will be used
const map = new Map({
  // The map will be centered on a position in longitude (x-coordinate, east) and latitude (y-coordinate, north),
  //   with a certain zoom level
  view: new View({ center: [10.8, 59.9], zoom: 13 }),
});

// A functional React component
const osmLayer = new TileLayer({ source: new OSM() });

export function Application() {
  // `useRef` bridges the gap between JavaScript functions that expect DOM objects and React components
  const mapRef = useRef<HTMLDivElement | null>(null);
  // When we display the page, we want the OpenLayers map object to target the DOM object refererred to by the
  // map React component
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    map.setLayers([osmLayer, ...layers]);
  }, [layers]);

  // This is the location (in React) where we want the map to be displayed
  return (
    <>
      <TilfluktsromLayerCheckbox setLayers={setLayers} map={map} />
      <DistrikerLayerCheckbox setLayers={setLayers} map={map} />
      <div ref={mapRef}></div>
    </>
  );
}

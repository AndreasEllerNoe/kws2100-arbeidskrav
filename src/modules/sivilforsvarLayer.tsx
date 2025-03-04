import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Layer } from "ol/layer";
import React, { useEffect, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay } from "ol";
import { FeatureLike } from "ol/Feature";
import { Fill, Stroke, Style } from "ol/style";

const source = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/distrikter.json",
  format: new GeoJSON(),
});

const distrikterStyle = new Style({
  fill: new Fill({
    color: "rgba(255, 0, 0, 0 )",
  }),
  stroke: new Stroke({
    color: "red",
    width: 1,
  }),
});

const distrikterLayer = new VectorLayer({ source, style: distrikterStyle });
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function DistrikerLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: (value: (prevState: Layer[]) => Layer[]) => void;
  map: Map;
}) {
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedDistrikter, setSelectedDistrikter] = useState<FeatureLike[]>(
    [],
  );

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    setSelectedDistrikter(map.getFeaturesAtPixel(e.pixel));
    overlay.setPosition(e.coordinate);
  }

  useEffect(() => {
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
  }, []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, distrikterLayer]);
      map.on("click", handleClick);
    } else {
      setLayers((old) => old.filter((l) => l !== distrikterLayer));
    }
  }, [checked]);
  return (
    <button onClick={() => setChecked((b) => !b)}>
      <input type={"checkbox"} checked={checked} />
      Show distrikter on map
      <div ref={overlayRef}>
        Clicked tilfuktsrom:{" "}
        {selectedDistrikter.map((s) => s.getProperties().navn).join(", ")}
      </div>
    </button>
  );
}

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Layer } from "ol/layer";
import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { Fill, Stroke, Style } from "ol/style";

interface Properties {
  distriktnummer: number;
  distriktnavn: string;
  id: string;
  name: string;
}

type TypedFeature<T> = { getProperties(): T } & Feature;

const source = new VectorSource<TypedFeature<Properties>>({
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

const hoverStyle = new Style({
  fill: new Fill({
    color: "rgba(255, 0, 0, 0.1)",
  }),
  stroke: new Stroke({
    color: "red",
    width: 5,
  }),
});

const distrikterLayer = new VectorLayer({
  source,
  style: (feature) => (feature.get("hover") ? hoverStyle : distrikterStyle),
});
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
  const [selectedDistrikter, setSelectedDistrikter] = useState<Properties[]>(
    [],
  );

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const feature = source.getClosestFeatureToCoordinate(
      e.coordinate,
    ) as TypedFeature<Properties> | null;
    if (feature) {
      setSelectedDistrikter([feature.getProperties()]);
    } else {
      setSelectedDistrikter([]);
    }
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
    const pointer = (e: MapBrowserEvent<MouseEvent>) => {
      source.forEachFeature((feature) => {
        feature.set("hover", false, true);
      });

      const features = map.getFeaturesAtPixel(e.pixel) as Feature[];
      if (features.length > 0) {
        features.forEach((feature) => feature.set("hover", true, true));
      }
      distrikterLayer.changed();
    };
    map.on("pointermove", pointer);
  }, [checked]);
  return (
    <button>
      <input
        type={"checkbox"}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      Show distrikter on map
      <div ref={overlayRef}>Clicked tilfuktsrom: </div>
    </button>
  );
}

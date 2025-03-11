import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Layer } from "ol/layer";
import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { FeatureLike } from "ol/Feature";
import { Fill, Stroke, Style, Circle } from "ol/style";

interface Properties {
  adresse: string;
  plasser: number;
}

type TypedFeature<T> = { getProperties(): T } & Feature;

const source = new VectorSource<TypedFeature<Properties>>({
  url: "/kws2100-arbeidskrav/geojson/tilfluktsrom.json",
  format: new GeoJSON(),
});

/**
const punkterStyle = new Style({
  image: new Circle({
    radius: 4,
    fill: new Fill({
      color: "black",
    }),
    stroke: new Stroke({
      color: "white",
      width: 1,
    }),
  }),
});
**/
const punkterStyle = (feature: TypedFeature<Properties>) => {
  const plasser = feature.getProperties().plasser;

  let color;

  if (plasser > 500) {
    color = "red";
  } else if (plasser > 250) {
    color = "orange";
  } else if (plasser > 1) {
    color = "green";
  }

  return new Style({
    image: new Circle({
      radius: 6,
      fill: new Fill({ color }),
      stroke: new Stroke({
        color: "white",
        width: 2,
      }),
    }),
  });
};

// @ts-ignore
const tilfluktsromLayer = new VectorLayer({ source, style: punkterStyle });
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function TilfluktsromLayerCheckbox({
  setLayers,
  map,
}: {
  setLayers: (value: (prevState: Layer[]) => Layer[]) => void;
  map: Map;
}) {
  const [checked, setChecked] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedtilfluktsrom, setSelectedtilfluktsrom] = useState<
    FeatureLike[]
  >([]);

  function handleClick(e: MapBrowserEvent<MouseEvent>) {
    const features = map.getFeaturesAtPixel(e.pixel);
    overlay.setPosition(e.coordinate);
    setSelectedtilfluktsrom(features);

    /**   fikk ikke denne til å fungere
    if (features.length > 0) {
      overlay.setPosition(e.coordinate); // Vis overlay
    } else {
      overlay.setPosition(undefined); // Skjul overlay
    }
**/
  }

  useEffect(() => {
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
  }, []);

  useEffect(() => {
    if (checked) {
      setLayers((old) => [...old, tilfluktsromLayer]);
      map.on("click", handleClick);
    } else {
      setLayers((old) => old.filter((l) => l !== tilfluktsromLayer));
    }
  }, [checked]);
  return (
    <button onClick={() => setChecked((b) => !b)}>
      <input
        type={"checkbox"}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      Show tilfluktsrom on map
      <div ref={overlayRef}>
        Tilfuktsrom trykket:{" "}
        {selectedtilfluktsrom.map((s) => s.getProperties().adresse).join(", ")}
        <br />
        Plasser:{" "}
        {selectedtilfluktsrom.map((s) => s.getProperties().plasser).join(", ")}
      </div>
    </button>
  );
}

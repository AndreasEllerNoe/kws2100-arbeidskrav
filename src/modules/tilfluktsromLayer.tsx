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
  url: "/kws2100-kartbaserte-websystemer/geojson/tilfluktsrom.json",
  format: new GeoJSON(),
});

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

const tilfluktsromLayer = new VectorLayer({ source, style: punkterStyle });
const overlay = new Overlay({
  positioning: "bottom-center",
});

function TilfluktsromOverlay({ features }: { features: Properties[] }) {
  let className = "overlay";
  if (features.length === 1) {
    const plasser = features[0].plasser;
    if (plasser < 200) {
      className += " red";
    } else if (plasser < 500) {
      className += " orange";
    } else {
      className += " green";
    }
  }
  if (features.length >= 2) {
    return (
      <div className={className}>
        <h3>{features.length} tilfluktsrom</h3>
        <ul>
          {features.slice(0, 5).map(({ adresse, plasser }) => (
            <li key={adresse}>
              <strong>Adresse:</strong> {adresse} <br />
              <strong>Plasser:</strong> {plasser} <br />
            </li>
          ))}
          {features.length > 5 && <li>...</li>}
        </ul>
      </div>
    );
  } else if (features.length === 1) {
    return (
      <div className={className}>
        <h3>Tilfluktsrom</h3>
        <p>
          <strong>Adresse:</strong> {features[0].adresse}
        </p>
        <p>
          <strong>Plasser:</strong> {features[0].plasser}
        </p>
      </div>
    );
  }
  return <div className={className}></div>;
}

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
    setSelectedtilfluktsrom(map.getFeaturesAtPixel(e.pixel));
    overlay.setPosition(e.coordinate);
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
      <input type={"checkbox"} checked={checked} />
      Show tilfluktsrom on map
      <div ref={overlayRef}>
        Clicked tilfuktsrom:{" "}
        {selectedtilfluktsrom.map((s) => s.getProperties().adresse).join(", ")}
      </div>
    </button>
  );
}

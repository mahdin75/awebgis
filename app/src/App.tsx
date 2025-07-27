/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import TileWMS from "ol/source/TileWMS";
import * as ort from "onnxruntime-web";
import "./App.css";
import "ol/ol.css";
import {
  AutoModelForSeq2SeqLM,
  AutoTokenizer,
  env,
} from "@huggingface/transformers";

ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

env.allowLocalModels = true;
env.allowRemoteModels = false;

// Utility functions
const COHERE_API_KEY = "";

// Map operation functions
function addMarkerToMap(map: Map, name: string, lon: number, lat: number) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
    name: name,
  });

  feature.setStyle(
    new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: "#e53935" }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
      }),
      text: new Text({
        font: "16px Vazir",
        text: name,
        offsetY: -18,
        fill: new Fill({ color: "red" }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    })
  );

  const source = map
    .getLayers()
    .getArray()
    .find((layer) => layer instanceof VectorLayer)
    ?.getSource();
  if (source) {
    source.addFeature(feature);
  }
}

function addWMSLayerToMap(map: Map, url: string) {
  const wmsLayer = new TileLayer({
    source: new TileWMS({
      url: url,
      params: { LAYERS: "", TILED: true },
      serverType: "geoserver",
      crossOrigin: "anonymous",
    }),
  });
  map.addLayer(wmsLayer);
}

async function executeFunctionOnMap(map: Map, funcCall: string) {
  try {
    if (funcCall.startsWith("ZoomIn(")) {
      const n = parseInt(funcCall.match(/ZoomIn\((\d+)\)/)?.[1] || "0");
      if (!isNaN(n)) {
        const view = map.getView();
        const currentZoom = view.getZoom() || 0;
        view.animate({
          zoom: currentZoom + n,
          duration: 250,
        });
      }
    } else if (funcCall.startsWith("ZoomOut(")) {
      const n = parseInt(funcCall.match(/ZoomOut\((\d+)\)/)?.[1] || "0");
      if (!isNaN(n)) {
        const view = map.getView();
        const currentZoom = view.getZoom() || 0;
        view.animate({
          zoom: currentZoom - n,
          duration: 250,
        });
      }
    } else if (funcCall.startsWith("Move(")) {
      const m = funcCall.match(/Move\(([-\d.]+),\s*([-\d.]+)\)/);
      if (m) {
        const lon = parseFloat(m[1]);
        const lat = parseFloat(m[2]);
        const view = map.getView();
        view.animate({
          center: fromLonLat([lon, lat]),
          duration: 500,
        });
      }
    } else if (funcCall.startsWith("MoveToExtent(")) {
      const m = funcCall.match(
        /MoveToExtent\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/
      );
      if (m) {
        const c1 = fromLonLat([parseFloat(m[2]), parseFloat(m[1])]);
        const c2 = fromLonLat([parseFloat(m[4]), parseFloat(m[3])]);
        map.getView().fit([c1[0], c1[1], c2[0], c2[1]], { duration: 1000 });
      }
    } else if (funcCall.startsWith("AddMarker(")) {
      const m = funcCall.match(
        /AddMarker\('([^']+)', \[([-\d.]+),\s*([-\d.]+)\]\)/
      );
      if (m) {
        const name = m[1],
          lon = parseFloat(m[2]),
          lat = parseFloat(m[3]);
        addMarkerToMap(map, name, lon, lat);
      }
    } else if (funcCall.startsWith("AddWMS(")) {
      const m = funcCall.match(/AddWMS\('([^']+)'\)/);
      if (m) {
        addWMSLayerToMap(map, m[1]);
      }
    }
  } catch (e) {
    console.error("Error executing function:", e);
  }
}

function constructPrompt(userQuery: string) {
  const examples = [
    ["I'd like to zoom out by 2 levels", "ZoomOut(2)"],
    [
      "Show the seismic activity map from WMS URL https://seismic.activity/wms",
      "AddWMS('https://seismic.activity/wms')",
    ],
    [
      "Load the point vector using point_zones_NY_kpn.kml!",
      "AddVector('point', 'point_zones_NY_kpn.kml')",
    ],
    [
      "Add marker 'University' at location -73.1888, 122.889!",
      "AddMarker('University', [-73.1888, 122.889])",
    ],
    [
      "Set map bounds from 62.2585, -120.3652 to 63.8833, -3.3906.",
      "MoveToExtent(62.2585, -120.3652, 63.8833, -3.3906)",
    ],
    [
      "Switch to the OpenMallMap layer for retail therapy.",
      "AddLayer('OpenMallMap')",
    ],
    ["Can we go to 40.5267, -79.4892?", "Move(40.5267, -79.4892)"],
    ["Draw a Line on the map!", "Draw('Line')"],
    [
      "Set the background color to ivory.",
      "Cartography('background', 'ivory', null)",
    ],
    ["Zoom in by 7 levels to focus on the details.", "ZoomIn(7)"],
  ];

  let prompt =
    "You are an expert system that translates user queries into geospatial function calls. Here are some examples:\n";
  for (const [inp, out] of examples) {
    prompt += `User: ${inp}\nFunction Call: ${out}\n`;
  }
  prompt += `User: ${userQuery}\nFunction Call:`;
  return prompt;
}

function extractFunctionCall(llmOutput: string) {
  const matches = [...llmOutput.matchAll(/Function Call:/g)];
  if (!matches.length) return llmOutput.trim();
  const last = matches[matches.length - 1];
  let funcCall = llmOutput.slice(last.index + "Function Call:".length).trim();
  funcCall = funcCall.split("\n")[0].trim();
  return funcCall;
}

export default function App() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modeSelectRef = useRef<HTMLSelectElement | null>(null);
  const modelSelectRef = useRef<HTMLSelectElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [vectorSource] = useState(new VectorSource());
  const [outputText, setOutputText] = useState<string>("");
  const [onnxModels, setOnnxModels] = useState<{
    [key: string]: ort.InferenceSession;
  }>({});

  useEffect(() => {
    if (mapRef.current && !map) {
      // Ensure there are no existing OpenLayers map instances
      if (mapRef.current.children.length > 0) {
        mapRef.current.innerHTML = "";
      }

      const tileLayer = new TileLayer({
        source: new OSM(),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      const olmap = new Map({
        target: mapRef.current,
        layers: [tileLayer, vectorLayer],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });

      setMap(olmap);
    }

    return () => {
      if (map) {
        map.setTarget("");
        map.dispose();
      }
    };
  }, [mapRef, map, vectorSource]);

  const handleModeChange = () => {
    if (modeSelectRef.current && modelSelectRef.current) {
      if (modeSelectRef.current.value === "offline-semi") {
        modelSelectRef.current.style.display = "inline-block";
      } else {
        modelSelectRef.current.style.display = "none";
      }
    }
  };

  const cohereCall = async (userQuery: string) => {
    const prompt = constructPrompt(userQuery);
    try {
      const response = await fetch("https://api.cohere.ai/v1/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "command-r-08-2024",
          prompt: prompt,
          max_tokens: 64,
          temperature: 0.0,
        }),
      });
      const data = await response.json();
      const text = data.generations?.[0]?.text || "";
      return extractFunctionCall(text);
    } catch (e) {
      console.error("Cohere API error:", e);
      return null;
    }
  };

  const loadOnnxModel = async (modelType: string) => {
    if (!onnxModels[modelType]) {
      try {
        const session = await ort.InferenceSession.create(
          `/models/${modelType}_function_classifier.onnx`
        );
        setOnnxModels((prev) => ({
          ...prev,
          [modelType]: session,
        }));
        return session;
      } catch (error) {
        console.error(`Error loading ${modelType} model:`, error);
        throw error;
      }
    }
    return onnxModels[modelType];
  };

  const handleSubmit = async () => {
    if (!map) return;

    const mode = modeSelectRef.current?.value;
    const input = inputRef.current?.value.trim();

    if (!input) {
      setOutputText("Please enter a query.");
      return;
    }

    setOutputText("Processing...");

    if (mode === "online") {
      // Online - Cohere mode
      const funcCall = await cohereCall(input);
      setOutputText(funcCall || "No function call returned.");
      if (funcCall) {
        await executeFunctionOnMap(map, funcCall);
      }
    } else if (mode === "offline-semi") {
      // Offline - SVM/RF mode
      const modelType = modelSelectRef.current?.value;
      try {
        if (!modelType) throw new Error("No model type selected");
        console.log(modelType);

        const model = await loadOnnxModel(modelType);

        // Create input tensor
        const tensor = new ort.Tensor("string", [input], [1, 1]);

        const results = await model.run({
          input: tensor,
        });

        const outputKey = Object.keys(results)[0];
        const prediction = results[outputKey].data[0];

        // Prompt for function arguments based on prediction
        let funcCall = null;
        switch (prediction) {
          case "ZoomIn":
          case "ZoomOut": {
            const n = prompt(`Enter number of levels to ${prediction}:`, "2");
            funcCall = n ? `${prediction}(${n})` : null;
            break;
          }
          case "Move": {
            const lon = prompt("Enter longitude:", "0");
            const lat = prompt("Enter latitude:", "0");
            funcCall = lon && lat ? `Move(${lon}, ${lat})` : null;
            break;
          }
          case "AddMarker": {
            const name = prompt("Enter marker name:", "My Marker");
            const lon = prompt("Enter longitude:", "0");
            const lat = prompt("Enter latitude:", "0");
            funcCall =
              name && lon && lat
                ? `AddMarker('${name}', [${lon}, ${lat}])`
                : null;
            break;
          }
          case "AddWMS": {
            const url = prompt("Enter WMS URL:", "https://example.com/wms");
            funcCall = url ? `AddWMS('${url}')` : null;
            break;
          }
        }

        setOutputText(funcCall || "Could not create function call.");
        if (funcCall) {
          await executeFunctionOnMap(map, funcCall);
        }
      } catch (e) {
        console.error("ONNX error:", e);
        setOutputText("Error processing with ONNX model.");
      }
    } else if (mode === "offline-full") {
      try {
        // !important
        // You can also download the model and put it inside the public/models/awebgis to reduce the first time latency
        // here we are loading the model from mahdin75/awebgis that downloads the model from huggingface.co
        const LOCALMODEL = "awebgis";

        const tokenizer = await AutoTokenizer.from_pretrained(LOCALMODEL, {
          progress_callback: (e) => {
            console.log(e);
          },
        });

        const encoded = await tokenizer(input);

        // the model will be downloaded then it will be run on the browswe uing wasm or webgpu based on the following configs
        const model = await AutoModelForSeq2SeqLM.from_pretrained(LOCALMODEL, {
          dtype: "fp32",
          device: "wasm",
        });

        const output = await model.generate({
          //@ts-expect-error
          input_ids: encoded.input_ids,
          attention_mask: encoded.attention_mask,
          use_cache: true,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded = tokenizer.decode((output as any)[0] as any, {
          skip_special_tokens: true,
        });

        setOutputText(decoded.trim());
        if (decoded.trim()) {
          await executeFunctionOnMap(map, decoded.trim());
        }
      } catch (e) {
        console.error("T5 model error:", e);
        setOutputText("Error processing with T5 model.");
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>AWebGIS App!</h1>
      </div>
      <div className="map-container">
        <div ref={mapRef} className="map" id="map" />
        {outputText && <div className="response-overlay">{outputText}</div>}
      </div>
      <div className="footer">
        <input
          ref={inputRef}
          type="text"
          placeholder="Write your command.."
          style={{ height: "36px" }}
        />
        <select
          ref={modeSelectRef}
          onChange={handleModeChange}
          defaultValue="online"
          style={{ height: "36px" }}
        >
          <option value="online">Online - Automated (Cohere)</option>
          <option value="offline-semi">
            Offline - Semi Automated (RF and SVM)
          </option>
          <option value="offline-full">
            Offline - Full (T5-small-finetuned)
          </option>
        </select>
        <select
          ref={modelSelectRef}
          style={{
            display: "none",
            marginLeft: "8px",
            height: "36px",
          }}
        >
          <option value="svm">SVM</option>
          <option value="rf">Random Forest</option>
        </select>

        <button onClick={handleSubmit}>Run</button>
      </div>
    </div>
  );
}

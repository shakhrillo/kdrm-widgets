import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type AllWidgetProps } from 'jimu-core';
import { Button, Card, CardBody, CardHeader, Checkbox, Loading } from 'jimu-ui';
import { useEffect } from 'react';

const crimeTypes = [
  { id: "crime-drug-narcotic", value: "DRUG/NARCOTIC", label: "Drug/Narcotic" },
  { id: "crime-burglary-theft", value: "BURGLARY/THEFT", label: "Burglary/Theft" },
  { id: "crime-non-criminal", value: "NON-CRIMINAL", label: "Non-Criminal" },
  { id: "crime-dui-drunkenness", value: "DUI/DRUNKENNESS", label: "DUI/Drunkenness" },
  { id: "crime-vehicle-theft", value: "VEHICLE THEFT", label: "Vehicle Theft" },
  { id: "crime-vandalism", value: "VANDALISM", label: "Vandalism" },
  { id: "crime-assault", value: "ASSAULT", label: "Assault" },
  { id: "crime-gambling", value: "GAMBLING", label: "Gambling" },
];

export default function Widget(props: AllWidgetProps<unknown>) {
  const [uniqueId] = React.useState(() => {
    return `crime-type-${Math.floor(Math.random() * 100000)}`;
  });
  const [loading, setLoading] = React.useState(false);
  const [checkedValues, setCheckedValues] = React.useState<string[]>([
    crimeTypes[0].value,
  ]);
  const [imageLayer, setImageLayer] = React.useState<any>(null);

  useEffect(() => {
    if (!imageLayer) return;

    imageLayer.on("refresh", () => {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    });
  }, [imageLayer]);
  
  const handleActiveViewChange = (jimuMapView: JimuMapView) => {
    if (!jimuMapView || !jimuMapView.view) return;
    const view = jimuMapView.view;

    loadArcGISJSAPIModules(["esri/layers/MapImageLayer"]).then(([MapImageLayer]) => {
      const queryParamValue = {"CategoryVar" : [crimeTypes[0].value]};
      const paramString = "[{\"1\": " + JSON.stringify(queryParamValue) + "}]"; 
      const SFCrimesLayer = new MapImageLayer({ 
        url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/SpatioTemporalAggregation/SFCrimes/MapServer" , 
        customParameters:{ 
          "layerParameterValues": paramString
        }
      });

      // Check if the layer is already added to the map
      const existingLayer = view.map.layers.find((layer) => layer.title === SFCrimesLayer.title);
      if (!existingLayer) {
        view.map.add(SFCrimesLayer);
        view.when(() => {
          setImageLayer(SFCrimesLayer);
        })
      } else {
        setImageLayer(existingLayer);
      }
    })

  };

  function updateResults() {
    const values = checkedValues.map((value) => {
      const crimeType = crimeTypes.find((crime) => crime.value === value);
      return crimeType ? crimeType.value : null;
    }).filter((value) => value !== null);
    
    if (values.length === 0) {
      alert("Please select at least one crime type.");
      return;
    }

    setLoading(true);

    const queryParamValue = {"CategoryVar" : values};
    const paramString = "[{\"1\": " + JSON.stringify(queryParamValue) + "}]";
    imageLayer.customParameters.layerParameterValues = paramString;
    imageLayer.refresh();
  }

  if (props.useMapWidgetIds?.length === 0 || !props.useMapWidgetIds) {
    return (
      <p>
        Map widget is not set. Please select a map widget in the widget's setting panel.
      </p>
    )
  }

  return <div className="widget-use-feature-layer">
    <JimuMapViewComponent onActiveViewChange={handleActiveViewChange} useMapWidgetId={props.useMapWidgetIds[0]} />

    <Card id="optionsDiv">
      <CardHeader>
        <h4>
          Crime Type Selection
        </h4>
      </CardHeader>
      <CardBody>
        {crimeTypes.map((crime) => (
          <label className="d-flex" htmlFor={`${uniqueId}_${crime.id}`} key={`${uniqueId}_${crime.id}`}>
            <Checkbox 
              name="crime-type"
              value={crime.value}
              id={`${uniqueId}_${crime.id}`}
              className="mr-2"
              defaultChecked={crime.id === crimeTypes[0].id}
              onChange={(e) => {
                setCheckedValues((prev) => {
                  if (e.target.checked) {
                    return [...prev, e.target.value];
                  } else {
                    return prev.filter((value) => value !== e.target.value);
                  }
                });
              }}
              disabled={loading}
            />
            {crime.label}
          </label>
        ))}
        <Button type="primary" disabled={loading} onClick={updateResults}>
          Update Aggregate Results
        </Button>
        {loading && <Loading />}
      </CardBody>
    </Card>
  </div>
}
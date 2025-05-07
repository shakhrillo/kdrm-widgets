import { React, type AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { Button } from 'jimu-ui';
import { useEffect, useState } from 'react';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
import type { IMConfig } from '../config';

defineCustomElements(window);

export default function Widget(props: AllWidgetProps<IMConfig>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [sketch, setSketch] = useState<__esri.Sketch>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!jimuMapView) return;

    loadArcGISJSAPIModules(['esri/widgets/Sketch', 'esri/layers/GraphicsLayer']).then(([Sketch, GraphicsLayer]) => {
      const graphicsLayer = new GraphicsLayer();
      jimuMapView.view.map.add(graphicsLayer);

      const newSketch = new Sketch({
        view: jimuMapView.view,
        layer: graphicsLayer,
        availableCreateTools: ['polygon'],
        creationMode: 'single',
        visible: false
      }) as __esri.Sketch;

      newSketch.on('create', (event) => {
        if (event.state === 'complete') {
          setIsDrawing(false);
        }
      });

      jimuMapView.view.ui.add(newSketch, 'top-right');
      setSketch(newSketch);
    });
  }, [jimuMapView]);

  const handleActiveViewChange = (view: JimuMapView) => {
    if (view) {
      setJimuMapView(view);
    }
  };

  const startDrawing = () => {
    if (!sketch) return;

    // Remove previously drawn graphics
    sketch.layer.removeAll();

    sketch.create('polygon')
      .then(() => {
        setIsDrawing(true);
      })
      .catch(err => {
        console.error('Polygon creation error:', err);
      });
  };

  const stopDrawing = () => {
    sketch?.cancel();
    setIsDrawing(false);
  };

  if (!props.useMapWidgetIds?.length) return <div>Please select a map widget</div>;

  return (
    <div>
      <JimuMapViewComponent
        onActiveViewChange={handleActiveViewChange}
        useMapWidgetId={props.useMapWidgetIds[0]}
      />
      {!jimuMapView ? (
        <div>Map is loading...</div>
      ) : (
        <div className="d-fle">
          <Button onClick={isDrawing ? stopDrawing : startDrawing} type={isDrawing ? 'danger' : 'primary'}>
            {isDrawing ? 'Click to stop drawing' : 'Click to draw a polygon'}
          </Button>
          <Button onClick={() => {sketch.layer.removeAll()}} type="secondary" className="ml-2 d-none">
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

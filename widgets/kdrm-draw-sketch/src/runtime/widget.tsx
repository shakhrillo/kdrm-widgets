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
        visible: false
      });

      jimuMapView.view.ui.add(newSketch, 'top-right');
      setSketch(newSketch);
    });
  }, [jimuMapView]);

  const handleActiveViewChange = (view: JimuMapView) => view && setJimuMapView(view);

  const startDrawing = () => {
    if (!sketch) return;
    sketch.create('polygon')
      .then(() => setIsDrawing(true))
      .catch(err => console.error('Polygon creation error:', err));
  };

  const stopDrawing = () => {
    sketch?.cancel();
    setIsDrawing(false);
  };

  if (!props.useMapWidgetIds?.length) return <div>Please select a map widget</div>;

  return (
    <div className="widget-demo jimu-widget m-2">
      <JimuMapViewComponent
        onActiveViewChange={handleActiveViewChange}
        useMapWidgetId={props.useMapWidgetIds[0]}
      />
      <p>This widget demonstrates how to use Maps components</p>
      {!jimuMapView ? (
        <div>Map is loading...</div>
      ) : (
        <>
          <p>Map View: {jimuMapView.view?.type}</p>
          <Button onClick={isDrawing ? stopDrawing : startDrawing}>
            {isDrawing ? 'Click to stop drawing' : 'Click to draw a polygon'}
          </Button>
        </>
      )}
    </div>
  );
}

import { React, type AllWidgetProps } from 'jimu-core'
import type { IMConfig } from '../config'
import { JimuMapViewComponent, loadArcGISJSAPIModules } from 'jimu-arcgis';
import type { JimuMapView } from 'jimu-arcgis';
import { Button } from 'jimu-ui';
import { useEffect } from 'react';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';

// Register custom elements
defineCustomElements(window);

export default function (props: AllWidgetProps<IMConfig>) {
    const [jimuMapView, setJimuMapView] = React.useState<JimuMapView>(null)
    const [sketch, setSketch] = React.useState<__esri.Sketch>(null)
    const [isActive, setIsActive] = React.useState(false)

    useEffect(() => {
        console.log('JimuMapView:', jimuMapView)
        if (!jimuMapView) {
            return
        }

        loadArcGISJSAPIModules([
            'esri/widgets/Sketch',
            'esri/layers/GraphicsLayer'
        ]).then(([Sketch, GraphicsLayer]) => {
            const graphicsLayer = new GraphicsLayer();
            jimuMapView.view.map.add(graphicsLayer);
          
            const newSketch = new Sketch({
                view: jimuMapView.view,
                layer: graphicsLayer,
                availableCreateTools: ["polygon"],
                visible: false
            });
          
            jimuMapView.view.ui.add(newSketch, 'top-right');

            setSketch(newSketch);
        });
    }, [jimuMapView])
    
    if (!props.useMapWidgetIds || props.useMapWidgetIds.length === 0) {
        return <div>Please select a map widget</div>
    }

    const onActiveViewChange = (activeView: JimuMapView) => {
        if (!activeView) {
          return
        }
        setJimuMapView(activeView)
    }

    const startDrawing = () => {
        console.log(jimuMapView, sketch)
        if (jimuMapView) {
            sketch?.create("polygon").then((event: any) => {
                setIsActive(true);
            }).catch((error) => {
                console.error("Error creating polygon:", error);
            });
        }
    }

    const stopDrawing = () => {
        if (jimuMapView) {
            sketch?.cancel();
            setIsActive(false);
        }
    }
    
    
    return (
        <div className="widget-demo jimu-widget m-2">
          <JimuMapViewComponent onActiveViewChange={onActiveViewChange} useMapWidgetId={props.useMapWidgetIds[0]}></JimuMapViewComponent>
          <p>This widget demos how to use Maps components</p>
          {
            !jimuMapView && <div>Map is loading...</div>
          }
          {
            <p>
                Map View: {jimuMapView?.view?.type}
            </p>
          }
                  {
                isActive ? (
                    <Button onClick={stopDrawing}>
                        <span>Click to stop drawing</span>
                    </Button>
                ) : (
                    <Button onClick={startDrawing}>
                        <span>Click to draw a polygon</span>
                    </Button>
                )
            }
        </div>
    )
}

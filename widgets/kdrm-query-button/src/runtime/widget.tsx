import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type IMDataSourceInfo, type DataSource, DataSourceStatus, type FeatureLayerQueryParams, type AllWidgetProps, DataSourceComponent, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core';
const { useState, useEffect, useRef } = React

export default function Widget(props: AllWidgetProps<unknown>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [polygone, setPolygone] = useState<__esri.Polygon>(null);

  useEffect(() => {
    console.log('polygone', polygone)
  }, [polygone, props.useDataSources]);

  useEffect(() => {
    const runQuery = async () => {
      const ds = DataSourceManager.getInstance().getDataSource(
        props.useDataSources[0].dataSourceId
      ) as FeatureLayerDataSource

      if (!ds) return;

      console.log('ds', ds);

      // Assuming you are working with the ArcGIS API for JavaScript

      loadArcGISJSAPIModules([
        // 'esri/rest/QueryTask',
        'esri/rest/query'
      ]).then(([
        // QueryTask,
        query
      ]) => {
  
        // Execute the query
        query.executeQueryJSON(ds.url, {
          geometry: polygone,
          spatialRelationship: "intersects",
          returnGeometry: false,
          outFields: ['*']
        }).then(function (results) {
          const features = results.features;
          console.log("Found features:", features);
        }).catch(function (error) {
          console.error("Query failed: ", error);
        });
      })
    }

    runQuery()
  }, [polygone, props.useDataSources]);

  const handleActiveViewChange = (view: JimuMapView) => {
    if (view) {
      setJimuMapView(view);
    }

    view.view.on('click', async (event) => {
      const hitResponse = await view.view.hitTest(event);

      if (hitResponse.results.length > 0) {
        const polygonGraphic: any = hitResponse.results.find((result: any) => result.graphic.geometry.type === 'polygon');
        if (polygonGraphic) {
          console.log('Polygon selected:', polygonGraphic);
          console.log('Geometry:', polygonGraphic.graphic.geometry);
          setPolygone(polygonGraphic.graphic.geometry);
        } else {
          console.log('No polygon selected.');
        }
      } else {
        console.log('No features hit.');
      }
    });
    
  };

  const isDsConfigured = () => {
    if (props.useDataSources &&
      props.useDataSources.length === 1 &&
      props.useDataSources[0].fields &&
      props.useDataSources[0].fields.length > 0) {
      return true
    }
    return false
  }

  const dataRender = (ds: DataSource, info: IMDataSourceInfo) => {
    const fields = props.useDataSources[0].fields
    return <>
      <div>Query state: {info.status}</div>

      <div className="record-list" style={{ width: '100%', marginTop: '20px', height: 'calc(100% - 80px)', overflow: 'auto' }}>
        {
          ds && ds.getStatus() === DataSourceStatus.Loaded
            ? ds.getRecords().map((r, i) => {
              return <div key={i} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                {
                  fields.map((f, j) => {
                    return <div key={j}>{f}: {r.getData()[f]}</div>
                  })
                }
              </div>
            })
            : null
        }
      </div>
    </>
  }

  if (!isDsConfigured()) {
    return <h3>
      This widget demonstrates how to use a feature layer as a data source.
      <br />
      Configure the data source.
    </h3>
  }

  return <div className="widget-use-feature-layer" style={{ width: '100%', height: '100%', maxHeight: '800px', overflow: 'auto' }}>
     <JimuMapViewComponent
        onActiveViewChange={handleActiveViewChange}
        useMapWidgetId={props.useMapWidgetIds[0]}
      />
      {!jimuMapView ? (
        <div>Map is loading...</div>
      ) : (
        <p>
          Done
        </p>
      )}
    <hr />
    <h3>
      This widget shows how to use a feature layer as a data source.
    </h3>

    <DataSourceComponent useDataSource={props.useDataSources[0]} widgetId={props.id} queryCount>
      {dataRender}
    </DataSourceComponent>
  </div>
}
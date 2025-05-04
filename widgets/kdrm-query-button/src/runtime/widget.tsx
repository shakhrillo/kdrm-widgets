import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type IMDataSourceInfo, type DataSource, DataSourceStatus, type FeatureLayerQueryParams, type AllWidgetProps, DataSourceComponent, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core';
const { useState, useEffect, useRef } = React

export default function Widget(props: AllWidgetProps<unknown>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [polygone, setPolygone] = useState<__esri.Polygon>(null);
  const [query, setQuery] = useState<FeatureLayerQueryParams>({
    where: `1=1`,
    outFields: ['objectid', 'facilityid'],
    pageSize: 2
  })
  const cityNameRef = useRef<HTMLInputElement>(null)

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

        // const polygonGeometry = new Polygon({
        //   spatialReference: SpatialReference.WebMercator,
        //   rings: [
        //     [[-118.821527, 34.1377], [-118.814497, 34.1377], [-118.814497, 34.1325], [-118.821527, 34.1325], [-118.821527, 34.1377]]
        //   ]
        // });
  
        // Define the query parameters
        // const query = new Query();
        // query.geometry = polygone;
        // query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;  // Check if features intersect the polygon
        // query.returnGeometry = true;  // Return the geometry of the results
        // query.outFields = ["*"];  // Specify the fields you want to return
  
        // Define the layer you want to query
        // const layerUrl = ds.url;
        // const queryTask = new QueryTask({
        //   url: layerUrl
        // });
  
        // Execute the query
        query.executeQueryJSON(ds.url, {
          // facilityid === 133402
          // where: "facilityid = '133402'",
          geometry: polygone,
          spatialRelationship: "intersects",
          returnGeometry: false,
          outFields: ['*'],
          // spatialRelationship: 'intersects',
        }).then(function (results) {
          const features = results.features;
          console.log("Found features:", features);
          // Do something with the results (e.g., display them on the map)
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

  useEffect(() => {
    queryFunc()
  }, [])

  const isDsConfigured = () => {
    console.log('__', props.useDataSources)
    if (props.useDataSources &&
      props.useDataSources.length === 1 &&
      props.useDataSources[0].fields &&
      props.useDataSources[0].fields.length > 0) {
      return true
    }
    return false
  }

  const queryFunc = () => {
    // if (!isDsConfigured()) {
    //   return
    // }
    // const fieldName = props.useDataSources[0].fields[0]
    // const w = cityNameRef.current && cityNameRef.current.value
    //   ? `${fieldName} like '%${cityNameRef.current.value}%'`
    //   : '1=1'
    // setQuery({
    //   where: w,
    //   outFields: [fieldName],
    //   pageSize: 10
    // })
  }

  const dataRender = (ds: DataSource, info: IMDataSourceInfo) => {
    //createOutputDs(ds);
    // const fName = props.useDataSources[0].fields[0]
    const fields = props.useDataSources[0].fields
    return <>
      <div>
        <input placeholder="Query value" ref={cityNameRef} />
        <button onClick={queryFunc}>Query</button>
      </div>
      <div>Query state: {info.status}</div>
      <div>Count: {ds.count}</div>

      <div className="record-list" style={{ width: '100%', marginTop: '20px', height: 'calc(100% - 80px)', overflow: 'auto' }}>
        {
          // ds && ds.getStatus() === DataSourceStatus.Loaded
          //   ? ds.getRecords().map((r, i) => {
          //     return <div key={i}>{r.getData()[fName]}</div>
          //   })
          //   : null

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


  // const createOutputDs = (useDs: DataSource) => {
  //   if (!props.outputDataSources) {
  //     return
  //   }
  //   const outputDsId = props.outputDataSources[0]
  //   const dsManager = DataSourceManager.getInstance()
  //   if (dsManager.getDataSource(outputDsId)) {
  //     if (dsManager.getDataSource(outputDsId).getDataSourceJson().originDataSources[0].dataSourceId !== useDs.id) {
  //       dsManager.destroyDataSource(outputDsId)
  //     }
  //   }
  //   dsManager.createDataSource(outputDsId).then(ods => {
  //     ods.setRecords(useDs.getRecords())
  //   })
  // }

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

    {query && <h4>Query: {JSON.stringify(query)}</h4>}

    <DataSourceComponent useDataSource={props.useDataSources[0]} widgetId={props.id} queryCount>
      {dataRender}
    </DataSourceComponent>
  </div>
}
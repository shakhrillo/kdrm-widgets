import FeatureLayer from 'esri/layers/FeatureLayer';
import FeatureTable from 'esri/widgets/FeatureTable';
import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type IMDataSourceInfo, type DataSource, DataSourceStatus, type AllWidgetProps, DataSourceComponent, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core';
const { useState, useEffect } = React

export default function Widget(props: AllWidgetProps<unknown>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [ds, setDs] = useState<DataSource>(null);
  const [featureTable, setFeatureTable] = useState<any>(null);
  const [polygone, setPolygone] = useState<__esri.Polygon>(null);
  const [query, setQuery] = useState<any>({
    where: '1=1'
  });

  useEffect(() => {
    if (!jimuMapView || !ds || featureTable) return;

    console.log('ds', ds)

    loadArcGISJSAPIModules([
      'esri/layers/FeatureLayer',
      'esri/widgets/FeatureTable',
      'esri/rest/query'
    ]).then(([
      FeatureLayer,
      FeatureTable,
      query
    ]) => {
      const tableFeatureLayer = new FeatureLayer({
        url: (ds as FeatureLayerDataSource).url,
        definitionExpression: "1=1", // Start with empty table
      });

      const featureTable = new FeatureTable({
        view: jimuMapView.view,
        layer: tableFeatureLayer,
        container: document.getElementById("table-container"),
        fieldConfigs: [
          { name: "objectid", label: "Object ID" },
          { name: "facilityid", label: "Facility ID" },
          { name: "installdate", label: "Install Date" },
          { name: "material", label: "Material" },
          { name: "diameter", label: "Diameter" },
          { name: "watertype", label: "Water Type" },
          { name: "enabled", label: "Enabled" },
          { name: "activeflag", label: "Active Flag" },
          { name: "ownedby", label: "Owned By" },
          { name: "maintby", label: "Maintained By" },
          { name: "lastupdate", label: "Last Update" },
        ],
      });
      
      setFeatureTable(tableFeatureLayer);
    });
  }, [jimuMapView, ds, featureTable]);

  useEffect(() => {
    const runQuery = async () => {
      const ds = DataSourceManager.getInstance().getDataSource(
        props.useDataSources[0].dataSourceId
      ) as FeatureLayerDataSource

      if (!ds) return;

      await loadArcGISJSAPIModules([
        'esri/layers/FeatureLayer',
        'esri/widgets/FeatureTable',
        'esri/rest/query'
      ]).then(([
        FeatureLayer,
        FeatureTable,
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
          const objectIds = features
                      .map((feature) => feature.attributes.objectid)
                      .join(",");
          featureTable.definitionExpression = `OBJECTID IN (${objectIds})`;
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
    console.log('props.useDataSources', props.useDataSources)
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
    {/* <hr />
    <h3>
      This widget shows how to use a feature layer as a data source.
    </h3> */}

    <DataSourceComponent useDataSource={props.useDataSources[0]} widgetId={props.id} queryCount query={query} onDataSourceCreated={(ds: DataSource) => {setDs(ds)}}>
      {/* {dataRender} */}
    </DataSourceComponent>

    <div id="table-container" style={{ width: '100%', height: '400px', overflow: 'auto' }}></div>
  </div>
}
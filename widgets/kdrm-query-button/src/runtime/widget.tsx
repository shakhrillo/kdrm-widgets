import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type DataSource, type AllWidgetProps, DataSourceComponent, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core';
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

    loadArcGISJSAPIModules([
      'esri/layers/FeatureLayer',
      'esri/widgets/FeatureTable'
    ]).then(([
      FeatureLayer,
      FeatureTable
    ]) => {
      const tableFeatureLayer = new FeatureLayer({
        url: (ds as FeatureLayerDataSource).url,
        definitionExpression: "1=1",
        outFields: ['*'],
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
    console.log('polygon', polygone)
    const runQuery = async () => {
      if (!polygone || !featureTable || !props.useDataSources || props.useDataSources.length === 0) return;
      
      const ds = DataSourceManager.getInstance().getDataSource(
        props.useDataSources[0].dataSourceId
      ) as FeatureLayerDataSource

      if (!ds) return;

      await loadArcGISJSAPIModules([
        'esri/rest/query'
      ]).then(([
        query
      ]) => {
        query.executeQueryJSON(ds.url, {
          geometry: polygone,
          spatialRelationship: "intersects",
          returnGeometry: false,
          outFields: ['*']
        }).then(function (results) {
          console.log("Query results: ", results);
          const features = results.features;
          const objectIds = features.map((feature) => feature.attributes.objectid).join(",");
          console.log('featureTable', featureTable)
          featureTable.definitionExpression = `OBJECTID IN (${objectIds})`;
        }).catch(function (error) {
          console.error("Query failed: ", error);
        });
      })
    }

    runQuery()
  }, [polygone, props.useDataSources, featureTable]);

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
    if (props.useDataSources &&
      props.useDataSources.length === 1 &&
      props.useDataSources[0].fields &&
      props.useDataSources[0].fields.length > 0) {
      return true
    }
    return false
  }

  if (!isDsConfigured()) {
    return <h3>
      This widget demonstrates how to use a feature layer as a data source.
      <br />
      Configure the data source.
    </h3>
  }

  return <div className="widget-use-feature-layer" style={{ width: '100%', height: '100%', maxHeight: '800px', overflow: 'auto' }}>
    {
      props.useMapWidgetIds?.length === 0 || !props.useMapWidgetIds ? (
        <div>Please select a map widget</div>
      ) : (
        <JimuMapViewComponent
            onActiveViewChange={handleActiveViewChange}
            useMapWidgetId={props.useMapWidgetIds[0]}
          />
      )
    }
      {/* {!jimuMapView ? (
        <div>Map is loading...</div>
      ) : (
        <p>
          Done
        </p>
      )}
    <hr /> */}

    <DataSourceComponent useDataSource={props.useDataSources[0]} widgetId={props.id} queryCount query={query} onDataSourceCreated={(ds: DataSource) => {setDs(ds)}}></DataSourceComponent>

    <div id="table-container" style={{ width: '100%', height: '400px', overflow: 'auto' }}></div>
  </div>
}
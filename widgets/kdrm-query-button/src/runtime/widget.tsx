import { JimuMapViewComponent, loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis';
import { React, type DataSource, type AllWidgetProps, DataSourceComponent, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core';
import { Button } from 'jimu-ui';
const { useState, useEffect } = React

export default function Widget(props: AllWidgetProps<unknown>) {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null);
  const [ds, setDs] = useState<DataSource>(null);
  const [featureTable, setFeatureTable] = useState<any>(null);
  const [polygone, setPolygone] = useState<__esri.Polygon>(null);
  
  useEffect(() => {
    if (!jimuMapView) return;

    jimuMapView.view.when(() => {
      jimuMapView.view.goTo({
        target: props?.center,
        zoom: props?.zoom
      });
    });
  }, [jimuMapView, props?.center, props?.zoom]);

  useEffect(() => {
    if (!jimuMapView || !ds || featureTable) return;

    loadArcGISJSAPIModules([
      'esri/layers/FeatureLayer',
      'esri/widgets/FeatureTable'
    ]).then(([
      FeatureLayer,
      FeatureTable
    ]) => {

      const url = (ds as FeatureLayerDataSource).url;

      const mapFeatureLayer = new FeatureLayer({
        url,
        minScale: 500000,
        maxScale: 1000,
        labelingInfo: [],
      });

      jimuMapView.view.map.add(mapFeatureLayer);

      const tableFeatureLayer = new FeatureLayer({
        url,
        definitionExpression: "1=1",
        outFields: ['*'],
      });

      const featureTable = new FeatureTable({
        view: jimuMapView.view,
        layer: tableFeatureLayer,
        container: document.getElementById("table-container")
      });

      setFeatureTable(tableFeatureLayer);
    });
  }, [jimuMapView, ds, featureTable, props, props.useDataSources, props.useMapWidgetIds]);

  const handleActiveViewChange = (view: JimuMapView) => {
    if (!view || !view.view) return;

    setJimuMapView(view);

    view.view.on('click', async (event) => {
      const hitResponse = await view.view.hitTest(event);
      try {
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
      } catch (error) {
        // No polygon selected skip
      }
    });
    
  };

  const makeQuery = async () => {
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
        const features = results.features;
        const objectIds = features.map((feature) => feature.attributes.objectid).join(",");
        featureTable.definitionExpression = `OBJECTID IN (${objectIds})`;
      }).catch(function (error) {
        console.error("Query failed: ", error);
      });
    })
  }

  const clearQuery = () => {
    if (!featureTable) return;
    featureTable.definitionExpression = "1=1";
    setPolygone(null);
  }

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

    <DataSourceComponent useDataSource={props.useDataSources[0]} widgetId={props.id} onDataSourceCreated={(ds: DataSource) => {setDs(ds)}}></DataSourceComponent>

    <div className="d-flex p-3">
      <Button onClick={makeQuery} disabled={!polygone}>
        Make a query
      </Button>
      <Button onClick={clearQuery} disabled={!featureTable} className="ml-2">
        Clear query
      </Button>
    </div>
    <div id="table-container" style={{ width: '100%', height: '400px', overflow: 'auto' }}></div>
  </div>
}
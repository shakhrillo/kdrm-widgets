import { React, Immutable, type IMFieldSchema, type UseDataSource, DataSourceTypes } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceSelector, FieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { IMConfig } from '../config'

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const onFieldChange = (allSelectedFields: IMFieldSchema[]) => {
    props.onSettingChange({
      id: props.id,
      useDataSources: [{ ...props.useDataSources[0], ...{ fields: allSelectedFields.map(f => f.jimuName) } }]
    })
  }

  const onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    props.onSettingChange({
      id: props.id,
      useDataSourcesEnabled
    })
  }

  const onDataSourceChange = (useDataSources: UseDataSource[]) => {
    props.onSettingChange({
      id: props.id,
      useDataSources: useDataSources
    })
  }

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  const onSelectCenter = (center: number[]) => {
    props.onSettingChange({
      id: props.id,
      center: center
    })
  }

  const onSelectZoom = (zoom: number) => {
    props.onSettingChange({
      id: props.id,
      zoom: zoom
    })
  }

  return <div className="use-feature-layer-setting p-2">
    <SettingSection
      className="map-selector-section"
      title={props.intl.formatMessage({
        id: 'mapWidgetLabel',
        defaultMessage: 'KDRM Draw Sketch'
      })}
    >
      <SettingRow>
        <MapWidgetSelector
          onSelect={onMapWidgetSelected}
          useMapWidgetIds={props.useMapWidgetIds}
        />
      </SettingRow>
    </SettingSection>
    <hr />
    <SettingSection
      className="map-selector-section"
      title={props.intl.formatMessage({
        id: 'centerLabel',
        defaultMessage: 'Center'
      })}
    >
      <SettingRow>
        <input
          type="text"
          value={props?.center?.join(',')}
          onChange={(e) => onSelectCenter(e.target.value.split(',').map(Number))}
        />
      </SettingRow>
    </SettingSection>
    <SettingSection
      className="map-selector-section"
      title={props.intl.formatMessage({
        id: 'zoomLabel',
        defaultMessage: 'Zoom'
      })}
    >
      <SettingRow>
        <input
          type="number"
          value={props.zoom}
          onChange={(e) => onSelectZoom(Number(e.target.value))}
        />
      </SettingRow>
    </SettingSection>
    <hr />
    <DataSourceSelector
      types={Immutable([DataSourceTypes.FeatureLayer])}
      useDataSources={props.useDataSources}
      useDataSourcesEnabled={props.useDataSourcesEnabled}
      onToggleUseDataEnabled={onToggleUseDataEnabled}
      onChange={onDataSourceChange}
      widgetId={props.id}
    />
    {
      props.useDataSources && props.useDataSources.length > 0 &&
      <FieldSelector
        isMultiple={true}
        useDataSources={props.useDataSources}
        onChange={onFieldChange}
        selectedFields={props.useDataSources[0].fields || Immutable([])}
      />
    }
  </div>
}
import { React, Immutable, type IMFieldSchema, type UseDataSource, DataSourceTypes } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { DataSourceSelector, FieldSelector } from 'jimu-ui/advanced/data-source-selector'

export default function Setting(props: AllWidgetSettingProps<unknown>) {
  const onFieldChange = (allSelectedFields: IMFieldSchema[]) => {
    console.log('__', allSelectedFields);
    console.log('allSelectedFields', [{ ...props.useDataSources[0], ...{ fields: allSelectedFields.map(f => f.jimuName) } }])
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
    console.log('__++', useDataSources)
    props.onSettingChange({
      id: props.id,
      useDataSources: useDataSources
    })
  }

  return <div className="use-feature-layer-setting p-2">
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
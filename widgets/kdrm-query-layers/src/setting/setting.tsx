import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { IMConfig } from '../config'

export default function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  return <div className="use-feature-layer-setting p-2">
    <SettingSection
      className="map-selector-section"
      title={props.intl.formatMessage({
        id: 'mapWidgetLabel',
        defaultMessage: 'Map Widget',
      })}
    >
      <SettingRow>
        <MapWidgetSelector
          onSelect={onMapWidgetSelected}
          useMapWidgetIds={props.useMapWidgetIds}
        />
      </SettingRow>
    </SettingSection>
  </div>
}
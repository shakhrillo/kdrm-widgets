import type { UseDataSource } from 'jimu-core'
import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
    useMapWidgetIds: string[]
    useDataSources: UseDataSource[]
    useDataSourcesEnabled: boolean
    center?: number[]
    zoom: number
}

export type IMConfig = ImmutableObject<Config>
import type { ImmutableObject } from 'seamless-immutable'

export interface Config {
    useMapWidgetIds: string[]
    newSheet: boolean
}

export type IMConfig = ImmutableObject<Config>
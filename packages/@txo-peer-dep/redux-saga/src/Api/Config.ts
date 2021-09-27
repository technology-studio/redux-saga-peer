/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2021-09-27T15:09:83+02:00
 * @Copyright: Technology Studio
**/

import { ConfigManager } from '@txo/config-manager'
import type { ServiceErrorException } from '@txo/service-prop'

export type Config = {
  onError: (error: Error | ServiceErrorException) => void,
}

export const configManager: ConfigManager<Config> = new ConfigManager<Config>({
  onError: () => undefined,
})

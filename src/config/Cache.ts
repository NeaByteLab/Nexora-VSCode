import { ConfigurationData } from '@interfaces/index'
import { ConfigManager } from '@config/index'
import { CacheManager } from '@integrator/index'
import { configSection } from '@constants/index'

/**
 * Initializes the configuration manager
 * @returns void
 */
export function updateConfigCache(): void {
  const config: ConfigurationData = ConfigManager.getConfig()
  CacheManager.set(`${configSection}.AppConfig`, config as unknown as Record<string, unknown>)
}

/**
 * Checks if the configuration has changed
 * @returns boolean
 */
export function isConfigChanged(): boolean {
  const config: ConfigurationData = ConfigManager.getConfig()
  const cachedConfig: ConfigurationData | undefined = CacheManager.get(
    `${configSection}.AppConfig`
  ) as ConfigurationData | undefined
  if (!cachedConfig) {
    return true
  }
  return (
    config.urlHost !== cachedConfig.urlHost ||
    config.databasePath !== cachedConfig.databasePath ||
    config.selectedModel !== cachedConfig.selectedModel
  )
}

/**
 * Default host URL for local service instance.
 * @description Default endpoint for local AI service connections
 */
export const defaultHost: string = 'http://localhost:11434'

/**
 * Default database file path for account storage.
 * @description Default file path for storing user account data
 */
export const defaultDatabasePath: string = '~/nexora.db'

/**
 * Default selected model name (empty until user selects).
 * @description Default value for the selected AI model name
 */
export const defaultSelectedModel: string = ''

/**
 * Extension configuration section name in settings.
 * @description Configuration section identifier for extension settings
 */
export const configSection: string = 'Nexora-AI'

/**
 * Host URL configuration setting key.
 * @description Configuration key for the service host URL setting
 */
export const configUrlHost: string = 'UrlHost'

/**
 * Database path configuration setting key.
 * @description Configuration key for the database file path setting
 */
export const configDatabasePath: string = 'DatabasePath'

/**
 * Selected model configuration setting key.
 * @description Configuration key for the selected model name setting
 */
export const configSelectedModel: string = 'SelectedModel'

/**
 * Command identifier for opening settings.
 * @description VSCode command identifier for opening the settings panel
 */
export const vscodeSettingsCommand: string = 'workbench.action.openSettings'

/**
 * Settings filter to show only extension settings.
 * @description Filter string to display only extension-specific settings
 */
export const vscodeSettingsFilter: string = configSection

/**
 * Text displayed on settings button in notifications.
 * @description Button text for opening settings from notification dialogs
 */
export const vscodeSettingsButton: string = 'Open Settings'

/**
 * Whitelist of file extensions for inline completion.
 * @description Array of file extensions that support inline code completion
 */
export const vscodeWhitelistExt: string[] = [
  'c',
  'cs',
  'cpp',
  'clj',
  'css',
  'dart',
  'dockerfile',
  'ex',
  'el',
  'go',
  'hs',
  'html',
  'java',
  'js',
  'jl',
  'ipynb',
  'kt',
  'lua',
  'm',
  'mm',
  'pl',
  'php',
  'ps1',
  'py',
  'r',
  'rb',
  'rs',
  'scala',
  'sh',
  'swift',
  'tex',
  'ts',
  'vue',
  'jsx',
  'tsx',
  'md',
  'txt'
]

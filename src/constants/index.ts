/**
 * Default host URL for local service instance
 */
export const defaultHost: string = 'http://localhost:11434'

/**
 * Default database file path for account storage
 */
export const defaultDatabasePath: string = '~/nexora.db'

/**
 * Default selected model name (empty until user selects)
 */
export const defaultSelectedModel: string = ''

/**
 * Extension configuration section name in settings
 */
export const configSection: string = 'Nexora-AI'

/**
 * Host URL configuration setting key
 */
export const configUrlHost: string = 'UrlHost'

/**
 * Database path configuration setting key
 */
export const configDatabasePath: string = 'DatabasePath'

/**
 * Selected model configuration setting key
 */
export const configSelectedModel: string = 'SelectedModel'

/**
 * Command identifier for opening settings
 */
export const vscodeSettingsCommand: string = 'workbench.action.openSettings'

/**
 * Settings filter to show only extension settings
 */
export const vscodeSettingsFilter: string = configSection

/**
 * Text displayed on settings button in notifications
 */
export const vscodeSettingsButton: string = 'Open Settings'

/**
 * Whitelist of file extensions for inline completion
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

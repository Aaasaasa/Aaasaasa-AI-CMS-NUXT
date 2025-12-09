// eslint.config.ci.mjs
import baseConfig from './eslint.config.mjs'

export default [
  ...baseConfig,
  {
    rules: {
      'no-console': 'off',
      'no-debugger': 'error'
    }
  }
]

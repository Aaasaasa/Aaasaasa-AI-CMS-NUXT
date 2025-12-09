declare module '#imports' {
  export * from 'nuxt/app'
  // export * from 'nuxt/schema'
  const _defaultImportsAdmin: Record<string, any>
  export default _defaultImportsAdmin
}

declare module '#app' {
  export * from 'nuxt/app'
  const _defaultAppAdmin: Record<string, any>
  export default _defaultAppAdmin
}

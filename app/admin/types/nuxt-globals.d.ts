// types/nuxt-globals.d.ts

import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'
import type { NuxtConfig } from '@nuxt/schema'
import type { Plugin } from '#app'
import type { DefineComponent } from 'vue'

declare global {
  // ───────────────────────────────
  // Nuxt / Nitro server helpers
  // ───────────────────────────────
  const defineEventHandler: <T = any>(
    handler: EventHandler<EventHandlerRequest, T>
  ) => EventHandler<EventHandlerRequest, T>

  const getQuery: (event: H3Event) => Record<string, any>
  const readBody: <T = any>(event: H3Event) => Promise<T>
  const getRouterParams: (event: H3Event) => Record<string, any>

  // ───────────────────────────────
  // Nuxt config & plugins
  // ───────────────────────────────
  const defineNuxtConfig: (config: NuxtConfig) => NuxtConfig
  const defineNuxtPlugin: (plugin: Plugin) => Plugin

  // ───────────────────────────────
  // Vue / Components helpers
  // ───────────────────────────────
  const defineComponent: typeof DefineComponent

  // ───────────────────────────────
  // Pinia helpers (ако користиш Pinia store)
  // ───────────────────────────────
  const defineStore: <Id extends string, S, G, A>(
    id: Id,
    options: {
      state: () => S
      getters?: G & ThisType<Readonly<S> & G & A>
      actions?: A & ThisType<S & A & G>
    }
  ) => any
}

export {}

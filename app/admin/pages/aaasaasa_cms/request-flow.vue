<template>
  <div class="container mx-auto px-4 py-8">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Nuxt 4 Request Flow</h1>
      <p class="text-xl text-gray-600">
        How requests travel through layouts, middleware, and components
      </p>
    </header>

    <div class="bg-white p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-2xl font-semibold mb-4">Request Flow Diagram</h2>
      <div class="flow-diagram">
        <div class="mermaid">
          flowchart TD A[Request Received] --> B[Middleware Processing] B --> C[Route Validation] C
          --> D{Layout Selection} D --> E[app.vue] E --> F[Layout Component] F --> G[Page Component]
          G --> H[Component Rendering] H --> I[Client/Server Components] I --> J[Response Sent]
          subgraph Middleware B end subgraph Layout D F end subgraph Page G end subgraph Components
          H I end style A fill:#dcfce7 style B fill:#e9d5ff style D fill:#fef3c7 style F
          fill:#bbf7d0 style G fill:#bfdbfe style I fill:#fed7aa style J fill:#fbcfe8
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-nuxt">1. app.vue - The Root Component</h2>
        <p class="mb-4">
          Every request starts at <code>app.vue</code>, which serves as the root component of your
          Nuxt application.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Initializes the Vue application</li>
          <li>Provides context to all components</li>
          <li>Can contain global UI elements</li>
          <li>Wraps all page content</li>
          <li>Rarely bypassed - usually always executed</li>
        </ul>
        <div class="code-block mt-4">
          <pre><code>&lt;template&gt;
    &lt;div id="app"&gt;
      &lt;NuxtLayout&gt;
        &lt;NuxtPage /&gt;
      &lt;/NuxtLayout&gt;
    &lt;/div&gt;
  &lt;/template&gt;</code></pre>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-nuxt">2. Layout Selection</h2>
        <p class="mb-4">
          Nuxt automatically selects a layout based on route metadata or default conventions.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Uses <code>layouts/default.vue</code> by default</li>
          <li>Can use other layouts via page metadata</li>
          <li>Layouts wrap page content</li>
          <li>Provide consistent structure across pages</li>
        </ul>
        <div class="route-example mt-4">
          <p>Using a custom layout:</p>
          <pre><code>// pages/dashboard.vue
  definePageMeta({
    layout: 'admin'
  })</code></pre>
          <p class="mt-2">This would use <code>layouts/admin.vue</code></p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-middleware">3. Middleware Execution</h2>
        <p class="mb-4">
          Middleware runs before navigation completes and can redirect or modify requests.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Runs on client and server</li>
          <li>Can be global, named, or inline</li>
          <li>Used for authentication, logging, etc.</li>
          <li>Can redirect requests</li>
        </ul>
        <div class="code-block mt-4">
          <pre><code>// middleware/auth.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuth()
    if (!auth.isAuthenticated) {
      return navigateTo('/login')
    }
  })</code></pre>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-nuxt">4. Page Rendering</h2>
        <p class="mb-4">
          The page component corresponding to the route is rendered within the layout.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>File-based routing: <code>pages/index.vue</code> → <code>/</code></li>
          <li>
            Dynamic routes: <code>pages/users/[id].vue</code> →
            <code>/users/123</code>
          </li>
          <li>Nested routes with folders</li>
          <li>Can use route parameters</li>
        </ul>
        <div class="code-block mt-4">
          <pre><code>// pages/users/[id].vue
  &lt;template&gt;
    &lt;div&gt;
      &lt;h1&gt;User {{ $route.params.id }}&lt;/h1&gt;
    &lt;/div&gt;
  &lt;/template&gt;</code></pre>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-client">5. Client-Side Components</h2>
        <p class="mb-4">
          Components with <code>.client.vue</code> suffix render only on the client.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Use for browser-specific functionality</li>
          <li>Interactive components</li>
          <li>Components using window/DOM APIs</li>
          <li>Rendered only after hydration</li>
        </ul>
        <div class="code-block mt-4">
          <pre><code>// components/Chart.client.vue
  &lt;template&gt;
    &lt;div&gt;
      &lt;!-- Client-only charting component --&gt;
    &lt;/div&gt;
  &lt;/template&gt;

  &lt;script setup&gt;
  // This code runs only on the client
  const canvas = ref(null)
  onMounted(() => {
    // DOM-related code
  })
  &lt;/script&gt;</code></pre>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg step-card">
        <h2 class="text-2xl font-semibold mb-4 text-server">6. Server-Side Components</h2>
        <p class="mb-4">
          Components with <code>.server.vue</code> suffix render only on the server.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Optimized for server rendering</li>
          <li>Can use server-only APIs</li>
          <li>No client-side JavaScript bundle</li>
          <li>Good for static content</li>
        </ul>
        <div class="code-block mt-4">
          <pre><code>// components/UserInfo.server.vue
  &lt;template&gt;
    &lt;div&gt;
      &lt;!-- Server-rendered user info --&gt;
    &lt;/div&gt;
  &lt;/template&gt;

  &lt;script setup&gt;
  // This code runs only on the server
  const { data } = await useFetch('/api/user')
  &lt;/script&gt;</code></pre>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-2xl font-semibold mb-4">Complete Request Flow Example</h2>

      <div class="route-example mb-6">
        <p>URL: <code>https://example.com/dashboard</code></p>
      </div>

      <ol class="list-decimal pl-5 space-y-6">
        <li class="p-4 bg-blue-50 rounded-lg">
          <h3 class="text-lg font-semibold">Request received by the server</h3>
          <p>Nuxt server handles the incoming request for <code>/dashboard</code></p>
        </li>

        <li class="p-4 bg-purple-50 rounded-lg">
          <h3 class="text-lg font-semibold">Global middleware execution</h3>
          <p>Any global middleware in <code>middleware/*.global.ts</code> runs first</p>
          <div class="code-block mt-2">
            <pre><code>// middleware/auth.global.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    // Check authentication status
  })</code></pre>
          </div>
        </li>

        <li class="p-4 bg-purple-50 rounded-lg">
          <h3 class="text-lg font-semibold">Route-specific middleware</h3>
          <p>Middleware defined in the page runs next</p>
          <div class="code-block mt-2">
            <pre><code>// pages/dashboard.vue
  definePageMeta({
    middleware: ['auth']
  })</code></pre>
          </div>
        </li>

        <li class="p-4 bg-yellow-50 rounded-lg">
          <h3 class="text-lg font-semibold">Layout selection</h3>
          <p>Based on page metadata, Nuxt selects the appropriate layout</p>
          <div class="code-block mt-2">
            <pre><code>// pages/dashboard.vue
  definePageMeta({
    layout: 'admin'
    // Uses layouts/admin.vue
  })</code></pre>
          </div>
        </li>

        <li class="p-4 bg-green-50 rounded-lg">
          <h3 class="text-lg font-semibold">Page component rendering</h3>
          <p>The <code>pages/dashboard.vue</code> component is rendered inside the layout</p>
        </li>

        <li class="p-4 bg-orange-50 rounded-lg">
          <h3 class="text-lg font-semibold">Component rendering</h3>
          <p>All components within the page are rendered:</p>
          <ul class="list-disc pl-5 mt-2">
            <li>Regular components (.vue)</li>
            <li>Server components (.server.vue)</li>
            <li>Client components (.client.vue)</li>
          </ul>
        </li>

        <li class="p-4 bg-pink-50 rounded-lg">
          <h3 class="text-lg font-semibold">Response sent to client</h3>
          <p>The fully rendered HTML is sent to the client</p>
        </li>

        <li class="p-4 bg-indigo-50 rounded-lg">
          <h3 class="text-lg font-semibold">Client-side hydration</h3>
          <p>Vue takes over on the client and hydrates the application</p>
        </li>
      </ol>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4">When to Use Middleware</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 bg-green-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Authentication Guard</h3>
          <p>Redirect unauthenticated users to login page</p>
          <div class="code-block mt-2">
            <pre><code>// middleware/auth.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    const { status } = useAuth()
    if (status.value !== 'authenticated') {
      return navigateTo('/login')
    }
  })</code></pre>
          </div>
        </div>

        <div class="p-4 bg-blue-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Logging</h3>
          <p>Track page views and user actions</p>
          <div class="code-block mt-2">
            <pre><code>// middleware/analytics.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    // Send analytics data
    useTrackPageView(to.path)
  })</code></pre>
          </div>
        </div>

        <div class="p-4 bg-yellow-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Feature Flags</h3>
          <p>Control access to features based on conditions</p>
          <div class="code-block mt-2">
            <pre><code>// middleware/feature.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    const flags = useFeatureFlags()
    if (!flags.value.newDashboard) {
      return navigateTo('/old-dashboard')
    }
  })</code></pre>
          </div>
        </div>

        <div class="p-4 bg-purple-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">Input Validation</h3>
          <p>Validate route parameters before processing</p>
          <div class="code-block mt-2">
            <pre><code>// middleware/validate.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    const id = Number(to.params.id)
    if (isNaN(id)) {
      return abortNavigation('Invalid ID')
    }
  })</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.flow-diagram {
  width: 100%;
  height: 500px;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  margin: 1rem 0;
  overflow: auto;
}
.code-block {
  background-color: #1e293b;
  color: #f1f5f9;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  overflow-x: auto;
  font-family: monospace;
}
.step-card {
  transition: all 0.3s ease;
}
.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
.route-example {
  background-color: #e0e7ff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  font-family: monospace;
}
</style>

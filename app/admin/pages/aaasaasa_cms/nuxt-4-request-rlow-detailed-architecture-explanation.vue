<template>
  <div class="container mx-auto px-4 py-8 max-w-5xl">
    <header class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-6 text-nuxt">
        Nuxt 4 Request Flow Architecture
      </h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto">
        A comprehensive guide to the request processing pipeline in Nuxt 4 applications with
        detailed folder and file explanations
      </p>
    </header>

    <article class="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-16">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Request Flow Visualization
      </h2>

      <div class="architecture-canvas">
        <div class="mermaid">
          flowchart TD A[🌐 Incoming Request] --> B{Request Type?} B --> C[Static Asset] B -->
          D[Dynamic Request] C --> E[Return from<br />public/ directory] subgraph DynamicRequest
          [Dynamic Request Processing] D --> F[Middleware Processing] F --> G[Route Validation] G
          --> H{Layout Selection} H --> I[Default Layout<br />layouts/default.vue] H --> J[Custom
          Layout<br />e.g. layouts/admin.vue] I --> K[app.vue] J --> K K --> L[Page Component] L -->
          M[Component Rendering] M --> N[Server Components<br />*.server.vue] M --> O[Client
          Components<br />*.client.vue] M --> P[Universal Components<br />*.vue] end N -->
          Q[Response Generation] O --> Q P --> Q E --> Q Q --> R[📨 Response Sent] style A
          fill:#dcfce7,stroke:#00DC82,stroke-width:3px style C fill:#e0e7ff,stroke:#6366f1 style D
          fill:#fef3c7,stroke:#f59e0b style E fill:#ddd6fe,stroke:#8b5cf6 style F
          fill:#fecaca,stroke:#ef4444 style G fill:#bbf7d0,stroke:#22c55e style H
          fill:#fed7aa,stroke:#ea580c style I fill:#bfdbfe,stroke:#3b82f6 style J
          fill:#fbcfe8,stroke:#ec4899 style K fill:#c7d2fe,stroke:#6366f1 style L
          fill:#a7f3d0,stroke:#10b981 style M fill:#fde68a,stroke:#f59e0b style N
          fill:#fed7aa,stroke:#f97316 style O fill:#bfdbfe,stroke:#38bdf8 style P
          fill:#ddd6fe,stroke:#8b5cf6 style Q fill:#dcfce7,stroke:#00DC82 style R
          fill:#dcfce7,stroke:#00DC82,stroke-width:3px
        </div>
      </div>

      <div class="note">
        <p class="font-semibold">Note:</p>
        <p>
          The request flow differs based on whether the request is for a static asset or requires
          server processing. Static assets are served directly from the public/ directory, while
          dynamic requests go through the full processing pipeline.
        </p>
      </div>
    </article>

    <article class="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-16">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Folder Structure & File Roles
      </h2>

      <div class="file-structure">
        <pre>
nuxt-app/
├── app.vue                          # Root component (always executed)
├── layouts/                         # Layout components
│   ├── default.vue                  # Default layout (used when no layout specified)
│   └── admin.vue                    # Custom layout (e.g. for admin pages)
├── pages/                           # Page components (file-based routing)
│   ├── index.vue                    # Homepage (/ route)
│   ├── about.vue                    # About page (/about route)
│   ├── dashboard/                   # Route group
│   │   └── index.vue                # Dashboard page (/dashboard route)
│   └── users/
│       ├── index.vue                # Users listing (/users route)
│       └── [id].vue                 # Dynamic user page (/users/123 route)
├── middleware/                      # Route middleware
│   ├── auth.global.ts               # Global middleware (runs on every request)
│   └── admin.ts                     # Named middleware (runs when specified)
├── components/                      # Reusable components
│   ├── ui/                          # UI components
│   │   ├── Button.vue               # Regular component
│   │   ├── Modal.client.vue         # Client-side only component
│   │   └── DataTable.server.vue     # Server-side only component
│   └── layout/                      # Layout-specific components
│       └── Header.vue               # Header component
├── public/                          # Static assets
│   └── favicon.ico                  # Served directly at /favicon.ico
└── nuxt.config.ts                   # Nuxt configuration file</pre
        >
      </div>
    </article>

    <article class="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-16">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Detailed Process Explanation
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="step-card bg-blue-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-blue-800">1. Request Reception</h3>
          <p>
            When a request arrives at the Nuxt server, it first determines if it's for a static
            asset or requires dynamic processing.
          </p>
          <div class="code-block mt-4">
            <pre>
// Static assets are served directly from public/
// Example: /favicon.ico → public/favicon.ico
// Dynamic requests proceed through the full pipeline</pre
            >
          </div>
        </div>

        <div class="step-card bg-purple-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-purple-800">2. Middleware Processing</h3>
          <p>
            Middleware are functions that run before navigation. They can modify the request,
            redirect, or cancel navigation.
          </p>
          <div class="code-block mt-4">
            <pre>
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser();
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});</pre
            >
          </div>
        </div>

        <div class="step-card bg-green-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-green-800">3. Route Validation</h3>
          <p>Nuxt validates route parameters and can abort navigation if validation fails.</p>
          <div class="code-block mt-4">
            <pre>
// pages/users/[id].vue
definePageMeta({
  validate: async (route) => {
    // Check if id is a number
    return /^\d+$/.test(route.params.id);
  }
});</pre
            >
          </div>
        </div>

        <div class="step-card bg-pink-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-pink-800">4. Layout Selection</h3>
          <p>Based on page metadata, Nuxt selects the appropriate layout component.</p>
          <div class="code-block mt-4">
            <pre>
// pages/dashboard.vue
definePageMeta({
  layout: 'admin' // Uses layouts/admin.vue
});

// If no layout specified, uses layouts/default.vue</pre
            >
          </div>
        </div>

        <div class="step-card bg-indigo-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-indigo-800">5. app.vue Execution</h3>
          <p>The root app.vue component is always executed and wraps all content.</p>
          <div class="code-block mt-4">
            <pre>
// app.vue
&lt;template&gt;
  &lt;div&gt;
    &lt;NuxtLayout&gt;
      &lt;NuxtPage /&gt;
    &lt;/NuxtLayout&gt;
  &lt;/div&gt;
&lt;/template&gt;</pre
            >
          </div>
        </div>

        <div class="step-card bg-teal-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-teal-800">6. Page Component Rendering</h3>
          <p>The appropriate page component based on the URL route is rendered.</p>
          <div class="code-block mt-4">
            <pre>
// pages/users/[id].vue
&lt;template&gt;
  &lt;div&gt;
    &lt;h1&gt;User {{ $route.params.id }}&lt;/h1&gt;
    &lt;UserProfile :id="$route.params.id" /&gt;
  &lt;/div&gt;
&lt;/template&gt;</pre
            >
          </div>
        </div>

        <div class="step-card bg-amber-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-amber-800">7. Component Rendering</h3>
          <p>Components within the page are rendered with environment-specific logic.</p>
          <div class="code-block mt-4">
            <pre>
// components/DataTable.server.vue
&lt;template&gt;
  &lt;!-- Server-rendered table --&gt;
&lt;/template&gt;

&lt;script setup&gt;
// This code runs only on the server
const { data } = await useFetch('/api/data');
&lt;/script&gt;</pre
            >
          </div>
        </div>

        <div class="step-card bg-emerald-50 p-6">
          <h3 class="text-xl font-semibold mb-4 text-emerald-800">8. Response Generation</h3>
          <p>
            Nuxt generates the final HTML response based on the rendering mode (SSR, SPA, or
            Static).
          </p>
          <div class="code-block mt-4">
            <pre>
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true, // Server-side rendering
  // or
  ssr: false // SPA mode
});</pre
            >
          </div>
        </div>
      </div>
    </article>

    <article class="bg-white rounded-xl shadow-xl p-6 md:p-8">
      <h2 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        Customizing the Flow for Different URIs
      </h2>

      <div class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-gray-700">Using Different Layouts</h3>
          <p>
            To use different layouts for different URIs, specify the layout in the page component:
          </p>
          <div class="code-block">
            <pre>
// pages/admin/dashboard.vue
definePageMeta({
  layout: 'admin' // Uses layouts/admin.vue
});

// pages/blog/[slug].vue
definePageMeta({
  layout: 'blog' // Uses layouts/blog.vue
});</pre
            >
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-gray-700">Route-Specific Middleware</h3>
          <p>Apply middleware to specific routes using page metadata:</p>
          <div class="code-block">
            <pre>
// pages/admin/users.vue
definePageMeta({
  middleware: ['auth', 'admin'] // Runs auth then admin middleware
});

// middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser();
  if (user.value.role !== 'admin') {
    return abortNavigation('Admin access required');
  }
});</pre
            >
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-gray-700">Dynamic Route Handling</h3>
          <p>Handle dynamic parameters in routes using square bracket syntax:</p>
          <div class="code-block">
            <pre>
// File structure:
// pages/
//   users/
//     [id].vue      → /users/123
//     [id]/
//       edit.vue    → /users/123/edit
//   categories/
//     [[slug]].vue  → /categories OR /categories/books
//   products/
//     [...slug].vue → /products/books/fiction/123

// pages/users/[id].vue
const route = useRoute();
const userId = route.params.id; // Extract dynamic parameter</pre
            >
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-gray-700">Environment-Specific Components</h3>
          <p>Use different components based on rendering environment:</p>
          <div class="code-block">
            <pre>
// Component structure:
// components/
//   Chart.vue         # Universal component (SSR + client)
//   Chart.client.vue  # Client-only component
//   Data.server.vue   # Server-only component

// In your page:
&lt;template&gt;
  &lt;div&gt;
    &lt;Data.server /&gt;    &lt;!-- Renders only on server --&gt;
    &lt;Chart.client /&gt;   &lt;!-- Renders only on client --&gt;
    &lt;RegularComponent /&gt; &lt;!-- Renders on both --&gt;
  &lt;/div&gt;
&lt;/template&gt;</pre
            >
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

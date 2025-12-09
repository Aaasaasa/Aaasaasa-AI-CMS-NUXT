<template>
  <div class="container mx-auto p-6">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold mb-4">
        Nuxt 4 + Tailwind CSS + Prisma ORM Architecture & Development Process
      </h1>
      <p class="text-xl text-gray-600">
        Comprehensive overview of the runtime architecture and development process
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <div class="bg-white p-6 rounded-lg shadow-lg layer">
        <h2 class="text-2xl font-semibold mb-4 text-nuxt">Nuxt 4 Architecture</h2>
        <p class="mb-4">
          Nuxt 4 is a Vue.js-based framework that provides a robust architecture for building modern
          web applications.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Universal Vue.js applications (SSR & SPA)</li>
          <li>File-based routing system</li>
          <li>Auto-imports for components and composables</li>
          <li>Server API routes with Nitro server</li>
          <li>Middleware support for route handling</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg layer">
        <h2 class="text-2xl font-semibold mb-4 text-tailwind">Tailwind CSS Integration</h2>
        <p class="mb-4">
          Tailwind CSS is a utility-first CSS framework that works seamlessly with Nuxt.
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Utility-first styling approach</li>
          <li>JIT (Just-In-Time) mode for optimized builds</li>
          <li>Component-friendly with @apply directive</li>
          <li>Customizable design system</li>
          <li>Responsive design utilities</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg layer">
        <h2 class="text-2xl font-semibold mb-4 text-prisma">Prisma ORM</h2>
        <p class="mb-4">Prisma is a next-generation ORM for Node.js and TypeScript.</p>
        <ul class="list-disc pl-5 space-y-2">
          <li>Type-safe database client</li>
          <li>Database migrations</li>
          <li>Declarative data model</li>
          <li>Connection pooling and management</li>
          <li>Relations and query optimization</li>
        </ul>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg layer">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Development Process</h2>
        <p class="mb-4">The typical workflow when working with this stack:</p>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Define data model in Prisma schema</li>
          <li>Run migrations to update database</li>
          <li>Create API endpoints in server/ directory</li>
          <li>Build Vue components with Tailwind styling</li>
          <li>Test application in development mode</li>
          <li>Deploy to production environment</li>
        </ol>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-2xl font-semibold mb-4">Architecture Diagram</h2>
      <div class="architecture-diagram">
        <div class="mermaid">
          graph TB subgraph Client [Client Side] UI[UI Components<br />Vue.js + Tailwind] SP[State
          Management<br />Pinia] R[Routing<br />Vue Router] end subgraph Server [Server Side]
          NS[Nuxt Server<br />Nitro] API[API Routes] PC[Prisma Client] end subgraph Database
          DB[(Database)] end UI --> SP UI --> R UI -- HTTP Requests --> API API --> PC PC --> DB NS
          --> API style UI fill:#dcfce7 style API fill:#dbeafe style PC fill:#ffedd5 style DB
          fill:#fae8ff
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-2xl font-semibold mb-4">Project Structure</h2>
      <div class="code-block">
        <pre><code>nuxt-app/
├── components/          # Vue components
├── composables/         # Vue composables
├── layouts/             # Layout components
├── pages/               # Application views and routes
├── server/
│   ├── api/             # API routes
│   ├── middleware/      # Server middleware
│   └── models/          # Data models (Prisma)
├── utils/               # Utility functions
├── assets/
│   └── css/             # Global styles
├── prisma/
│   └── schema.prisma    # Database schema
├── nuxt.config.ts       # Nuxt configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json</code></pre>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg mb-12">
      <h2 class="text-2xl font-semibold mb-4">Example: API Route with Prisma</h2>
      <div class="code-block">
        <pre><code>// server/api/users/[id].get.ts
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID should be an integer',
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})</code></pre>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-semibold mb-4">Development Process Steps</h2>
      <div class="space-y-6">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">1. Project Setup</h3>
          <p class="mb-2">Initialize a new Nuxt project and install dependencies:</p>
          <div class="code-block">
            <code
              >npx nuxi@latest init my-app && cd my-app<br />npm install -D tailwindcss postcss
              autoprefixer<br />npm install @prisma/client<br />npm install -D prisma</code
            >
          </div>
        </div>

        <div class="p-4 bg-green-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">2. Database Configuration</h3>
          <p class="mb-2">Initialize Prisma and configure your database connection:</p>
          <div class="code-block">
            <code
              >npx prisma init<br /># Edit prisma/schema.prisma to define your data model<br />npx
              prisma generate<br />npx prisma db push</code
            >
          </div>
        </div>

        <div class="p-4 bg-yellow-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">3. Development</h3>
          <p class="mb-2">Start the development server with hot reload:</p>
          <div class="code-block">
            <code>npm run dev</code>
          </div>
        </div>

        <div class="p-4 bg-purple-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-2">4. Building for Production</h3>
          <p class="mb-2">Build the application for production:</p>
          <div class="code-block">
            <code>npm run build</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.architecture-diagram {
  width: 100%;
  height: 400px;
  /* background-color: #f8fafc; */
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
.layer {
  transition: all 0.3s ease;
}
.layer:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>

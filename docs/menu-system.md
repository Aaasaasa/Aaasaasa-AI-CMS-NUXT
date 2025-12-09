# Menu System Documentation

## Overview

The WordPress Menu System provides dynamic navigation integration between WordPress and Nuxt.js, allowing seamless migration of WordPress menus to the Nuxt frontend.

## Architecture

### Menu Models (PostgreSQL)

```typescript
// Menu - Container for navigation items
interface Menu {
  id: number
  name: string        // Unique identifier (slug)
  location: string    // Display location
  isActive: boolean   // Enable/disable menu
  items: MenuItem[]   // Child menu items
}

// MenuItem - Individual navigation entry
interface MenuItem {
  id: number
  menuId: number      // Parent menu reference
  parentId: number?   // Hierarchical parent (null for root items)
  title: string       // Display text
  url: string?        // External URL (for custom links)
  route: string?      // Internal Nuxt route
  target: string      // Link target (_self, _blank)
  cssClass: string?   // Custom CSS classes
  icon: string?       // Icon identifier
  order: number       // Display order
  isActive: boolean   // Enable/disable item
  children: MenuItem[] // Sub-menu items
}
```

### API Endpoints

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| `GET`  | `/api/menus`       | List all menus                   |
| `GET`  | `/api/menus/:name` | Get specific menu with hierarchy |

#### Response Format

```typescript
interface MenuResponse {
  success: boolean
  data: {
    id: number
    name: string
    location: string
    isActive: boolean
    items: MenuItemWithChildren[]
  }
}
```

## Frontend Integration

### Composable: `useMenu()`

The menu composable provides reactive menu loading with caching and error handling:

```typescript
const { getMenuAsSidebarItems, fetchMenu, clearMenuCache } = useMenu()

// Load menu as sidebar items
const menuItems = await getMenuAsSidebarItems('main-menu')

// Direct menu fetch
const menu = await fetchMenu('main-menu')
```

### Sidebar Component

The `AppSidebar.vue` component automatically:

- Loads WordPress menus via API
- Converts to sidebar-compatible format
- Provides hierarchical navigation
- Falls back to default items on error
- Shows loading states and menu status

#### Features

- **Hierarchical Menus:** Parent-child relationships with visual indication
- **Intelligent Icons:** Auto-mapping based on menu item titles
- **Graceful Fallback:** Default navigation if WordPress menu fails
- **Loading States:** Skeleton loading during API calls
- **Menu Status Indicator:** Shows WordPress/Fallback menu status

### Icon Mapping

Menu items automatically receive appropriate icons based on title content:

```typescript
const iconMapping = {
  'home|start': 'i-lucide-home',
  'blog|news': 'i-lucide-book-open',
  'portfolio|work|projects': 'i-lucide-briefcase',
  'service|dienst': 'i-lucide-wrench',
  'about|über|vision': 'i-lucide-user',
  'contact|kontakt': 'i-lucide-mail',
  technolog: 'i-lucide-cpu',
  impressum: 'i-lucide-info',
  'datenschutz|privacy': 'i-lucide-shield-check'
}
```

## WordPress Migration

### Import Process

The WordPress menu migration (`migrateMenus()`) handles:

1. **Menu Discovery:** Extract WordPress navigation menus
2. **Item Processing:** Convert menu items with metadata
3. **Hierarchy Creation:** Two-pass parent-child relationship building
4. **URL Resolution:** Map WordPress URLs to Nuxt routes
5. **Metadata Preservation:** Import custom classes, targets, etc.

### Supported Menu Item Types

| WordPress Type          | Nuxt Route Pattern  | Example                |
| ----------------------- | ------------------- | ---------------------- |
| `post_type` (post)      | `/articles/{slug}`  | `/articles/my-post`    |
| `post_type` (page)      | `/pages/{slug}`     | `/pages/about`         |
| `post_type` (portfolio) | `/portfolio/{slug}` | `/portfolio/project`   |
| `taxonomy`              | `/category/{slug}`  | `/category/web-design` |
| `custom`                | `{url}`             | `https://external.com` |

### Migration Example

```bash
# Run WordPress menu migration
yarn tsx migrate/wordpress-to-postgres.ts

# Output:
# 🍽️ Migriere WordPress Menüs...
# 📄 Gefunden: 1 WordPress Menüs
#    Menu "Main Menu": 16 Items
# 🍽️ 1 Menüs und 16 Menu Items importiert
```

## Configuration

### Database Schema

```sql
-- Menu table
CREATE TABLE "Menu" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "location" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- MenuItem table with self-referencing hierarchy
CREATE TABLE "MenuItem" (
  "id" SERIAL PRIMARY KEY,
  "menuId" INTEGER NOT NULL,
  "parentId" INTEGER,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "route" TEXT,
  "target" TEXT DEFAULT '_self',
  "cssClass" TEXT,
  "icon" TEXT,
  "order" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE,
  FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE
);
```

### Service Layer

The `MenuService` provides business logic:

```typescript
// server/services/menu.service.ts
export class MenuService {
  // Get all menus
  async getAllMenus(): Promise<Menu[]>

  // Get menu by name with hierarchy
  async getMenuByName(name: string): Promise<Menu | null>

  // Build hierarchical structure
  buildMenuHierarchy(items: MenuItem[]): MenuItemWithChildren[]
}
```

## Usage Examples

### Basic Sidebar Integration

```vue
<template>
  <AppSidebar v-model="sidebarOpen" />
</template>

<script setup>
// Sidebar automatically loads WordPress menus
const sidebarOpen = ref(false)
</script>
```

### Custom Menu Implementation

```vue
<template>
  <nav v-if="menuItems.length">
    <ul>
      <li v-for="item in menuItems" :key="item.id">
        <NuxtLink :to="item.route || item.url">
          <UIcon :name="item.icon" />
          {{ item.title }}
        </NuxtLink>

        <!-- Sub-menu -->
        <ul v-if="item.children?.length">
          <li v-for="child in item.children" :key="child.id">
            <NuxtLink :to="child.route || child.url">
              {{ child.title }}
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const { getMenuAsSidebarItems } = useMenu()
const menuItems = await getMenuAsSidebarItems('footer-menu')
</script>
```

### Menu Status Checking

```vue
<template>
  <div class="menu-status">
    <UIcon
      :name="isWordPressMenu ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
      :class="isWordPressMenu ? 'text-green-500' : 'text-amber-500'"
    />
    {{ isWordPressMenu ? 'WordPress Menu' : 'Fallback Menu' }}
  </div>
</template>

<script setup>
const { fetchMenu } = useMenu()
const menu = await fetchMenu('main-menu')
const isWordPressMenu = computed(() => menu?.success && menu.data?.items?.length > 0)
</script>
```

## Performance Considerations

- **Caching:** Menu data cached in composable to avoid repeated API calls
- **Lazy Loading:** Menus loaded on component mount, not during SSR
- **Error Handling:** Graceful fallback to default navigation
- **Hierarchy Optimization:** Efficient parent-child relationship building

## Testing

### API Testing

```bash
# Test menu endpoints
curl -s "http://localhost:4000/api/menus" | jq
curl -s "http://localhost:4000/api/menus/main-menu" | jq '.data.items[0:3]'

# Check hierarchy
curl -s "http://localhost:4000/api/menus/main-menu" | jq '.data.items[] | select(.children | length > 0)'
```

### Menu Migration Testing

```bash
# Test WordPress import
yarn tsx migrate/wordpress-to-postgres.ts

# Verify import results
curl -s "http://localhost:4000/api/menus/main-menu" | jq '.data.items | length'
```

## Troubleshooting

### Common Issues

1. **Empty Menu Items:** Check WordPress prefix in `.env` (`DB_PREFIX`)
2. **Missing Titles:** Verify WordPress `_menu_item_*` meta keys
3. **Broken Hierarchy:** Ensure parent-child relationships in WordPress
4. **API Errors:** Check PostgreSQL connection and schema migration

### Debug Commands

```bash
# Check WordPress tables
yarn tsx -e "console.log(await mysql.\$queryRawUnsafe('SHOW TABLES LIKE \"%menu%\"'))"

# Verify PostgreSQL menu data
yarn tsx -e "console.log(await pg.menu.findMany({ include: { items: true } }))"

# Test menu service
yarn tsx -e "console.log(await MenuService.getAllMenus())"
```

## Migration Status

✅ **Completed Features:**

- WordPress menu import with full hierarchy
- PostgreSQL menu/item models
- REST API endpoints with proper responses
- Frontend sidebar integration with loading states
- Intelligent icon mapping and fallback system
- Composable for reusable menu logic

🔄 **Current Status:**

- 1 WordPress menu imported (16 items)
- 9 root-level items with 7 sub-items under "Our Work"
- Full hierarchical navigation functional
- API running on port 4000 with proper authentication

📈 **Performance Metrics:**

- Menu API response: ~50ms
- WordPress import: 1 menu with 16 items in 4.06s
- Frontend loading: Skeleton state during initial load
- Zero-downtime fallback to default navigation

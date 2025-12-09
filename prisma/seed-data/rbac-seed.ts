// prisma/seed-data/rbac-seed.ts
// RBAC (Role-Based Access Control) Seed Data
/* eslint-disable no-console */

import { PrismaClient as PostgresCMSClient } from '../generated/postgres-cms'

const prismaCMS = new PostgresCMSClient()

export async function seedRBAC() {
  console.log('🔐 Seeding RBAC System...')

  // ==========================================
  // 1. CREATE PERMISSIONS
  // ==========================================
  console.log('  📋 Creating Permissions...')

  const permissions = await Promise.all([
    // --- Posts/Articles ---
    prismaCMS.permission.create({
      data: {
        name: 'articles.create',
        slug: 'articles-create',
        description: 'Create new articles',
        resource: 'articles',
        action: 'CREATE',
        scope: 'GLOBAL',
        isSystem: true
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'articles.read',
        slug: 'articles-read',
        description: 'Read articles',
        resource: 'articles',
        action: 'READ',
        scope: 'GLOBAL',
        isSystem: true
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'articles.update',
        slug: 'articles-update',
        description: 'Update existing articles',
        resource: 'articles',
        action: 'UPDATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'articles.delete',
        slug: 'articles-delete',
        description: 'Delete articles',
        resource: 'articles',
        action: 'DELETE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'articles.publish',
        slug: 'articles-publish',
        description: 'Publish articles',
        resource: 'articles',
        action: 'PUBLISH',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Pages ---
    prismaCMS.permission.create({
      data: {
        name: 'pages.create',
        slug: 'pages-create',
        description: 'Create new pages',
        resource: 'pages',
        action: 'CREATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'pages.update',
        slug: 'pages-update',
        description: 'Update pages',
        resource: 'pages',
        action: 'UPDATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Users ---
    prismaCMS.permission.create({
      data: {
        name: 'users.manage',
        slug: 'users-manage',
        description: 'Manage all users',
        resource: 'users',
        action: 'MANAGE',
        scope: 'GLOBAL',
        isSystem: true
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'users.read',
        slug: 'users-read',
        description: 'View user profiles',
        resource: 'users',
        action: 'READ',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Products ---
    prismaCMS.permission.create({
      data: {
        name: 'products.create',
        slug: 'products-create',
        description: 'Create new products',
        resource: 'products',
        action: 'CREATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'products.update',
        slug: 'products-update',
        description: 'Update products',
        resource: 'products',
        action: 'UPDATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'products.delete',
        slug: 'products-delete',
        description: 'Delete products',
        resource: 'products',
        action: 'DELETE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Orders ---
    prismaCMS.permission.create({
      data: {
        name: 'orders.read',
        slug: 'orders-read',
        description: 'View orders',
        resource: 'orders',
        action: 'READ',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'orders.manage',
        slug: 'orders-manage',
        description: 'Manage orders (approve, cancel, refund)',
        resource: 'orders',
        action: 'MANAGE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Media ---
    prismaCMS.permission.create({
      data: {
        name: 'media.upload',
        slug: 'media-upload',
        description: 'Upload media files',
        resource: 'media',
        action: 'CREATE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),
    prismaCMS.permission.create({
      data: {
        name: 'media.delete',
        slug: 'media-delete',
        description: 'Delete media files',
        resource: 'media',
        action: 'DELETE',
        scope: 'GLOBAL',
        isSystem: false
      }
    }),

    // --- Reports ---
    prismaCMS.permission.create({
      data: {
        name: 'reports.export',
        slug: 'reports-export',
        description: 'Export reports',
        resource: 'reports',
        action: 'EXPORT',
        scope: 'GLOBAL',
        isSystem: false
      }
    })
  ])

  console.log(`  ✅ Created ${permissions.length} permissions`)

  // ==========================================
  // 2. CREATE CUSTOM ROLES
  // ==========================================
  console.log('  👥 Creating Custom Roles...')

  const roleContentManager = await prismaCMS.customRole.create({
    data: {
      name: 'Content Manager',
      slug: 'content-manager',
      description: 'Can create, edit, and publish content (articles, pages)',
      level: 50,
      isSystem: false,
      isActive: true
    }
  })

  const roleSalesRep = await prismaCMS.customRole.create({
    data: {
      name: 'Sales Representative',
      slug: 'sales-representative',
      description: 'Can view and manage orders, products',
      level: 30,
      isSystem: false,
      isActive: true
    }
  })

  const roleHRManager = await prismaCMS.customRole.create({
    data: {
      name: 'HR Manager',
      slug: 'hr-manager',
      description: 'Can manage employees, work logs, departments',
      level: 60,
      isSystem: false,
      isActive: true
    }
  })

  const roleAccountant = await prismaCMS.customRole.create({
    data: {
      name: 'Accountant',
      slug: 'accountant',
      description: 'Read-only access to orders, reports, export data',
      level: 40,
      isSystem: false,
      isActive: true
    }
  })

  console.log('  ✅ Created 4 custom roles')

  // ==========================================
  // 3. ASSIGN PERMISSIONS TO ROLES
  // ==========================================
  console.log('  🔗 Assigning Permissions to Roles...')

  // Content Manager Permissions
  await Promise.all([
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'articles-create')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'articles-read')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'articles-update')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'articles-publish')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'pages-create')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'pages-update')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleContentManager.id,
        permissionId: permissions.find((p) => p.slug === 'media-upload')!.id
      }
    })
  ])

  // Sales Rep Permissions
  await Promise.all([
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleSalesRep.id,
        permissionId: permissions.find((p) => p.slug === 'products-create')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleSalesRep.id,
        permissionId: permissions.find((p) => p.slug === 'products-update')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleSalesRep.id,
        permissionId: permissions.find((p) => p.slug === 'orders-read')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleSalesRep.id,
        permissionId: permissions.find((p) => p.slug === 'orders-manage')!.id
      }
    })
  ])

  // Accountant Permissions (Read-only + Export)
  await Promise.all([
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleAccountant.id,
        permissionId: permissions.find((p) => p.slug === 'orders-read')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleAccountant.id,
        permissionId: permissions.find((p) => p.slug === 'articles-read')!.id
      }
    }),
    prismaCMS.rolePermission.create({
      data: {
        roleId: roleAccountant.id,
        permissionId: permissions.find((p) => p.slug === 'reports-export')!.id
      }
    })
  ])

  console.log('  ✅ Assigned permissions to roles')

  // ==========================================
  // 4. CREATE DEPARTMENTS
  // ==========================================
  console.log('  🏢 Creating Departments...')

  const deptIT = await prismaCMS.department.create({
    data: {
      name: 'Information Technology',
      slug: 'it',
      description: 'IT and software development',
      isActive: true
    }
  })

  const deptDev = await prismaCMS.department.create({
    data: {
      name: 'Development Team',
      slug: 'development',
      description: 'Software developers',
      parentId: deptIT.id,
      isActive: true
    }
  })

  const deptSales = await prismaCMS.department.create({
    data: {
      name: 'Sales & Marketing',
      slug: 'sales',
      description: 'Sales and customer acquisition',
      isActive: true
    }
  })

  const deptHR = await prismaCMS.department.create({
    data: {
      name: 'Human Resources',
      slug: 'hr',
      description: 'Employee management and recruitment',
      isActive: true
    }
  })

  console.log('  ✅ Created 4 departments')

  console.log('✅ RBAC System seeded successfully!\n')

  return {
    permissions,
    roles: {
      contentManager: roleContentManager,
      salesRep: roleSalesRep,
      hrManager: roleHRManager,
      accountant: roleAccountant
    },
    departments: {
      it: deptIT,
      dev: deptDev,
      sales: deptSales,
      hr: deptHR
    }
  }
}

export default seedRBAC

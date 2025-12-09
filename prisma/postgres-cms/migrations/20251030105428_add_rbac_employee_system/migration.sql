/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `cms_products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,key]` on the table `cms_user_meta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BILLING', 'SHIPPING', 'COMPANY', 'HOME', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'KLARNA', 'BANK_TRANSFER', 'CASH_ON_DELIVERY', 'SEPA_DIRECT_DEBIT', 'CREDIT_CARD', 'SOFORT', 'GIROPAY', 'APPLE_PAY', 'GOOGLE_PAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('GLOBAL', 'DEPARTMENT', 'TEAM', 'PERSONAL');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'PUBLISH', 'EXPORT', 'IMPORT', 'MANAGE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'VENDOR';
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- DropForeignKey
ALTER TABLE "public"."cms_user_meta" DROP CONSTRAINT "cms_user_meta_userId_fkey";

-- AlterTable
ALTER TABLE "cms_products" ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "salePrice" DOUBLE PRECISION,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "cms_users" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "cms_permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'GLOBAL',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_custom_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_role_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_employees" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "departmentId" INTEGER,
    "jobTitle" TEXT NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "managerId" INTEGER,
    "workEmail" TEXT,
    "workPhone" TEXT,
    "extension" TEXT,
    "salary" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "bio" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_employee_roles" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "cms_employee_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_work_logs" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursWorked" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "taskType" TEXT,
    "projectId" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_addresses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'BILLING',
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "street" TEXT NOT NULL,
    "street2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_vendor_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT,
    "taxId" TEXT,
    "registrationNumber" TEXT,
    "businessAddressId" INTEGER,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "bio" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_vendor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_payment_methods" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerId" TEXT,
    "methodId" TEXT,
    "last4" TEXT,
    "brand" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "paypalEmail" TEXT,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_bank_accounts" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "iban" TEXT,
    "swift" TEXT,
    "accountNumber" TEXT,
    "routingNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_payout_settings" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "minAmount" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "taxRate" DOUBLE PRECISION,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_payout_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_orders" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "billingAddressId" INTEGER NOT NULL,
    "shippingAddressId" INTEGER NOT NULL,
    "paymentMethodId" INTEGER,
    "paymentProvider" "PaymentProvider",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_transactions" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "PaymentStatus" NOT NULL,
    "metadata" JSONB,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_reviews" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_permissions_name_key" ON "cms_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cms_permissions_slug_key" ON "cms_permissions"("slug");

-- CreateIndex
CREATE INDEX "cms_permissions_resource_idx" ON "cms_permissions"("resource");

-- CreateIndex
CREATE INDEX "cms_permissions_action_idx" ON "cms_permissions"("action");

-- CreateIndex
CREATE UNIQUE INDEX "cms_permissions_resource_action_scope_key" ON "cms_permissions"("resource", "action", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "cms_custom_roles_name_key" ON "cms_custom_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cms_custom_roles_slug_key" ON "cms_custom_roles"("slug");

-- CreateIndex
CREATE INDEX "cms_custom_roles_slug_idx" ON "cms_custom_roles"("slug");

-- CreateIndex
CREATE INDEX "cms_role_permissions_roleId_idx" ON "cms_role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "cms_role_permissions_permissionId_idx" ON "cms_role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_role_permissions_roleId_permissionId_key" ON "cms_role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_departments_name_key" ON "cms_departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cms_departments_slug_key" ON "cms_departments"("slug");

-- CreateIndex
CREATE INDEX "cms_departments_parentId_idx" ON "cms_departments"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_employees_userId_key" ON "cms_employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_employees_employeeCode_key" ON "cms_employees"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "cms_employees_workEmail_key" ON "cms_employees"("workEmail");

-- CreateIndex
CREATE INDEX "cms_employees_userId_idx" ON "cms_employees"("userId");

-- CreateIndex
CREATE INDEX "cms_employees_departmentId_idx" ON "cms_employees"("departmentId");

-- CreateIndex
CREATE INDEX "cms_employees_managerId_idx" ON "cms_employees"("managerId");

-- CreateIndex
CREATE INDEX "cms_employees_employeeCode_idx" ON "cms_employees"("employeeCode");

-- CreateIndex
CREATE INDEX "cms_employee_roles_employeeId_idx" ON "cms_employee_roles"("employeeId");

-- CreateIndex
CREATE INDEX "cms_employee_roles_roleId_idx" ON "cms_employee_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_employee_roles_employeeId_roleId_key" ON "cms_employee_roles"("employeeId", "roleId");

-- CreateIndex
CREATE INDEX "cms_work_logs_employeeId_idx" ON "cms_work_logs"("employeeId");

-- CreateIndex
CREATE INDEX "cms_work_logs_date_idx" ON "cms_work_logs"("date");

-- CreateIndex
CREATE INDEX "cms_addresses_userId_idx" ON "cms_addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_vendor_profiles_userId_key" ON "cms_vendor_profiles"("userId");

-- CreateIndex
CREATE INDEX "cms_payment_methods_userId_idx" ON "cms_payment_methods"("userId");

-- CreateIndex
CREATE INDEX "cms_bank_accounts_vendorId_idx" ON "cms_bank_accounts"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_payout_settings_vendorId_key" ON "cms_payout_settings"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_orders_orderNumber_key" ON "cms_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "cms_orders_userId_idx" ON "cms_orders"("userId");

-- CreateIndex
CREATE INDEX "cms_orders_orderNumber_idx" ON "cms_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "cms_order_items_orderId_idx" ON "cms_order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_transactions_transactionId_key" ON "cms_transactions"("transactionId");

-- CreateIndex
CREATE INDEX "cms_transactions_orderId_idx" ON "cms_transactions"("orderId");

-- CreateIndex
CREATE INDEX "cms_transactions_transactionId_idx" ON "cms_transactions"("transactionId");

-- CreateIndex
CREATE INDEX "cms_reviews_productId_idx" ON "cms_reviews"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_reviews_productId_userId_key" ON "cms_reviews"("productId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "cms_products_sku_key" ON "cms_products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "cms_user_meta_userId_key_key" ON "cms_user_meta"("userId", "key");

-- AddForeignKey
ALTER TABLE "cms_role_permissions" ADD CONSTRAINT "cms_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cms_custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_role_permissions" ADD CONSTRAINT "cms_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "cms_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_departments" ADD CONSTRAINT "cms_departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_employees" ADD CONSTRAINT "cms_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_employees" ADD CONSTRAINT "cms_employees_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "cms_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_employees" ADD CONSTRAINT "cms_employees_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "cms_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_employee_roles" ADD CONSTRAINT "cms_employee_roles_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cms_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_employee_roles" ADD CONSTRAINT "cms_employee_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cms_custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_work_logs" ADD CONSTRAINT "cms_work_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cms_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_user_meta" ADD CONSTRAINT "cms_user_meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_addresses" ADD CONSTRAINT "cms_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_vendor_profiles" ADD CONSTRAINT "cms_vendor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_vendor_profiles" ADD CONSTRAINT "cms_vendor_profiles_businessAddressId_fkey" FOREIGN KEY ("businessAddressId") REFERENCES "cms_addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_payment_methods" ADD CONSTRAINT "cms_payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_bank_accounts" ADD CONSTRAINT "cms_bank_accounts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "cms_vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_payout_settings" ADD CONSTRAINT "cms_payout_settings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "cms_vendor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_orders" ADD CONSTRAINT "cms_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_orders" ADD CONSTRAINT "cms_orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "cms_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_orders" ADD CONSTRAINT "cms_orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "cms_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_orders" ADD CONSTRAINT "cms_orders_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "cms_payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_order_items" ADD CONSTRAINT "cms_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cms_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_order_items" ADD CONSTRAINT "cms_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_transactions" ADD CONSTRAINT "cms_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "cms_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_reviews" ADD CONSTRAINT "cms_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_reviews" ADD CONSTRAINT "cms_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

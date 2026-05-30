-- Run this script in your Supabase SQL Editor to add support for Kurdish translations
-- Link: https://supabase.com/dashboard/project/_/sql

-- 1. Add Kurdish columns to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "nameKu" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "descriptionKu" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryKu" text;

-- 2. Add Kurdish columns to categories table
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "nameKu" text;

-- 3. Add Kurdish columns to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "statusKu" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "wonPrizeKu" text;

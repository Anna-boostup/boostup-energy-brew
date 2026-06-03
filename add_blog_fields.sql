-- SQL Migration: Add missing columns to blog_posts table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_position TEXT DEFAULT 'center';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Redakce BoostUp';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'Kvalita & Energie';

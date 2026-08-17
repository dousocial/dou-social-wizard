-- Run this in Supabase SQL editor (Database > SQL Editor)
-- Creates the blog_posts table for the admin panel

create table if not exists blog_posts (
  id           uuid primary key default gen_random_uuid(),
  locale       text not null default 'tr',
  slug         text not null,
  title        text not null,
  seo_title    text,
  description  text,
  content      text not null default '',
  cover        text,
  tags         text[] default '{}',
  author       text default 'DOU Social',
  published_at date,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (locale, slug)
);

-- Enable Row Level Security but allow service role full access
alter table blog_posts enable row level security;

-- Allow public read of published posts (for blog frontend)
create policy "Public can read published posts"
  on blog_posts for select
  using (is_published = true);

-- Service role bypasses RLS automatically (used by admin panel)

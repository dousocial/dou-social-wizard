-- Run this in Supabase SQL Editor (Database > SQL Editor)
-- Creates the projects table for the admin panel

create table if not exists projects (
  id                  uuid primary key default gen_random_uuid(),
  locale              text not null default 'tr',
  slug                text not null,
  industry            text not null default '',
  duration            text not null default '',
  title               text not null,
  seo_title           text,
  summary             text not null default '',
  cover_metric        text not null default '',
  cover_metric_label  text not null default '',
  cover_image         text,
  challenge_title     text not null default '',
  challenge_intro     text not null default '',
  challenge_points    text[] not null default '{}',
  approach_title      text not null default '',
  approach_steps      jsonb not null default '[]',
  results_title       text not null default '',
  results_summary     text not null default '',
  results_metrics     jsonb not null default '[]',
  gallery_images      text[] not null default '{}',
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (locale, slug)
);

alter table projects enable row level security;

-- Public can read published projects
create policy "Public can read published projects"
  on projects for select
  using (is_published = true);

-- Service role bypasses RLS automatically (used by admin panel)

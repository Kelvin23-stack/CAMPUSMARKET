-- =========================================================
-- CampusMarket — 0001_init.sql
-- Core schema, RLS policies, auto-profile trigger, seed data.
-- Run this in the Supabase SQL editor (or `supabase db push`)
-- against a fresh project before wiring up the front end.
--
-- Safe to re-run: it drops its own tables/trigger/function first,
-- so a half-finished previous attempt (e.g. a `categories` table
-- created with the wrong column types) can't cause a mismatch —
-- everything below is created fresh every time this file runs.
-- =========================================================

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.reviews cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.favorites cascade;
drop table if exists public.listing_images cascade;
drop table if exists public.listings cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop table if exists public.universities cascade;

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- universities
-- ---------------------------------------------------------
create table if not exists public.universities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  email_domain text,
  location text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  email text,
  university_id uuid references public.universities(id) on delete set null,
  avatar_url text,
  phone text,
  bio text,
  role text not null default 'buy' check (role in ('buy', 'sell')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_university on public.profiles(university_id);

-- ---------------------------------------------------------
-- categories
-- ---------------------------------------------------------
create table if not exists public.categories (
  id text primary key, -- slug, matches the existing front-end category ids
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- listings
-- ---------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  university_id uuid references public.universities(id) on delete set null,
  category_id text references public.categories(id) on delete set null,
  title text not null,
  description text,
  price numeric(12,2) not null default 0,
  condition text not null default 'Good' check (condition in ('New','Like New','Good','Fair','Used')),
  status text not null default 'active' check (status in ('active','sold','draft','removed')),
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_seller on public.listings(seller_id);
create index if not exists idx_listings_university on public.listings(university_id);
create index if not exists idx_listings_category on public.listings(category_id);
create index if not exists idx_listings_status on public.listings(status);

-- ---------------------------------------------------------
-- listing_images
-- ---------------------------------------------------------
create table if not exists public.listing_images (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_images_listing on public.listing_images(listing_id);

-- ---------------------------------------------------------
-- favorites
-- ---------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

-- ---------------------------------------------------------
-- conversations
-- ---------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.listings(id) on delete set null,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);

create index if not exists idx_conversations_buyer on public.conversations(buyer_id);
create index if not exists idx_conversations_seller on public.conversations(seller_id);

-- ---------------------------------------------------------
-- messages
-- ---------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id);

-- ---------------------------------------------------------
-- reviews
-- ---------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_reviewee on public.reviews(reviewee_id);

-- =========================================================
-- Auto-create a profile row whenever a new auth.users row appears
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'buy')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at before update on public.listings
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- universities & categories: public read, no client writes
create policy "universities are publicly readable" on public.universities
  for select using (true);

create policy "categories are publicly readable" on public.categories
  for select using (true);

-- profiles: public read (needed to show seller name/avatar), self-only write
create policy "profiles are publicly readable" on public.profiles
  for select using (true);

create policy "users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- listings: active listings are public, sellers manage their own
create policy "active listings are publicly readable" on public.listings
  for select using (status = 'active' or seller_id = auth.uid());

create policy "users can create listings as themselves" on public.listings
  for insert with check (auth.uid() = seller_id);

create policy "sellers can update their own listings" on public.listings
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create policy "sellers can delete their own listings" on public.listings
  for delete using (auth.uid() = seller_id);

-- listing_images: readable alongside their listing, writable by the listing's seller
create policy "listing images are publicly readable" on public.listing_images
  for select using (true);

create policy "sellers can add images to their own listings" on public.listing_images
  for insert with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

create policy "sellers can delete images from their own listings" on public.listing_images
  for delete using (
    exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

-- favorites: users manage only their own
create policy "users can read their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "users can add their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "users can remove their own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- conversations: only participants
create policy "participants can read their conversations" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "buyers can start a conversation" on public.conversations
  for insert with check (auth.uid() = buyer_id);

-- messages: only conversation participants
create policy "participants can read their messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "participants can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "participants can mark messages read" on public.messages
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- reviews: public read, only the reviewer can write their own review
create policy "reviews are publicly readable" on public.reviews
  for select using (true);

create policy "users can leave reviews as themselves" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- =========================================================
-- Seed data — matches the slugs/names already used in js/data.js
-- so the existing front end keeps working without changes.
-- =========================================================
insert into public.categories (id, name, icon) values
  ('electronics', 'Electronics', 'laptop'),
  ('phones', 'Phones & Accessories', 'smartphone'),
  ('fashion', 'Fashion', 'shirt'),
  ('books', 'Books', 'book'),
  ('food', 'Food', 'utensils'),
  ('accommodation', 'Accommodation', 'home'),
  ('gadgets', 'Gadgets', 'cpu'),
  ('supplies', 'School Supplies', 'backpack'),
  ('services', 'Services', 'wrench'),
  ('others', 'Others', 'package')
on conflict (id) do nothing;

insert into public.universities (name, location) values
  ('Lindale University', 'Lindale'),
  ('Ashcombe State', 'Ashcombe'),
  ('Redbrook College', 'Redbrook'),
  ('Northgate University', 'Northgate')
on conflict (name) do nothing;

-- =====================================================================
-- CampusMarket — Database Schema (v1)
-- Run this once in a fresh Supabase project (SQL Editor or CLI migration)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gives us gen_random_uuid()

-- ---------------------------------------------------------------------
-- 0.1 SHARED HELPER: auto-update `updated_at` on any table that has it
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- 1. UNIVERSITIES
-- =====================================================================
create table public.universities (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email_domain  text not null unique,   -- e.g. 'unilag.edu.ng'
  created_at    timestamptz not null default now()
);

comment on table public.universities is 'Campuses that scope the marketplace.';

-- =====================================================================
-- 2. PROFILES  (1:1 extension of auth.users)
-- =====================================================================
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  university_id  uuid references public.universities(id) on delete set null,
  full_name      text not null,
  avatar_url     text,
  bio            text,
  phone_number   text,
  rating_avg     numeric(3,2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_profiles_university_id on public.profiles(university_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 3. CATEGORIES
-- =====================================================================
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  icon       text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 4. LISTINGS
-- =====================================================================
create table public.listings (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references public.profiles(id) on delete cascade,
  category_id    uuid references public.categories(id) on delete set null,
  university_id  uuid not null references public.universities(id) on delete cascade,
  title          text not null check (char_length(title) between 3 and 120),
  description    text not null check (char_length(description) <= 4000),
  price          numeric(10,2) not null check (price >= 0),
  listing_type   text not null check (listing_type in ('product', 'service')),
  condition      text check (condition in ('new', 'used_like_new', 'used_good', 'used_fair')),
  status         text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  location_note  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_listings_university_id on public.listings(university_id);
create index idx_listings_category_id on public.listings(category_id);
create index idx_listings_seller_id on public.listings(seller_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_university_status on public.listings(university_id, status);

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5. LISTING_IMAGES
-- =====================================================================
create table public.listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings(id) on delete cascade,
  image_url   text not null,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_listing_images_listing_id on public.listing_images(listing_id);

-- =====================================================================
-- 6. CONVERSATIONS
-- =====================================================================
create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid references public.listings(id) on delete set null,
  buyer_id         uuid not null references public.profiles(id) on delete cascade,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  constraint chk_buyer_seller_different check (buyer_id <> seller_id),
  constraint uq_conversation_per_listing_pair unique (listing_id, buyer_id, seller_id)
);

create index idx_conversations_buyer_id on public.conversations(buyer_id);
create index idx_conversations_seller_id on public.conversations(seller_id);
create index idx_conversations_listing_id on public.conversations(listing_id);

-- =====================================================================
-- 7. MESSAGES
-- =====================================================================
create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid not null references public.profiles(id) on delete cascade,
  content           text not null check (char_length(content) between 1 and 2000),
  is_read          boolean not null default false,
  created_at       timestamptz not null default now()
);

create index idx_messages_conversation_id on public.messages(conversation_id, created_at);
create index idx_messages_sender_id on public.messages(sender_id);

-- Keep conversations.last_message_at in sync whenever a message is inserted
create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_last_message();

-- =====================================================================
-- 8. FAVORITES
-- =====================================================================
create table public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  listing_id  uuid not null references public.listings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint uq_favorite_per_user_listing unique (user_id, listing_id)
);

create index idx_favorites_user_id on public.favorites(user_id);

-- =====================================================================
-- 9. REVIEWS
-- =====================================================================
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid references public.listings(id) on delete set null,
  reviewer_id  uuid not null references public.profiles(id) on delete cascade,
  reviewee_id  uuid not null references public.profiles(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  comment      text check (char_length(comment) <= 1000),
  created_at   timestamptz not null default now(),
  constraint chk_reviewer_reviewee_different check (reviewer_id <> reviewee_id)
);

create index idx_reviews_reviewee_id on public.reviews(reviewee_id);
create index idx_reviews_reviewer_id on public.reviews(reviewer_id);

-- Keep profiles.rating_avg in sync whenever a review is added/changed/removed
create or replace function public.recalculate_rating_avg()
returns trigger
language plpgsql
as $$
declare
  target_user uuid;
begin
  target_user := coalesce(new.reviewee_id, old.reviewee_id);

  update public.profiles
     set rating_avg = coalesce((
       select round(avg(rating)::numeric, 2)
       from public.reviews
       where reviewee_id = target_user
     ), 0)
   where id = target_user;

  return null;
end;
$$;

create trigger trg_reviews_after_change
  after insert or update or delete on public.reviews
  for each row execute function public.recalculate_rating_avg();

-- =====================================================================
-- 10. PROFILE CREATION TRIGGER (Auth -> Database link)
-- =====================================================================
-- Fires automatically whenever a new user signs up via Supabase Auth.
-- Reads full_name / university_id from the signup metadata if provided:
--   supabase.auth.signUp({ email, password, options: { data: { full_name, university_id } } })

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, university_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New Student'),
    (new.raw_user_meta_data ->> 'university_id')::uuid
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- 11. ROW LEVEL SECURITY
-- =====================================================================

-- ---- universities: public read, no client writes ----
alter table public.universities enable row level security;

create policy "universities_select_all"
  on public.universities for select
  using (true);

-- ---- categories: public read, no client writes ----
alter table public.categories enable row level security;

create policy "categories_select_all"
  on public.categories for select
  using (true);

-- ---- profiles: public read, owner-only write ----
alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
-- No insert policy: rows are created only by the handle_new_user trigger (security definer).
-- No delete policy: deleting auth.users cascades via FK instead.

-- ---- listings: public read, owner-only write ----
alter table public.listings enable row level security;

create policy "listings_select_all"
  on public.listings for select
  using (true);

create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.uid() = seller_id);

create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

create policy "listings_delete_own"
  on public.listings for delete
  using (auth.uid() = seller_id);

-- ---- listing_images: public read, only the listing's owner can write ----
alter table public.listing_images enable row level security;

create policy "listing_images_select_all"
  on public.listing_images for select
  using (true);

create policy "listing_images_insert_own"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

create policy "listing_images_delete_own"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

-- ---- favorites: user can only see/manage their own ----
alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---- conversations: only participants can see/create ----
alter table public.conversations enable row level security;

create policy "conversations_select_participant"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "conversations_insert_participant"
  on public.conversations for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ---- messages: only conversation participants can read/send ----
alter table public.messages enable row level security;

create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "messages_update_own_read_state"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ---- reviews: public read, only the reviewer can write their own review ----
alter table public.reviews enable row level security;

create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

-- =====================================================================
-- 12. SEED DATA — initial categories
-- =====================================================================
insert into public.categories (name, slug, icon) values
  ('Textbooks',        'textbooks',        'book'),
  ('Electronics',      'electronics',      'cpu'),
  ('Furniture',        'furniture',        'sofa'),
  ('Clothing',         'clothing',         'shirt'),
  ('Tutoring',         'tutoring',         'graduation-cap'),
  ('Food & Snacks',    'food-snacks',      'utensils'),
  ('Dorm Essentials',  'dorm-essentials',  'bed'),
  ('Services',         'services',         'wrench'),
  ('Tickets & Events', 'tickets-events',   'ticket'),
  ('Other',            'other',            'box');

-- =====================================================================
-- End of schema.sql
-- =====================================================================

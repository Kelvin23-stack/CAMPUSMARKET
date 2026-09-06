# CampusMarket — Architecture & Database Design (v1)

Stack: HTML5 + CSS3 + Vanilla JS (no frameworks) · Supabase (Auth, PostgreSQL, Storage, Realtime) · Gemini API via Edge Functions (later)

---

## 1. Recommended Folder Structure

```
campusmarket/
├── index.html                     # Landing page
├── pages/
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── listings/
│   │   ├── browse.html            # Search + filter + category grid
│   │   ├── listing-detail.html
│   │   └── create-listing.html    # Also used for editing (?id=)
│   ├── profile/
│   │   ├── view-profile.html      # Public profile (?id=)
│   │   └── edit-profile.html
│   ├── messages/
│   │   ├── inbox.html             # List of conversations
│   │   └── chat.html              # Single conversation (?id=)
│   └── dashboard/
│       ├── my-listings.html
│       └── favorites.html
│
├── assets/
│   ├── css/
│   │   ├── base.css               # Reset, variables, typography
│   │   ├── components.css         # Buttons, cards, modals, navbar
│   │   └── pages/                 # One file per page, imported as needed
│   │       ├── browse.css
│   │       ├── listing-detail.css
│   │       └── ...
│   │
│   ├── js/
│   │   ├── config/
│   │   │   └── supabaseClient.js  # initializes Supabase client (URL + anon key)
│   │   │
│   │   ├── services/              # ALL Supabase calls live here — nowhere else
│   │   │   ├── authService.js     # signUp, signIn, signOut, getSession
│   │   │   ├── listingService.js  # CRUD for listings
│   │   │   ├── categoryService.js
│   │   │   ├── messageService.js  # conversations + messages + realtime subs
│   │   │   ├── storageService.js  # image upload/delete helpers
│   │   │   └── profileService.js
│   │   │
│   │   ├── pages/                 # One controller file per HTML page
│   │   │   ├── browse.js
│   │   │   ├── listing-detail.js
│   │   │   ├── create-listing.js
│   │   │   ├── chat.js
│   │   │   └── ...
│   │   │
│   │   ├── components/            # Reusable UI logic (rendered via JS, no framework)
│   │   │   ├── navbar.js
│   │   │   ├── listingCard.js
│   │   │   └── toast.js
│   │   │
│   │   └── utils/
│   │       ├── auth-guard.js      # redirect if not logged in
│   │       ├── formatters.js      # price, date formatting
│   │       └── validators.js
│   │
│   └── images/                    # Static/local assets (logo, icons, placeholders)
│
├── supabase/
│   ├── migrations/                # SQL migration files (schema versioned in git)
│   └── functions/                 # Edge Functions (Gemini integration, later)
│
├── .env.example                   # SUPABASE_URL, SUPABASE_ANON_KEY (placeholders)
└── README.md
```

**Why this shape works for vanilla JS:**
- `services/` is the *only* layer allowed to talk to Supabase. Pages never call `supabase.from(...)` directly — they call a service function. This keeps things swappable and testable even without a framework.
- `pages/*.js` are thin controllers: read the DOM, call a service, render the result.
- `components/*.js` are just functions that return/inject HTML strings or DOM nodes — no framework needed for reuse.

---

## 2. Main Pages (v1 scope)

| Page | Purpose |
|---|---|
| Landing (`index.html`) | Pitch + entry point, redirects logged-in users to Browse |
| Login / Register | Supabase Auth (email/password, ideally restricted to campus email domains) |
| Browse Listings | Search, filter by category/price/condition, campus-scoped |
| Listing Detail | Full listing view, seller info, image gallery, "Message Seller" / "Save" |
| Create / Edit Listing | Form + image upload |
| My Listings (Dashboard) | Manage own active/sold/reserved listings |
| Favorites | Saved listings |
| Public Profile | Seller's public info, rating, active listings |
| Edit Profile | Update own profile info/avatar |
| Inbox | List of conversations |
| Chat | Realtime 1:1 conversation about a listing |

Not in v1 (future): payments/checkout, admin moderation dashboard, notifications center, AI-assisted listing generation (comes with Gemini integration).

---

## 3–5. Database Tables, Columns & Relationships

All tables live in the `public` schema. `profiles.id` is the same UUID as `auth.users.id` (Supabase's standard pattern) — this is what ties Supabase Auth to your own data.

### `universities`
Scopes the whole marketplace to individual campuses.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | e.g. "University of Lagos" |
| email_domain | text | e.g. "unilag.edu.ng" — used to verify students on signup |
| created_at | timestamptz | |

### `profiles`
Extends `auth.users`. Created automatically via a trigger on signup.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK, FK → auth.users.id | |
| university_id | uuid, FK → universities.id | |
| full_name | text | |
| avatar_url | text | Storage path/public URL |
| bio | text | nullable |
| phone_number | text | nullable |
| rating_avg | numeric | denormalized, updated via trigger from `reviews` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | text | e.g. "Textbooks", "Electronics", "Tutoring" |
| slug | text, unique | |
| icon | text | nullable, for UI |

### `listings`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| seller_id | uuid, FK → profiles.id | |
| category_id | uuid, FK → categories.id | |
| university_id | uuid, FK → universities.id | denormalized for fast campus-scoped queries |
| title | text | |
| description | text | |
| price | numeric | |
| listing_type | text/enum | `product` \| `service` |
| condition | text/enum | `new` \| `used_like_new` \| `used_good` \| `used_fair` (nullable for services) |
| status | text/enum | `available` \| `reserved` \| `sold` |
| location_note | text | nullable, e.g. "Hostel Block C" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `listing_images`
One listing → many images.
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| listing_id | uuid, FK → listings.id | |
| image_url | text | Supabase Storage public URL |
| position | int | display order |
| created_at | timestamptz | |

### `conversations`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| listing_id | uuid, FK → listings.id | nullable if you later allow non-listing chats |
| buyer_id | uuid, FK → profiles.id | |
| seller_id | uuid, FK → profiles.id | |
| last_message_at | timestamptz | denormalized, for sorting inbox |
| created_at | timestamptz | |

### `messages`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| conversation_id | uuid, FK → conversations.id | |
| sender_id | uuid, FK → profiles.id | |
| content | text | |
| is_read | boolean | default false |
| created_at | timestamptz | |

### `favorites`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → profiles.id | |
| listing_id | uuid, FK → listings.id | |
| created_at | timestamptz | unique constraint on (user_id, listing_id) |

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| listing_id | uuid, FK → listings.id | nullable |
| reviewer_id | uuid, FK → profiles.id | who wrote it |
| reviewee_id | uuid, FK → profiles.id | who it's about |
| rating | int | 1–5, check constraint |
| comment | text | nullable |
| created_at | timestamptz | |

### Relationship Summary
```
auth.users (1) ── (1) profiles
universities (1) ── (∞) profiles
universities (1) ── (∞) listings
profiles (1) ── (∞) listings            [seller_id]
categories (1) ── (∞) listings
listings (1) ── (∞) listing_images
listings (1) ── (∞) conversations
profiles (1) ── (∞) conversations       [as buyer_id]
profiles (1) ── (∞) conversations       [as seller_id]
conversations (1) ── (∞) messages
profiles (1) ── (∞) messages            [sender_id]
profiles (1) ── (∞) favorites
listings (1) ── (∞) favorites
profiles (1) ── (∞) reviews             [reviewer_id]
profiles (1) ── (∞) reviews             [reviewee_id]
```

---

## 6. How Auth, Database, Storage & Realtime Work Together

**Authentication → Database**
A user signs up through Supabase Auth (email/password, ideally gated to campus email domains via a check in your signup flow). Supabase creates a row in the private `auth.users` table. A **Postgres trigger** (`on_auth_user_created`) automatically inserts a matching row into your public `profiles` table using the new user's `id`. From then on, every table in your schema references `profiles.id`, not `auth.users.id` directly — `profiles` is your "public-facing" user record.

Row Level Security (RLS) policies use `auth.uid()` to decide who can read/write what — e.g. "anyone can read listings," "only the seller can update/delete their own listing," "only participants can read a conversation's messages." This is what keeps the vanilla-JS frontend safe even though it talks to the database directly with the public anon key.

**Database → Storage**
Listing photos and avatars are uploaded to **Supabase Storage buckets** (e.g. `listing-images`, `avatars`). The database never stores the file itself — only the resulting public URL (or storage path), in `listing_images.image_url` / `profiles.avatar_url`. Storage has its own RLS-style policies (e.g. "only authenticated users can upload," "only the owner can delete their file").

**Database → Realtime**
Supabase Realtime listens to Postgres changes (via logical replication) and pushes them to subscribed clients over WebSockets. For CampusMarket, the main use is the `messages` table: when a user opens `chat.html`, the client subscribes to `INSERT` events on `messages` filtered by `conversation_id`, so new messages appear instantly without polling. You could later extend this to live-update listing status (e.g. "marked as sold") on the browse page.

**Putting it together for one flow — sending a message:**
1. User is authenticated (Auth) → their `auth.uid()` is available in every request.
2. `messageService.js` inserts a row into `messages` (Database), RLS checks the sender is a participant in that `conversation_id`.
3. The recipient's open chat window is subscribed to that conversation (Realtime) → the new row is pushed to them instantly.
4. If the message included an image, it was uploaded to Storage first, and only the returned URL is stored in the `content`/a dedicated column.

---

This is the v1 architecture — intentionally no payments, notifications, or AI tables yet, since those come later with Gemini/Edge Functions integration.

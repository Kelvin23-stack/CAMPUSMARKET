/* =========================================================
   CampusMarket — data.js
   Shared mock data used across every page (no backend attached).
   Icon names map to the tiny inline SVG icon set in main.js (CM.icon).
   ========================================================= */

const CM_CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: "laptop", count: 148, blurb: "Laptops, monitors, keyboards and everything else that plugs in." },
  { id: "phones", name: "Phones & Accessories", icon: "smartphone", count: 96, blurb: "Cases, chargers, and gently used phones from students upgrading." },
  { id: "fashion", name: "Fashion", icon: "shirt", count: 211, blurb: "Thrifted fits, dorm-formal wear, and closet clear-outs." },
  { id: "books", name: "Books", icon: "book", count: 304, blurb: "Textbooks by course code, straight from students who took it." },
  { id: "food", name: "Food", icon: "utensils", count: 58, blurb: "Meal swipe swaps and home-cooked extras from your dorm." },
  { id: "accommodation", name: "Accommodation", icon: "home", count: 27, blurb: "Sublets and room swaps between students on the same campus." },
  { id: "gadgets", name: "Gadgets", icon: "cpu", count: 73, blurb: "Headphones, chargers, smart devices, and dorm-room tech." },
  { id: "supplies", name: "School Supplies", icon: "backpack", count: 165, blurb: "Calculators, backpacks, and everything left over from last term." },
  { id: "services", name: "Services", icon: "wrench", count: 41, blurb: "Tutoring, rides, and small jobs offered by fellow students." },
  { id: "others", name: "Others", icon: "package", count: 89, blurb: "Furniture, decor, and the rest of what doesn't fit a category." },
];

const CM_CAMPUSES = ["Lindale University", "Ashcombe State", "Redbrook College", "Northgate University"];

const CM_TESTIMONIALS = [
  { quote: "Sold my mini fridge in under an hour to someone two buildings over. Didn't even need to leave campus.", name: "Priya S.", role: "Redbrook College", rating: 5 },
  { quote: "Found my entire chem textbook bundle for a third of the bookstore price. Seller even highlighted the important bits.", name: "Sam O.", role: "Lindale University", rating: 5 },
  { quote: "Way less awkward than posting in the class group chat. Filters actually help you find what you need fast.", name: "Ella F.", role: "Northgate University", rating: 4 },
];

const CM_SEED_PRODUCTS = [
  { id: 1, title: "TI-84 Plus CE graphing calculator", price: 18000, category: "supplies", condition: "Good", campus: "Lindale University", seller: "Maya R.", posted: "2h ago", desc: "Used for one semester of calc, works perfectly, comes with the original case and a fresh set of batteries.", tag: "Just listed" },
  { id: 2, title: "IKEA MICKE desk, white", price: 25000, category: "others", condition: "Good", campus: "Ashcombe State", seller: "Devon K.", posted: "5h ago", desc: "Moving out at the end of the semester, need it gone by Friday. Some scuffs on one corner, structurally solid.", tag: null },
  { id: 3, title: "MacBook Air M1, 256GB", price: 650000, category: "electronics", condition: "Like New", campus: "Redbrook College", seller: "Priya S.", posted: "1d ago", desc: "Barely used, battery health at 96%. Selling because my department issued me a laptop. Charger included.", tag: "Popular" },
  { id: 4, title: "Organic chemistry textbook bundle", price: 20000, category: "books", condition: "Fair", campus: "Lindale University", seller: "Sam O.", posted: "3h ago", desc: "3rd edition plus the solutions manual, some highlighting throughout but all pages intact.", tag: "Popular" },
  { id: 5, title: "Denim jacket, size M", price: 8000, category: "fashion", condition: "Good", campus: "Northgate University", seller: "Ella F.", posted: "6h ago", desc: "Thrifted, only wore it a handful of times. Smoke-free, pet-free room.", tag: null },
  { id: 6, title: "Mini fridge, 3.2 cu ft", price: 45000, category: "others", condition: "Good", campus: "Ashcombe State", seller: "Marcus T.", posted: "9h ago", desc: "Clean, works great, freezer included. Can help carry it to your building on campus.", tag: "Trending" },
  { id: 7, title: "Wireless earbuds, noise cancelling", price: 25000, category: "gadgets", condition: "Like New", campus: "Redbrook College", seller: "Jade L.", posted: "12h ago", desc: "Used for about a month, case has a small scratch, sound and battery are perfect.", tag: null },
  { id: 8, title: "Meal plan swap — Fri dinners", price: 2000, category: "food", condition: "New", campus: "Lindale University", seller: "Owen B.", posted: "1h ago", desc: "I never make it to Friday dinner, happy to swap my swipe for cash, weekly.", tag: "Just listed" },
  { id: 9, title: "Sublet, single room near campus", price: 150000, category: "accommodation", condition: "Good", campus: "Northgate University", seller: "Ines V.", posted: "1d ago", desc: "Studying abroad for the spring, subletting my single. 8 min walk to the quad, furnished.", tag: null },
  { id: 10, title: "iPhone 12 case + charger bundle", price: 6000, category: "phones", condition: "Good", campus: "Ashcombe State", seller: "Trevor N.", posted: "4h ago", desc: "Switched phones, don't need these anymore. Case has light wear, charger works fine.", tag: null },
  { id: 11, title: "Tutoring — intro statistics", price: 5000, category: "services", condition: "New", campus: "Redbrook College", seller: "Grace W.", posted: "8h ago", desc: "TA for the course last year, happy to help with problem sets or exam prep, per session.", tag: "Trending" },
  { id: 12, title: "Acoustic guitar, beginner friendly", price: 35000, category: "others", condition: "Fair", campus: "Lindale University", seller: "Noah P.", posted: "2d ago", desc: "Learned enough to know it's not for me. New strings a month ago, comes with a soft case.", tag: null },
];

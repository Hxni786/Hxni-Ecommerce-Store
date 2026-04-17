# Hxni Ecommerce Store

<p align="center">
  <img src="./screenshot_home.png" width="300" />
  &nbsp;&nbsp;&nbsp;
  <img src="./screenshot_product.png" width="300" />
</p>

> A production-quality mobile e-commerce application with an editorial serif aesthetic.
> Built with React Native (Expo) + Node.js + Express + MySQL.

---

## Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Mobile     | React Native · Expo Go                          |
| Navigation | React Navigation v6 (Native Stack)              |
| Persistence| @react-native-async-storage/async-storage       |
| Backend    | Node.js · Express.js                            |
| Database   | MySQL 8                                         |
| Fonts      | Playfair Display · Source Sans 3 · IBM Plex Mono|

---

## Design System

| Token       | Value       | Usage                            |
|-------------|-------------|----------------------------------|
| Background  | `#FAFAF8`   | Ivory — all screen backgrounds   |
| Foreground  | `#1A1A1A`   | Rich black — text, filled buttons|
| Accent      | `#B8860B`   | Antique gold — price, CTA border |
| Border      | `#E8E4DF`   | Hairlines, dividers              |
| Serif       | Playfair Display 700 Bold | Product names, headings |
| Sans        | Source Sans 3 400/600     | Body copy, metadata     |
| Mono        | IBM Plex Mono 400/500     | Labels, buttons, tags   |

---

## Project Structure

```
hxni-ecommerce-store/
├── backend/
│   ├── config/db.js                # MySQL2 connection pool
│   ├── controllers/
│   │   └── productController.js   # asyncHandler, SQL, validation
│   ├── routes/
│   │   └── productRoutes.js       # GET /api/products, /:id
│   ├── .env.example               # Copy → .env and fill in creds
│   ├── package.json
│   └── server.js                  # Entry point, listens on 0.0.0.0
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── CircularLogo.js   # Gold-bordered circular logo
│   │   │   │   ├── EditorialText.js  # SerifHeading, SansBody, MonoLabel
│   │   │   │   └── GoldButton.js     # Animated CTA, filled + outline
│   │   │   └── product/
│   │   │       ├── ProductCard.js    # 2-col grid card with press animation
│   │   │       └── ProductImage.js   # 40% hero image with lazy load
│   │   ├── navigation/
│   │   │   └── AppNavigator.js      # Native stack (Home → Details)
│   │   ├── screens/
│   │   │   ├── HomeScreen.js        # Grid feed, pull-to-refresh, states
│   │   │   └── DetailsScreen.js     # Hero image, cart logic, haptics, toast
│   │   ├── services/
│   │   │   ├── api.js               # Timeout-protected fetch wrapper
│   │   │   └── storage.js           # Cart: get/add/remove/clear/count
│   │   ├── theme/
│   │   │   └── palette.js           # Colors, FontFamilies, Spacing, Shadows
│   │   └── utils/
│   │       └── formatters.js        # formatCurrency, truncate, categoryLabel
│   ├── App.js                       # Font loading, SplashScreen, providers
│   ├── app.json
│   └── package.json
│
└── db/
    └── schema.sql                   # CREATE TABLE + 10 seed products
```

---

## Setup

### 1 — Database

```bash
mysql -u root -p < db/schema.sql
```

### 2 — Backend

```bash
cd backend

# Copy and fill in your credentials
cp .env.example .env
#   DB_USER=root
#   DB_PASSWORD=your_password
#   DB_NAME=hxni_store
#   PORT=3001

npm install
npm run dev
# → Server listening on http://0.0.0.0:3001
```

### 3 — Find your LAN IP (for Expo Go on a physical device)

```bash
# macOS / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig   # look for IPv4 Address
```

### 4 — Frontend

Open `frontend/src/services/api.js` and update:

```js
const BASE_URL = 'http://192.168.x.x:3001/api';
//                        ^^^^^^^^^^^
//                        Your laptop's actual LAN IP
```

Then:

```bash
cd frontend
npm install
npx expo start
# Scan QR code with Expo Go on your phone
```

---

## API Reference

| Method | Endpoint              | Response                         |
|--------|-----------------------|----------------------------------|
| GET    | `/health`             | `{ status: "ok" }`               |
| GET    | `/api/products`       | `{ data: Product[], count: n }`  |
| GET    | `/api/products/:id`   | `{ data: Product }`              |

### Product shape

```ts
{
  id:          number
  name:        string
  price:       string        // e.g. "649.00"
  description: string
  imageUrl:    string        // aliased from image_url
  category:    string
  createdAt:   string        // ISO 8601 UTC
}
```

---

## Cart Behaviour

- Cart is persisted to `AsyncStorage` under the key `@hxni/cart`
- Re-adding a product already in the cart **increments its quantity**
- On success: medium haptic impact + animated slide-up toast
- Cart survives app restarts (AsyncStorage is non-volatile)

---

## Notes

- The backend binds to `0.0.0.0` so it accepts connections from any network interface — required for Expo Go on a physical phone
- `android.usesCleartextTraffic: true` and `NSAllowsArbitraryLoads: true` in `app.json` allow HTTP connections to your local dev server. **Remove these before shipping to production and switch to HTTPS.**
- Fonts fall back gracefully to system fonts if `expo-google-fonts` packages fail to load (e.g. on first run before cache warms)

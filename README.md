# Dorada Jewelry - متجر دورادا للمجوهرات

A complete Arabic e-commerce platform for luxury jewelry with admin panel, order management, Telegram bot integration, wishlist, and multi-image product gallery.

## 🚀 Features

### For Customers:
- Browse products by category
- View product details with **multiple image gallery**
- Add to cart and manage quantities
- **Wishlist** - save products for later
- Complete checkout with customer details
- View order confirmation
- **Contact section** with Instagram link
- Free shipping

### For Admin:
- **Secure first-time setup** - create your own admin credentials
- Add/Edit/Delete products with **multiple image upload**
- **SKU codes** for each product (visible only to admin)
- **Stock/quantity management** - track inventory
- Manage categories
- View all orders with **SKU codes** for easy warehouse lookup
- Update order status
- **Telegram bot notifications** for new orders
- Dashboard with order statistics

## 📋 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Storage:** LocalStorage (client-side)
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Security:** XSS protection, input validation, password hashing

## 🔐 First-Time Admin Setup

### Step 1: Access the Setup Page
1. Go to `/admin/setup`
2. Create your admin username and password
3. **Important:** Remember these credentials!

### Step 2: Login
1. Go to `/admin`
2. Enter your username and password
3. You're now in the admin dashboard!

## 🛠️ How to Edit Website Text

All text in the website is in Arabic. To edit any text:

### 1. Shop Page Text
File: `src/pages/shop/Shop.tsx`

Look for text like:
```tsx
<h1 className="font-serif text-4xl...">
  مجوهرات <span className="gold-text">فاخرة</span>
</h1>
<p className="text-dorada-cream/60...">
  اكتشف تشكيلتنا الرائعة...
</p>
```

### 2. Product Detail Page Text
File: `src/pages/shop/ProductDetail.tsx`

Edit features list:
```tsx
{[
  'جودة عالية',
  'ضمان مدى الحياة',
  'شحن مجاني',
  'إرجاع سهل',
].map((feature, index) => (
```

### 3. Contact Section
File: `src/pages/shop/Shop.tsx` (around line 200)

Edit Instagram link:
```tsx
<a href="https://instagram.com/dorada_accessories" ...>
```

Edit phone number:
```tsx
<p className="text-dorada-cream/60">0770-123-4567</p>
```

### 4. Admin Dashboard Text
File: `src/pages/admin/AdminDashboard.tsx`

All admin interface text is here.

## 🤖 Telegram Bot Setup

### Step 1: Create a Bot
1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow instructions and choose a name
4. Copy the **Bot Token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Chat ID
1. Search for **@userinfobot**
2. Send any message
3. The bot will reply with your Chat ID (looks like: `123456789`)

### Step 3: Configure in Admin Dashboard
1. Login to admin panel
2. Go to **Settings**
3. Enter Bot Token and Chat ID
4. Enable notifications
5. Click **Test Connection**
6. You should receive a test message in Telegram

## 📱 How to Add Products

### Adding a New Product:
1. Login to admin panel
2. Go to **Products** tab
3. Click **"إضافة منتج"** (Add Product)
4. Fill in the details:
   - **Name (Arabic & English):** Product name
   - **SKU Code:** Unique code for warehouse (e.g., `DOR-RNG-001`)
   - **Price:** In Iraqi Dinar (IQD)
   - **Original Price:** For showing discount (optional)
   - **Quantity:** Stock count
   - **Category:** Select from dropdown
   - **Images:** Upload multiple images (first one is main)
   - **Description:** Product details
   - **Featured:** Check to show on homepage
5. Click **"إضافة المنتج"**

### Managing Stock:
- When quantity = 0, product shows "نفذت الكمية" (Out of Stock)
- Customers cannot add out-of-stock items to cart
- When an order is placed, quantity automatically decreases

## 🖼️ Image Upload

### Supported Formats:
- JPG/JPEG
- PNG
- WebP

### Max Size:
- 5MB per image

### Multiple Images:
- Upload as many images as needed
- First image is the main/featured image
- Customers can swipe/click to view all images
- Drag to reorder images in admin

## 💱 Currency

All prices are displayed in **Iraqi Dinar (IQD)** with English numerals.

Example: `2,750,000 IQD`

To change currency, edit `src/services/database.ts`:
```typescript
export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat('en-US').format(price);
  return `${formatted} YOUR_CURRENCY`;
};
```

## 📝 Default Categories

- القلائد (Necklaces)
- الأساور (Bracelets)
- الخواتم (Rings)
- الأقراط (Earrings)
- الساعات (Watches)
- الطقم (Sets)

## 🎨 Colors

- Primary Blue: `#2E4A6B`
- Gold Accent: `#D4AF37`
- Cream Text: `#F5F0E6`

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop
- Tablet
- Mobile devices

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment to Vercel

### Step 1: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Website
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository OR drag and drop the project folder
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Deploy"

### Step 3: Environment Variables (Optional)
No environment variables are required for basic functionality.

## 📁 Project Structure

```
src/
├── components/
│   ├── ToastContainer.tsx    # Toast notifications
│   └── ImageGallery.tsx      # Multi-image gallery
├── pages/
│   ├── admin/
│   │   ├── AdminSetup.tsx    # First-time admin setup
│   │   ├── AdminLogin.tsx    # Admin login
│   │   └── AdminDashboard.tsx # Admin dashboard
│   └── shop/
│       ├── Shop.tsx          # Main shop page
│       ├── ProductDetail.tsx # Product details with gallery
│       ├── Cart.tsx          # Shopping cart
│       ├── Checkout.tsx      # Checkout page
│       └── Wishlist.tsx      # Wishlist page
├── services/
│   ├── database.ts           # Database operations
│   └── telegram.ts           # Telegram bot integration
├── contexts/
│   └── AppContext.tsx        # Global state management
├── types/
│   └── index.ts              # TypeScript types
└── App.tsx                   # Main app component
```

## ⚠️ Important Notes

1. **Data Storage:** All data is stored in the browser's LocalStorage:
   - Data is specific to each browser/device
   - Clearing browser data will reset everything
   - For production, consider using a backend database

2. **Image Storage:** Images are stored as base64 strings:
   - Can be large in size
   - Monitor your LocalStorage usage
   - For production, use a cloud storage service

3. **Concurrent Users:** 
   - LocalStorage doesn't support real-time sync
   - Multiple admins may see outdated data
   - For production, use a backend with database

4. **Admin Security:**
   - Passwords are hashed (basic implementation)
   - Session expires after 24 hours
   - No one can see admin credentials hint anymore

## 🔧 Customization Guide

### Change Instagram Link
Edit `src/pages/shop/Shop.tsx`:
```tsx
<a href="https://instagram.com/YOUR_USERNAME" ...>
```

### Change Phone Number
Edit `src/pages/shop/Shop.tsx`:
```tsx
<p className="text-dorada-cream/60">YOUR_PHONE_NUMBER</p>
```

### Change Address
Edit `src/pages/shop/Shop.tsx`:
```tsx
<p className="text-dorada-cream/60">YOUR_ADDRESS</p>
```

### Add More Features to Product Page
Edit `src/pages/shop/ProductDetail.tsx`:
```tsx
{[
  'جودة عالية',
  'ضمان مدى الحياة',
  'شحن مجاني',
  'إرجاع سهل',
  'YOUR_NEW_FEATURE',  // Add here
].map((feature, index) => (
```

### Change Toast Messages
Edit `src/contexts/AppContext.tsx`:
```typescript
showToast('YOUR_MESSAGE', 'success');
```

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Clear browser cache and LocalStorage
3. Make sure all dependencies are installed

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

**Made with ❤️ for Dorada Jewelry**

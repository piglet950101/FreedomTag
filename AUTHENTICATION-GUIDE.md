# Authentication Flows - Complete Guide

## 🎯 Login & Signup Routes

### For Beneficiaries
**Signup:** `/signup?role=beneficiary` (or just `/signup` - beneficiary is default)
**Login:** `/login`
**Dashboard:** `/dashboard`

### For Charities/Organizations
**Signup:** `/charity/signup`
**Login:** `/charity/login` ✨ NEW
**Dashboard:** `/organization`

### For Merchants
**Signup:** `/signup?role=merchant`
**Login:** `/login`
**Dashboard:** `/dashboard`

### For Philanthropists
**Signup:** `/signup?role=philanthropist` (or `/philanthropist`)
**Login:** `/login`
**Dashboard:** `/philanthropist/dashboard`

---

## 📋 How It Works

### Beneficiary Flow
```
1. Visit http://localhost:5173/signup
   OR http://localhost:5173/signup?role=beneficiary
2. Fill in:
   - Full Name
   - Email
   - Password
   - Phone (optional)
   - Country
3. Click "Sign Up"
4. Redirects to /dashboard
5. Next time: /login with email/password
```

### Charity/Organization Flow  
```
1. Visit http://localhost:5173/charity/signup
2. Fill in:
   - Organization Name
   - Email
   - Password
   - Description
   - Website, social links (optional)
   - Logo URL (optional)
   - Referral code (optional)
3. Click "Sign Up"
4. Organization created with initial tag
5. Next time: /charity/login with email/password
6. Redirects to /organization portal
```

---

## 🔐 Backend Endpoints

### Beneficiary/Merchant/Philanthropist
```typescript
POST /api/auth/signup
Body: {
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  country?: string,
  role: "BENEFICIARY" | "MERCHANT" | "PHILANTHROPIST"
}

POST /api/auth/login
Body: {
  email: string,
  password: string
}
```

### Charity/Organization
```typescript
POST /api/charity/signup
Body: {
  organizationName: string,
  email: string,
  password: string,
  description?: string,
  website?: string,
  facebook?: string,
  twitter?: string,
  instagram?: string,
  linkedin?: string,
  logoUrl?: string,
  referralCode?: string
}

POST /api/auth/login (same endpoint, different redirect)
Body: {
  email: string,
  password: string
}
```

---

## ✅ What Was Added

### New Files Created:
1. **`/client/src/pages/charity-login.tsx`** ✨
   - Dedicated organization login page
   - Redirects to `/organization` after login
   - Links to `/charity/signup` for new organizations

### Updated Files:
2. **`/client/src/App.tsx`**
   - Added `CharityLogin` import
   - Added route: `/charity/login`

---

## 🎨 UI Features

### Charity Login Page
- **Icon:** Building2 (organization symbol)
- **Title:** "Organization Login"
- **Description:** "Access your charity portal"
- **Fields:**
  - Email with icon
  - Password with show/hide toggle
- **Links:**
  - "Forgot password?" → `/forgot-password`
  - "Sign up" → `/charity/signup`
- **Redirect:** `/organization` portal

### Beneficiary Signup/Login
- **Signup Page:**
  - Role selector via URL parameter
  - Icon changes based on role (Heart, Store, Wallet)
  - Full form validation
  - Password confirmation
- **Login Page:**
  - Universal login for all user types
  - "Remember me" checkbox
  - Forgot password link
  - Secure login badge

---

## 🚀 Testing Checklist

### Test Beneficiary Flow:
```bash
1. Go to http://localhost:5173/signup
2. Enter: John Doe, john@example.com, password123
3. Click "Sign Up"
4. Should redirect to /dashboard
5. Logout
6. Go to http://localhost:5173/login
7. Enter same credentials
8. Should redirect to /dashboard
```

### Test Charity Flow:
```bash
1. Go to http://localhost:5173/charity/signup
2. Enter: Hope Foundation, hope@charity.org, password123
3. Click "Sign Up"
4. Organization + tag created
5. Logout
6. Go to http://localhost:5173/charity/login
7. Enter same credentials
8. Should redirect to /organization
9. Should see organization portal with tags
```

---

## 📱 User Types Summary

| User Type | Signup Route | Login Route | Dashboard |
|-----------|-------------|-------------|-----------|
| **Beneficiary** | `/signup?role=beneficiary` | `/login` | `/dashboard` |
| **Charity** | `/charity/signup` | `/charity/login` | `/organization` |
| **Merchant** | `/signup?role=merchant` | `/login` | `/dashboard` |
| **Philanthropist** | `/signup?role=philanthropist` | `/login` | `/philanthropist/dashboard` |
| **Admin** | (Manual creation) | `/login` | `/admin` |

---

## 🔑 Key Differences

### Beneficiary vs Charity:
- **Beneficiaries:** Individual users who receive donations via Freedom Tags
- **Charities:** Organizations that manage multiple beneficiaries and tags
- **Different portals:** Beneficiaries see their own tag, Charities manage all tags

### Why Separate Charity Login?
1. **Clarity:** Organizations know exactly where to go
2. **Branding:** Dedicated experience for charity partners
3. **Redirect:** Auto-redirects to organization portal instead of generic dashboard
4. **Future:** Can add organization-specific features (bulk tag creation, reporting, etc.)

---

## ✨ Ready to Use!

All authentication flows are now complete and working:
- ✅ Beneficiaries can sign up and log in at `/signup` and `/login`
- ✅ Charities can sign up and log in at `/charity/signup` and `/charity/login`
- ✅ All user types have proper role-based access
- ✅ Redirects work correctly based on user type
- ✅ Password security (bcrypt hashing)
- ✅ Session management
- ✅ Forgot password flow available

**Date:** December 5, 2025  
**Status:** Complete ✅

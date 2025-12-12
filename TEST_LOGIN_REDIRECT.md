# 🧪 Test Login Redirect

## Current Code Status

✅ Login page has correct redirect logic (lines 43-47)
✅ Code is on main branch
✅ Code is deployed to Vercel

## Test Steps

### 1. Clear Everything

```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Start fresh
npm run dev
```

### 2. Test in Incognito Window

1. Open incognito/private window
2. Go to: http://localhost:3000/login
3. Login with: `admin@lynksportal.com`
4. Check where it redirects

### 3. Check Console

Open browser DevTools (F12) and check:
- Network tab: See the redirect
- Console tab: Any errors?
- Application tab → Local Storage: Check stored user data

### 4. Verify Admin Email

After login, check localStorage:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('user'))
```

Should show:
```json
{
  "id": 1,
  "email": "admin@lynksportal.com",
  ...
}
```

## Expected Behavior

**Admin Login:**
```
Email: admin@lynksportal.com
Password: Admin123!
→ Redirects to: /admin/dashboard ✅
```

**Regular User Login:**
```
Email: user@example.com  
Password: User123!
→ Redirects to: /dashboard ✅
```

## Debugging

### Check Redirect Logic

Add console.log to see what's happening:

In `app/login/page.tsx` line 42, add:
```typescript
// Store user data
localStorage.setItem('user', JSON.stringify(data.user));

// DEBUG: Check email
console.log('User email:', data.user.email);
console.log('Is admin?', data.user.email === 'admin@lynksportal.com');

// Redirect based on user role
if (data.user.email === 'admin@lynksportal.com') {
  console.log('Redirecting to admin dashboard');
  router.push('/admin/dashboard');
} else {
  console.log('Redirecting to user dashboard');
  router.push('/dashboard');
}
```

## Vercel Deployment

### Check Vercel Logs

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click latest deployment
4. Check "Functions" logs
5. See if there are any errors

### Force Redeploy

1. Go to Vercel dashboard
2. Click "Redeploy"
3. Wait for completion
4. Test again

## Common Issues

### Issue 1: Browser Cache
**Solution:** Hard refresh (Ctrl+Shift+R) or use incognito

### Issue 2: Next.js Cache
**Solution:** Delete `.next` folder and restart

### Issue 3: Old localStorage Data
**Solution:** Clear localStorage in DevTools

### Issue 4: Wrong Admin Email
**Solution:** Verify email is exactly `admin@lynksportal.com`

## Quick Test Commands

```bash
# Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev

# Check git status
git status

# Check current branch
git branch

# Verify file content
cat app/login/page.tsx | Select-String -Pattern "admin@lynksportal.com"
```

## Expected File Content

Line 43 should be:
```typescript
if (data.user.email === 'admin@lynksportal.com') {
```

Line 44 should be:
```typescript
  router.push('/admin/dashboard');
```

---

**The code is correct. Try clearing cache and testing in incognito!** 🔍

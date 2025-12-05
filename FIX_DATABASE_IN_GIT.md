# 🔧 Fix Database File in Git

## ⚠️ Problem

The database file (`lynks-portal.db`) is tracked by Git and causing merge conflicts.

**Database files should NOT be in Git because:**
- They contain user data (changes constantly)
- They're binary files (can't merge)
- They're environment-specific
- They cause merge conflicts

---

## ✅ Immediate Fix

### For the Current Merge:

**Click "Stash changes and continue"**

This will:
- Save database changes temporarily
- Complete the merge
- Your local database stays intact

---

## 🎯 Permanent Fix

### Remove Database from Git (After Merge):

Using **Command Line**:

```bash
cd C:\Users\kevin\lynksportal

# Remove database from Git tracking (keeps local file)
git rm --cached lynks-portal.db
git rm --cached lynks-portal.db-shm
git rm --cached lynks-portal.db-wal

# Commit the removal
git commit -m "Remove database files from Git tracking"

# Push to both branches
git push origin main
git checkout dev
git push origin dev
```

---

### Verify .gitignore

The `.gitignore` already has:
```
# database
*.db
*.db-shm
*.db-wal
```

This is correct! But if the file was already tracked before adding to `.gitignore`, it needs to be removed manually (above).

---

## 🔄 Complete Fix Process

### Step 1: Complete Current Merge
```
Click "Stash changes and continue" in GitHub Desktop
```

### Step 2: Push Main
```
Push origin (in GitHub Desktop)
```

### Step 3: Remove Database from Git
```bash
cd C:\Users\kevin\lynksportal
git rm --cached *.db
git rm --cached *.db-shm
git rm --cached *.db-wal
git commit -m "Remove database files from version control"
git push origin main
```

### Step 4: Do Same on Dev Branch
```bash
git checkout dev
git rm --cached *.db
git rm --cached *.db-shm
git rm --cached *.db-wal
git commit -m "Remove database files from version control"
git push origin dev
```

---

## 💡 Why This Happened

The database file was probably committed before `.gitignore` was properly configured.

**Adding to `.gitignore` doesn't remove already-tracked files!**

You need to:
1. Add to `.gitignore` ✅ (already done)
2. Remove from Git tracking (need to do)

---

## ✅ After the Fix

Once removed from Git:
- ✅ Database stays on your computer
- ✅ Won't be pushed to GitHub
- ✅ Won't cause merge conflicts
- ✅ Each environment has its own database

---

## 🎯 Quick Commands

### Remove Database from Git:
```bash
git rm --cached lynks-portal.db
git commit -m "Remove database from version control"
git push
```

### Check What's Tracked:
```bash
git ls-files | grep .db
```

If this shows nothing, database is successfully removed! ✅

---

## 📋 Summary

### Now:
1. Click "Stash changes and continue"
2. Complete the merge
3. Push to GitHub

### Later (Recommended):
1. Remove database from Git tracking
2. Commit and push
3. Never have this problem again!

---

**For now, just click "Stash changes and continue" to complete your merge!** ✅

The database will stay on your computer, and the merge will complete successfully.

# ⚡ Quick GitHub Commands

## 🚀 First Time Setup (Choose One Method)

### Method 1: GitHub Desktop (EASIEST - Recommended)
1. Download: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository → Browse to `C:\Users\kevin\lynksportal`
4. Click "Publish repository"
5. Done! ✅

---

### Method 2: Command Line
```bash
# Navigate to project
cd C:\Users\kevin\lynksportal

# Initialize git (if needed)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: LYNKS Portal with admin dashboard"

# Create repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR-USERNAME/lynks-portal.git
git branch -M main
git push -u origin main
```

---

## 🔄 Daily Commands (After Initial Setup)

### Save Your Changes:
```bash
# See what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your change description"

# Push to GitHub
git push
```

### One-Liner (Save Everything):
```bash
git add . && git commit -m "Update" && git push
```

---

## 📋 Common Commands

### Check Status:
```bash
git status
```

### See Changes:
```bash
git diff
```

### View History:
```bash
git log --oneline
```

### Undo Last Commit (Keep Changes):
```bash
git reset --soft HEAD~1
```

### Discard All Local Changes:
```bash
git reset --hard
```

### Pull Latest from GitHub:
```bash
git pull
```

---

## 🎯 Your Specific Commands

### First Upload:
```bash
cd C:\Users\kevin\lynksportal
git init
git add .
git commit -m "Initial commit: LYNKS Portal with admin dashboard, user management, and analytics"
git remote add origin https://github.com/YOUR-USERNAME/lynks-portal.git
git branch -M main
git push -u origin main
```

### After Making Changes:
```bash
cd C:\Users\kevin\lynksportal
git add .
git commit -m "Description of what you changed"
git push
```

---

## ✅ What to Do Right Now

1. **Create GitHub Account** (if you don't have one)
   - Go to: https://github.com/signup

2. **Choose Your Method**:
   - **Easy**: Download GitHub Desktop
   - **Advanced**: Use command line

3. **Upload Your Code**:
   - Follow steps above
   - Repository name: `lynks-portal`

4. **Verify**:
   - Check files are on GitHub
   - No database files uploaded
   - README looks good

---

## 🔗 Your Repository URL

After upload, your code will be at:
```
https://github.com/YOUR-USERNAME/lynks-portal
```

Replace `YOUR-USERNAME` with your actual GitHub username!

---

## 💡 Pro Tips

- Commit often (every feature/fix)
- Write clear commit messages
- Pull before you push (if working with others)
- Use branches for big features
- Keep .gitignore updated

---

**Need help? See GITHUB_UPLOAD_GUIDE.md for detailed instructions!** 📚

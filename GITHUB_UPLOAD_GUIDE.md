# 📤 GitHub Upload Guide

## 🎯 Quick Upload Steps

### Option 1: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**
   - Go to: https://desktop.github.com/
   - Install and sign in with your GitHub account

2. **Add Repository**
   - Click "File" → "Add Local Repository"
   - Browse to: `C:\Users\kevin\lynksportal`
   - Click "Add Repository"

3. **Create Repository on GitHub**
   - Click "Publish repository"
   - Name: `lynks-portal`
   - Description: "Business directory and social link management platform"
   - Choose: Private or Public
   - Click "Publish Repository"

4. **Done!** ✅
   - Your code is now on GitHub
   - URL will be: `https://github.com/YOUR-USERNAME/lynks-portal`

---

### Option 2: Using Command Line

1. **Initialize Git** (if not already done)
```bash
cd C:\Users\kevin\lynksportal
git init
```

2. **Add All Files**
```bash
git add .
```

3. **Create First Commit**
```bash
git commit -m "Initial commit: LYNKS Portal with admin dashboard"
```

4. **Create Repository on GitHub**
   - Go to: https://github.com/new
   - Repository name: `lynks-portal`
   - Description: "Business directory and social link management platform"
   - Choose Private or Public
   - **DO NOT** initialize with README (we already have one)
   - Click "Create repository"

5. **Link and Push**
```bash
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/lynks-portal.git
git branch -M main
git push -u origin main
```

6. **Done!** ✅

---

### Option 3: Using VS Code

1. **Open Project in VS Code**
   - Open `C:\Users\kevin\lynksportal` in VS Code

2. **Initialize Git**
   - Click Source Control icon (left sidebar)
   - Click "Initialize Repository"

3. **Stage All Changes**
   - Click "+" next to "Changes" to stage all files

4. **Commit**
   - Enter message: "Initial commit: LYNKS Portal with admin dashboard"
   - Click ✓ (checkmark) to commit

5. **Publish to GitHub**
   - Click "Publish Branch"
   - Choose repository name: `lynks-portal`
   - Choose Private or Public
   - Click "Publish"

6. **Done!** ✅

---

## 📋 What Will Be Uploaded

### ✅ Included Files:
- All source code (`/app`, `/lib`, `/public`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation (`README.md`, `*.md` files)
- Scripts (`/scripts`)
- Git configuration (`.gitignore`)

### ❌ Excluded Files (via .gitignore):
- `/node_modules` - Dependencies (can be reinstalled)
- `/.next` - Build files (regenerated)
- `*.db` - Database files (contains user data)
- `.env*` - Environment variables (sensitive)
- Build artifacts

---

## 🔒 Important: Database Files

Your `.gitignore` is configured to **exclude database files**:
- `*.db`
- `*.db-shm`
- `*.db-wal`

This means:
- ✅ User data stays private
- ✅ No sensitive information uploaded
- ✅ Clean repository
- ❌ Database won't be in GitHub (this is good!)

**Note**: Anyone cloning your repo will need to:
1. Run `npm install`
2. Create their own database (automatic on first run)
3. Seed data if needed

---

## 📝 Repository Details

### Recommended Settings:

**Repository Name**: `lynks-portal`

**Description**: 
```
Business directory and social link management platform with admin dashboard. Built with Next.js, TypeScript, and SQLite.
```

**Topics/Tags** (add these on GitHub):
- `nextjs`
- `typescript`
- `business-directory`
- `linktree-alternative`
- `admin-dashboard`
- `sqlite`
- `tailwindcss`

**Visibility**:
- **Private**: Only you can see it
- **Public**: Anyone can see it (recommended for portfolio)

---

## 🎯 After Upload

### 1. Add Repository Description
On GitHub, click "⚙️ Settings" and add:
- Description
- Website: `https://lynksportal.com`
- Topics

### 2. Create .env.example
Create a template for environment variables:
```bash
# Copy this to .env.local and fill in your values
DATABASE_URL=./lynks-portal.db
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Update README
Add your GitHub username to clone command:
```bash
git clone https://github.com/YOUR-USERNAME/lynks-portal.git
```

### 4. Add License (Optional)
If making public, add a license file.

---

## 🔄 Future Updates

### To Push New Changes:

**Using GitHub Desktop:**
1. Make your changes
2. GitHub Desktop shows changes automatically
3. Write commit message
4. Click "Commit to main"
5. Click "Push origin"

**Using Command Line:**
```bash
git add .
git commit -m "Description of changes"
git push
```

**Using VS Code:**
1. Make changes
2. Click Source Control icon
3. Stage changes (+)
4. Write commit message
5. Click ✓ to commit
6. Click "..." → "Push"

---

## 📊 Repository Structure

Your repository will look like this:

```
lynks-portal/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── business/          # Business pages
│   ├── dashboard/         # User dashboard
│   └── ...
├── lib/                   # Utilities and database
├── public/                # Static assets
├── scripts/               # Database scripts
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── README.md             # Documentation
└── tsconfig.json         # TypeScript config
```

---

## ✅ Verification Checklist

After uploading, verify:

- [ ] Repository created on GitHub
- [ ] All files uploaded (check file count)
- [ ] README displays correctly
- [ ] .gitignore working (no node_modules, no .db files)
- [ ] Repository is Private/Public as intended
- [ ] Description and topics added

---

## 🆘 Troubleshooting

### "Repository already exists"
- Choose a different name, or
- Delete the existing repository first

### "Authentication failed"
- Make sure you're logged into GitHub
- Use GitHub Desktop for easier auth
- Or set up SSH keys

### "Large files detected"
- Check if database files are being uploaded
- Verify .gitignore is working
- Remove large files: `git rm --cached filename`

### "Permission denied"
- Make sure you own the repository
- Check you're logged into correct account

---

## 🎉 Success!

Once uploaded, your repository will be at:
```
https://github.com/YOUR-USERNAME/lynks-portal
```

You can now:
- ✅ Share your code
- ✅ Collaborate with others
- ✅ Track changes
- ✅ Deploy to hosting services
- ✅ Show in your portfolio

---

## 🚀 Next Steps (Optional)

### 1. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Add GitHub Actions
Set up CI/CD for automatic testing and deployment

### 3. Create Branches
```bash
git checkout -b development
git checkout -b feature/new-feature
```

### 4. Invite Collaborators
Settings → Collaborators → Add people

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com
- GitHub Desktop: https://desktop.github.com/
- Git Basics: https://git-scm.com/doc

---

**Ready to upload? Choose your preferred method above!** 🚀

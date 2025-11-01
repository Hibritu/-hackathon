# Git Setup Guide - Push Project to Repository

Follow these steps to push the FishLink project to a Git repository (GitHub, GitLab, etc.).

## Step 1: Initialize Git (if not already done)

```bash
# In the root directory (C:\FishTrace)
git init
```

## Step 2: Add All Files

```bash
# Add all files to staging
git add .

# Or add specific directories
git add Backend/
git add Frontend/
git add README.md
git add .gitignore
```

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: FishLink - Fair, Fresh, and Fully Traceable Fish Marketplace"
```

## Step 4: Create Remote Repository

### Option A: GitHub (Most Common)

1. Go to https://github.com and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it: `FishLink` or `FishTrace`
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Option B: GitLab

1. Go to https://gitlab.com and sign in
2. Click **New project** → **Create blank project**
3. Fill in project name and settings
4. Click **Create project**

## Step 5: Add Remote Repository

```bash
# For GitHub (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# For GitLab
git remote add origin https://gitlab.com/YOUR_USERNAME/REPO_NAME.git

# Verify remote was added
git remote -v
```

## Step 6: Push to Repository

```bash
# Push to main branch
git branch -M main
git push -u origin main

# If you're pushing to master branch instead
git branch -M master
git push -u origin master
```

## Complete Example Commands

```bash
# Navigate to project root
cd C:\FishTrace

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: FishLink - Full stack fish marketplace with QR traceability"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/FishLink.git

# Push
git branch -M main
git push -u origin main
```

## Important Notes

⚠️ **Before Pushing:**

1. **Check `.env` files are ignored** - They contain sensitive information and should NOT be pushed!
   - ✅ Backend/.env should be in .gitignore
   - ✅ Frontend/.env (if exists) should be in .gitignore

2. **Verify .gitignore** - Make sure these are ignored:
   - `node_modules/`
   - `.env` files
   - `dist/` or `build/` folders
   - Log files

3. **Check what you're adding:**
   ```bash
   git status
   ```

## If You Already Have a Repository

If the repository already exists with files:

```bash
# Pull existing files first (if any)
git pull origin main --allow-unrelated-histories

# Then add your files
git add .
git commit -m "Add FishLink project files"
git push origin main
```

## Common Issues

### Issue: Authentication Required
If GitHub/GitLab asks for credentials:

**Solution 1: Use Personal Access Token**
1. GitHub: Settings → Developer settings → Personal access tokens → Generate token
2. Use token as password when prompted

**Solution 2: Use SSH**
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

### Issue: "Updates were rejected"
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

## Creating a GitHub Repository via Command Line

If you have GitHub CLI installed:

```bash
# Install GitHub CLI first (if not installed)
# Then:
gh repo create FishLink --public --source=. --remote=origin --push
```

## Next Steps After Pushing

1. Add a README.md in the root (if not already there)
2. Add repository description and topics
3. Set up GitHub Actions for CI/CD (optional)
4. Add collaborators (if working in a team)

## Security Checklist

Before pushing, ensure:
- [ ] No `.env` files are committed
- [ ] No passwords or API keys in code
- [ ] No database connection strings with real passwords
- [ ] `.gitignore` properly configured
- [ ] Sensitive files are not tracked


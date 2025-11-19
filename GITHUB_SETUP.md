# GitHub Setup Instructions

## ✅ Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Click the "+" icon** (top right) → **"New repository"**
3. **Fill in the details**:
   - **Repository name**: `smart-todo` (or your preferred name)
   - **Description**: `Smart To-Do List App - Ennabl Technical Assignment`
   - **Visibility**: Choose **Public** (so reviewers can access)
   - **⚠️ DO NOT** check "Initialize with README" (we already have one)
   - **⚠️ DO NOT** add .gitignore or license (we already have them)
4. **Click "Create repository"**

## ✅ Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/yashpatel/Documents/Ennabl/smart-todo

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/smart-todo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔐 Authentication

If you're asked for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### How to create a Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: "Smart To-Do App"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

## ✅ Step 3: Verify

After pushing, refresh your GitHub repository page. You should see:
- ✅ All your files
- ✅ README.md
- ✅ Source code
- ✅ Commit message

## 🎉 Done!

Your code is now on GitHub! Share the repository URL with reviewers.

---

**Quick Command Reference:**
```bash
# Check status
git status

# See commits
git log --oneline

# Push updates (after making changes)
git add .
git commit -m "Your commit message"
git push
```


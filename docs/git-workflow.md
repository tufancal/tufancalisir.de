# Git Workflow & Branch Strategy

This document explains the Git workflow for this project, aligned with the dual Cloudflare Pages deployment setup.

## Branch Structure

```
main (production)
  ↑
develop (staging)
  ↑
feature/* branches
fix/* branches
chore/* branches
```

### Branch Purposes

- **`main`** - Production branch
  - Always deployable
  - Contains stable, tested code
  - Triggers production deployment on Cloudflare Pages
  - Protected branch (configure in GitHub settings)

- **`develop`** - Staging/integration branch
  - Integration branch for features
  - Triggers staging deployment on Cloudflare Pages
  - Used for testing and content preview with Storyblok Bridge
  - Semi-protected (can be configured in GitHub settings)

- **Feature branches** - Development branches
  - Named: `feature/description` (e.g., `feature/blog-categories`)
  - Created from `develop`
  - Merged back to `develop` via Pull Request
  - Deleted after merge

- **Fix branches** - Bug fix branches
  - Named: `fix/description` (e.g., `fix/a11y-issues`)
  - Created from `develop` (or `main` for hotfixes)
  - Merged back to source branch via Pull Request

- **Chore branches** - Maintenance branches
  - Named: `chore/description` (e.g., `chore/update-packages`)
  - Created from `develop`
  - Merged back to `develop` via Pull Request

## Workflow Steps

### 1. Starting New Work

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# Work on your feature
# Make commits as you go
git add .
git commit -m "feat: add your feature"
```

### 2. Keeping Your Branch Updated

```bash
# While on your feature branch
git fetch origin
git rebase origin/develop

# Or if you prefer merging
git merge origin/develop
```

### 3. Creating a Pull Request

```bash
# Push your feature branch
git push origin feature/your-feature-name

# Create PR on GitHub
# Target: develop ← feature/your-feature-name
```

**PR Checklist**:
- [ ] Code builds successfully (`npm run build`)
- [ ] Changes tested locally
- [ ] No console errors
- [ ] Descriptive PR title and description

### 4. Merging to Develop

Once PR is approved:
1. Merge PR on GitHub
2. Staging site auto-deploys with your changes
3. Test on staging environment
4. Delete feature branch (GitHub offers this option after merge)

### 5. Releasing to Production

When develop is stable and ready for production:

```bash
# Ensure develop is fully tested on staging
# Create PR: main ← develop

# On GitHub:
# 1. Create Pull Request from develop to main
# 2. Review changes
# 3. Merge to main
# 4. Production auto-deploys
```

**Production Release Checklist**:
- [ ] All features tested on staging
- [ ] Storyblok content published (not just draft)
- [ ] No breaking issues on staging
- [ ] SEO/meta tags verified
- [ ] Performance checked

## Hotfixes (Emergency Production Fixes)

For urgent production bugs:

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b fix/urgent-issue

# Fix the issue
git add .
git commit -m "fix: urgent issue description"

# Push and create PR to main
git push origin fix/urgent-issue

# After merging to main:
# Merge main back to develop to keep them in sync
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## Setting Up Branch Protection on GitHub

### For `main` Branch

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Configure:
   - **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals**: 1 (optional, good practice)
   - ✅ **Require status checks to pass before merging** (if you have CI/CD)
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**
5. Click **Create**

### For `develop` Branch (Optional)

Same steps as main, but you can be less strict:
- **Branch name pattern**: `develop`
- ✅ **Require a pull request before merging**
- Consider skipping approval requirements for solo projects
- Allow yourself to push directly if needed

## Common Commands Reference

```bash
# Switch to develop
git checkout develop

# Update develop from remote
git pull origin develop

# Create new feature branch
git checkout -b feature/name

# Check which branch you're on
git branch

# View commit history
git log --oneline --graph --all

# Delete local branch
git branch -d feature/name

# Delete remote branch
git push origin --delete feature/name

# Sync develop with main (after production release)
git checkout develop
git merge main
git push origin develop
```

## Commit Message Convention

Follow conventional commits for clarity:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

Examples:
- `feat: add dark mode toggle`
- `fix: correct blog post pagination`
- `docs: update deployment guide`
- `chore: update dependencies`

## Current Branch Cleanup

You currently have several branches. Consider:

```bash
# Delete merged feature branches locally
git branch -d feature/blog-categories
git branch -d feature/breadcrumb-jsonld-schema
# ... etc

# Delete merged feature branches remotely
git push origin --delete feature/blog-categories
# ... etc
```

Keep only:
- `main` - production
- `develop` - staging
- Active feature branches you're working on

## Integration with Cloudflare Pages

| Branch | Deploys To | Environment | Content Type |
|--------|------------|-------------|--------------|
| `main` | Production | `production` | Published |
| `develop` | Staging | `staging` | Draft |
| `feature/*` | (not deployed) | - | - |

When you push to these branches:
- **Push to `develop`** → Staging site rebuilds automatically
- **Merge to `main`** → Production site rebuilds automatically

## Storyblok Content Workflow

1. **Create content in Storyblok** (draft mode)
2. **Push code to `develop`** → View on staging with draft content
3. **Test on staging** with Storyblok Bridge enabled
4. **Publish content in Storyblok**
5. **Merge to `main`** → Production site shows published content

## Tips

- Always work on feature branches, never directly on `develop` or `main`
- Keep `develop` and `main` in sync (merge main into develop after releases)
- Delete branches after merging to keep repository clean
- Use descriptive branch and commit names
- Test thoroughly on staging before production releases
- Create small, focused PRs rather than large ones

## Troubleshooting

**"Your branch is behind 'origin/develop'"**:
```bash
git pull origin develop
```

**"Merge conflict"**:
```bash
# After conflict occurs
git status  # See conflicting files
# Edit files to resolve conflicts
git add .
git commit -m "fix: resolve merge conflicts"
```

**"Want to undo last commit"** (not pushed yet):
```bash
git reset --soft HEAD~1  # Keeps changes
# or
git reset --hard HEAD~1  # Discards changes
```

**"Accidentally committed to wrong branch"**:
```bash
git log  # Copy the commit hash
git reset --hard HEAD~1  # Undo the commit
git checkout correct-branch
git cherry-pick <commit-hash>  # Apply commit to correct branch
```

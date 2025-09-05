# Merge Conflict Prevention Strategy

## Overview
This document outlines the process to prevent merge conflicts in our feature branch workflow, established after resolving significant conflicts in PR #7 for Story 2.2.

## Root Causes Identified
1. **Git Repository Corruption**: Malformed ref files with spaces in names (`refs/heads/main 2`)
2. **Stale Feature Branches**: Long-running feature branches without regular main branch synchronization
3. **Parallel Development**: Multiple developers working on overlapping files without coordination

## Prevention Strategies

### 1. Regular Main Branch Synchronization
**Frequency**: Before starting work each day, and before creating PRs

```bash
# Daily routine for developers
git checkout feature/your-branch-name
git fetch origin main
git merge origin/main
# Resolve any conflicts immediately
git push origin feature/your-branch-name
```

### 2. Git Repository Health Monitoring
**Check for corruption indicators**:

```bash
# Run weekly to detect repository issues
git fsck --full
git gc --prune=now
ls -la .git/refs/heads/ # Check for malformed refs
```

**Signs of corruption**:
- Refs with spaces in names
- "fatal: bad object" errors
- Missing or corrupted object files

**Fix corruption**:
```bash
# Remove malformed refs (like 'main 2')
rm ".git/refs/heads/main 2"
# Clean up garbage collection logs
rm -f .git/gc.log
# Repair repository
git fsck --unreachable
```

### 3. Feature Branch Lifecycle Management
**Maximum feature branch age**: 5 working days
**Sync requirements**:
- Sync with main before starting work
- Sync daily if branch is active
- Sync immediately before creating PR

### 4. Pre-PR Checklist
Before creating any pull request:

```bash
# 1. Ensure branch is current with main
git fetch origin main
git merge origin/main

# 2. Verify no conflicts exist
git status
# Should show "nothing to commit, working tree clean"

# 3. Verify build passes
npm run build
npm run type-check  # if available

# 4. Push updated branch
git push origin feature/branch-name

# 5. Create PR
gh pr create --title "..." --body "..."
```

### 5. Team Communication Protocols
- **File Lock Communication**: Notify team when working on shared files
- **Branch Naming**: Use consistent format `feature/story-{epic}.{story}-{description}`
- **Merge Windows**: Coordinate major merges to main during designated times

### 6. Automated Prevention Tools
**GitHub Branch Protection**:
- Require branches to be up to date before merging
- Require status checks to pass
- Restrict direct pushes to main

**Pre-commit Hooks** (recommended):
```bash
#!/bin/bash
# Check if main branch is current
BEHIND=$(git rev-list --count HEAD..origin/main)
if [ $BEHIND -gt 0 ]; then
    echo "Warning: Branch is $BEHIND commits behind main. Consider rebasing."
fi
```

## Conflict Resolution Process

### When Conflicts Occur:
1. **Stop and Assess**: Don't force-push or ignore conflicts
2. **Backup Current Work**: `git stash` or create backup branch
3. **Fetch Latest**: `git fetch origin main`
4. **Merge with Strategy**: `git merge origin/main` (never rebase public branches)
5. **Resolve Methodically**: Handle each conflict file individually
6. **Test Thoroughly**: Run build and tests after resolution
7. **Document Changes**: Clear commit messages explaining resolution

### File-Specific Strategies:
- **Package.json**: Always prefer main branch dependencies unless feature-specific
- **Config Files**: Main branch takes precedence unless feature modifies config
- **Type Files**: Merge both changes, ensuring compatibility
- **Component Files**: Preserve feature functionality while incorporating main updates

## Emergency Procedures

### Repository Corruption:
```bash
# 1. Identify corruption
git status  # Look for warnings about bad refs

# 2. Clean malformed refs
find .git/refs -name "* *" -delete  # Remove refs with spaces

# 3. Repair repository
git fsck --full --unreachable
git gc --aggressive --prune=now

# 4. Verify integrity  
git status  # Should be clean
```

### Irresolvable Conflicts:
1. Create new branch from current main
2. Cherry-pick clean commits from feature branch
3. Manually reapply conflicting changes
4. Close original PR and create new one

## Monitoring and Metrics
- **Conflict Rate**: Track PRs with merge conflicts
- **Resolution Time**: Monitor time to resolve conflicts
- **Repository Health**: Weekly corruption checks
- **Branch Age**: Alert for branches >5 days old

## Training Requirements
All developers must:
1. Understand Git conflict resolution
2. Know repository corruption signs and fixes
3. Follow daily sync routine
4. Use proper branch naming conventions

## Review and Updates
This document will be reviewed monthly and updated based on:
- New conflict patterns
- Tool improvements
- Team feedback
- Industry best practices

---
*Last Updated*: September 5, 2025  
*Next Review*: October 5, 2025  
*Document Owner*: Development Team Lead
# Branch Protection Rules

## Main Branch Protection
Configure these settings in GitHub repository settings:

1. Navigate to Settings > Branches
2. Click "Add rule" next to "Branch protection rules"
3. For "Branch name pattern" enter: `main`

### Required Settings:
- ✓ Require pull request reviews before merging
  - ✓ Require 1 approval
  - ✓ Dismiss stale pull request approvals when new commits are pushed
  
- ✓ Require status checks to pass before merging
  - ✓ Require branches to be up to date before merging
  - Required status checks:
    - build (GitHub Actions)
    
- ✓ Require signed commits

- ✓ Include administrators

## Development Branch
For `dev` branch (create if not exists):

- ✓ Require pull request reviews before merging
  - ✓ Require 1 approval
  
- ✓ Require status checks to pass before merging
  - build (GitHub Actions)

## Feature Branches
Naming convention: `feature/*`
Example: `feature/add-trading-view`

These branches should:
1. Branch off from: `dev`
2. Merge back into: `dev`

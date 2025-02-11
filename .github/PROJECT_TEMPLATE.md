# Project Board Template

## Columns

### 📋 Backlog
New issues and feature requests that need to be triaged.

### 🎯 To Do
Approved and prioritized work items ready for development.

### 🏗️ In Progress
Items currently being worked on.

### 👀 Review
Pull requests awaiting review and items needing verification.

### ✅ Done
Completed and deployed items.

## Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: Urgent fixes/features
- `priority: medium`: Important but not urgent
- `priority: low`: Nice to have

## Automation

### When issues are:
- Created → Move to Backlog
- Assigned → Move to To Do
- Branch created → Move to In Progress
- PR opened → Move to Review
- PR merged → Move to Done

### When PRs are:
- Created → Move to Review
- Merged → Move linked issues to Done
- Closed → Move back to To Do

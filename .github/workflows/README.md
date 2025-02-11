# GitHub Pages Deployment

This repository is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

## Deployment URL
The application will be available at: https://udai111.github.io/trg11fin/

## Configuration
- Deployment source: GitHub Actions
- Build directory: dist/public
- Branch: gh-pages (automatically created)

## Manual Deployment
You can also manually trigger the deployment from the Actions tab in the repository.

## Environment Variables
Make sure the following secrets are set in your repository settings:
- DATABASE_URL: Your database connection string
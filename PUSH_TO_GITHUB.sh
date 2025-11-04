#!/bin/bash

# Replace YOUR-USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR-USERNAME"

cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Remove old CodeCommit remote
git remote remove origin 2>/dev/null || true

# Add GitHub remote
git remote add origin https://github.com/$GITHUB_USERNAME/ruuvitag-test-drive-tracker.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo "📦 Repository: https://github.com/$GITHUB_USERNAME/ruuvitag-test-drive-tracker"
echo ""
echo "Next steps:"
echo "1. Go to https://railway.app/"
echo "2. Login with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select 'ruuvitag-test-drive-tracker'"

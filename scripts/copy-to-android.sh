#!/bin/bash

# Build the React app
echo "Building React app..."
npm run build

# Create assets directory if it doesn't exist
echo "Creating Android assets directory..."
mkdir -p android/app/src/main/assets

# Copy build files to Android assets
echo "Copying build files to Android assets..."
cp -r dist/* android/app/src/main/assets/

echo "Done! The app is ready for offline use in Android." 
#!/bin/bash
# Frontend deployment script for Render.com

echo "🚀 Building Wave Frontend..."

# Install dependencies
npm install

# Build the project
npm run build

echo "✅ Build completed! Files are in ./build directory"
echo "📁 Publish Directory should be set to: build"

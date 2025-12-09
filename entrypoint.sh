#!/bin/sh

# Run migrations
echo "Running Prisma Migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting Next.js..."
exec node server.js

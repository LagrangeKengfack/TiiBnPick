#!/bin/bash

# Base URL
API_URL="http://localhost:8081"

# Admin Credentials
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="password"

# 1. Login as Admin to get token
echo "Logging in as Admin..."
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}" | jq -r '.token')

if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to login as admin."
  exit 1
fi
echo "Admin Token obtained."

# 2. Fetch All Clients
echo "Fetching all clients..."
CLIENTS_RESPONSE=$(curl -s -X GET "$API_URL/api/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Clients Response:"
echo "$CLIENTS_RESPONSE" | jq '.'

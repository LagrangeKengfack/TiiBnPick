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

# 2. Register a new Delivery Person
echo "Registering new Delivery Person..."
TIMESTAMP=$(date +%s)
EMAIL="test.delivery.$TIMESTAMP@example.com"
PHONE="6$(date +%s | tail -c 8)" # Generate random phone starting with 6
NIU_PHOTO_BASE64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgDNjd8qAAAAAElFTkSuQmCC"

REGISTER_PAYLOAD=$(cat <<EOF
{
  "firstName": "Test",
  "lastName": "User",
  "email": "$EMAIL",
  "phone": "$PHONE",
  "password": "password123",
  "nationalId": "1234567890",
  "commercialName": "Test Delivery",
  "commercialRegister": "12345",
  "siret": 12345.0,
  "commissionRate": 10.0,
  "nui": "NUI123456",
  "nuiPhoto": "$NIU_PHOTO_BASE64",
  "plateNumber": "LT123AB",
  "logisticsType": "MOTORBIKE",
  "logisticsClass": "STANDARD",
  "street": "Test Street",
  "city": "Test City",
  "district": "Test District",
  "country": "Test Country",
  "description": "Test Description"
}
EOF
)

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/delivery-persons/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD")

DP_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.deliveryPersonId')

if [ "$DP_ID" == "null" ] || [ -z "$DP_ID" ]; then
  echo "Registration failed."
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi
echo "Registered successfully. ID: $DP_ID"

# 3. Fetch Details as Admin
echo "Fetching details for ID: $DP_ID..."
DETAILS_RESPONSE=$(curl -s -X GET "$API_URL/api/admin/delivery-persons/$DP_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

# 4. Check NUI Photo
NUI_PHOTO=$(echo "$DETAILS_RESPONSE" | jq -r '.nuiPhoto')
echo "NUI Photo in response: $NUI_PHOTO"

if [ "$NUI_PHOTO" == "null" ]; then
  echo "FAILURE: NUI Photo is null."
elif [[ "$NUI_PHOTO" == "uploads/images/niu_"* ]]; then
  echo "SUCCESS: NUI Photo is present and has correct prefix."
else
  echo "WARNING: NUI Photo is '$NUI_PHOTO'. Expected path starting with 'uploads/images/niu_'"
fi

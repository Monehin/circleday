#!/bin/bash
#
# Temporal Certificate Encoder
# This script properly encodes your Temporal Cloud certificates for Vercel/environment variables
#

set -e

echo "🔐 Temporal Certificate Encoder"
echo "================================"
echo ""

# Check if certificate files are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: ./encode-temporal-certs.sh <certificate.pem> <private-key.pem>"
    echo ""
    echo "Example:"
    echo "  ./encode-temporal-certs.sh ~/Downloads/ca.pem ~/Downloads/ca.key"
    echo ""
    exit 1
fi

CERT_FILE="$1"
KEY_FILE="$2"

# Check if files exist
if [ ! -f "$CERT_FILE" ]; then
    echo "❌ Error: Certificate file not found: $CERT_FILE"
    exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file not found: $KEY_FILE"
    exit 1
fi

echo "📄 Certificate file: $CERT_FILE"
echo "🔑 Key file: $KEY_FILE"
echo ""

# Encode certificate (remove all newlines and spaces)
echo "🔄 Encoding certificate..."
CERT_BASE64=$(cat "$CERT_FILE" | base64 | tr -d '\n\r ')

# Encode key (remove all newlines and spaces)
echo "🔄 Encoding private key..."
KEY_BASE64=$(cat "$KEY_FILE" | base64 | tr -d '\n\r ')

# Verify they're valid base64
echo "✅ Validating encoding..."
echo "$CERT_BASE64" | base64 -d > /dev/null 2>&1 || {
    echo "❌ Error: Failed to encode certificate properly"
    exit 1
}
echo "$KEY_BASE64" | base64 -d > /dev/null 2>&1 || {
    echo "❌ Error: Failed to encode key properly"
    exit 1
}

echo "✅ Encoding successful!"
echo ""
echo "================================"
echo "📋 Copy these values to Vercel:"
echo "================================"
echo ""

echo "1️⃣  TEMPORAL_CLIENT_CERT"
echo "   (Copy everything below, no spaces/newlines)"
echo ""
echo "$CERT_BASE64"
echo ""
echo "--------------------------------"
echo ""

echo "2️⃣  TEMPORAL_CLIENT_KEY"
echo "   (Copy everything below, no spaces/newlines)"
echo ""
echo "$KEY_BASE64"
echo ""
echo "--------------------------------"
echo ""

# Save to files for easy copying
CERT_OUTPUT="temporal-cert.base64.txt"
KEY_OUTPUT="temporal-key.base64.txt"

echo "$CERT_BASE64" > "$CERT_OUTPUT"
echo "$KEY_BASE64" > "$KEY_OUTPUT"

echo "💾 Also saved to files:"
echo "   - $CERT_OUTPUT"
echo "   - $KEY_OUTPUT"
echo ""

# Copy to clipboard if possible (macOS)
if command -v pbcopy > /dev/null 2>&1; then
    echo "📋 Certificate copied to clipboard!"
    echo "$CERT_BASE64" | pbcopy
    echo ""
    echo "   Paste it in Vercel, then run this again for the key."
    echo ""
fi

echo "✅ Done! Your certificates are ready for Vercel."
echo ""


#!/usr/bin/env bash
# Replaces the G-XXXXXXXXXX placeholder with your real GA4 Measurement ID
# in every page of the ZimShop site.
#
# Usage:
#   ./set-ga-id.sh G-ABC123XYZ
#
# Get the ID from GA4:  Admin -> Data collection and modification -> Data streams
#                       -> click your web stream -> "Measurement ID" (top right)

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 G-XXXXXXXXXX" >&2
  echo "Example: $0 G-ABC123XYZ" >&2
  exit 1
fi

NEW_ID="$1"

# GA4 Measurement IDs look like G- followed by uppercase letters/digits.
if ! printf '%s' "$NEW_ID" | grep -Eq '^G-[A-Z0-9]{6,}$'; then
  echo "Error: '$NEW_ID' is not a valid GA4 Measurement ID (expected format G-XXXXXXXXXX)." >&2
  exit 1
fi

if printf '%s' "$NEW_ID" | grep -q 'XXXX'; then
  echo "Error: that still looks like the placeholder, not a real ID." >&2
  exit 1
fi

cd "$(dirname "$0")"

FILES=(index.html products.html product.html cart.html checkout.html confirmation.html)
FOUND=0

for f in "${FILES[@]}"; do
  [ -f "$f" ] || continue
  if grep -q 'G-XXXXXXXXXX' "$f"; then
    # macOS/BSD sed needs the empty -i argument; GNU sed does not.
    if sed --version >/dev/null 2>&1; then
      sed -i "s/G-XXXXXXXXXX/${NEW_ID}/g" "$f"
    else
      sed -i '' "s/G-XXXXXXXXXX/${NEW_ID}/g" "$f"
    fi
    echo "updated: $f"
    FOUND=$((FOUND + 1))
  else
    echo "no placeholder left in: $f (already set?)"
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo
  echo "Nothing was updated. Either the ID was already set, or the placeholder is gone."
  echo "Current IDs found:"
  grep -ho 'G-[A-Z0-9]\{6,\}' ./*.html 2>/dev/null | sort -u || echo "  (none)"
  exit 0
fi

echo
echo "Done. Measurement ID $NEW_ID is now in $FOUND page(s)."
echo "Next: commit and push so GitHub Pages publishes the change:"
echo "  git add -A && git commit -m \"Add Google Analytics tracking\" && git push"
echo
echo "Then open your site, wait ~1 minute, and check GA4 -> Reports -> Realtime."

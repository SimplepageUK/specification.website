#!/usr/bin/env bash
#
# Publish DNS-AID (DNS for AI Discovery) records on specification.website.
# Reference: draft-mozleywilliams-dnsop-dnsaid (IETF) + RFC 9460 (SVCB/HTTPS).
#
# Records created:
#   _index._agents.specification.website  HTTPS  1 specification.website. alpn="h3,h2" port=443
#   _mcp._agents.specification.website    HTTPS  1 mcp.specification.website. alpn="h3,h2" port=443 mandatory="alpn,port"
#
# Optional (when ENABLE_DNSSEC=1): enable DNSSEC on the zone via API. Note that
# if specification.website is at an external registrar, the DS record returned
# in the API response still has to be copied to the registrar by hand.
#
# Usage:
#   CLOUDFLARE_API_TOKEN=... ./scripts/publish-dns-aid.sh
#   CLOUDFLARE_API_TOKEN=... ENABLE_DNSSEC=1 ./scripts/publish-dns-aid.sh
#
# Required token scopes: Zone:DNS:Edit on specification.website.
# Optional (for DNSSEC):  Zone:Zone:Read + Zone:DNSSEC:Edit.

set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN to a token with Zone:DNS:Edit on specification.website}"

ZONE="specification.website"
API="https://api.cloudflare.com/client/v4"
H_AUTH="Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
H_TYPE="Content-Type: application/json"

# Resolve zone ID
echo "→ Looking up zone ID for ${ZONE}…"
ZONE_ID=$(curl -sS -H "${H_AUTH}" "${API}/zones?name=${ZONE}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['result'][0]['id']) if d.get('result') else sys.exit('zone not found')")
echo "  zone_id=${ZONE_ID}"

create_record() {
  local name=$1 target=$2 mandatory=$3
  local content
  if [[ -n "${mandatory}" ]]; then
    content="1 ${target}. alpn=\"h3,h2\" port=443 mandatory=\"${mandatory}\""
  else
    content="1 ${target}. alpn=\"h3,h2\" port=443"
  fi
  echo "→ Creating HTTPS ${name}.${ZONE} → ${target}…"
  curl -sS -X POST "${API}/zones/${ZONE_ID}/dns_records" \
    -H "${H_AUTH}" -H "${H_TYPE}" \
    --data "$(python3 -c "import json,sys; print(json.dumps({'type':'HTTPS','name':sys.argv[1],'content':sys.argv[2],'ttl':3600,'comment':'DNS-AID — agent discovery'}))" "${name}" "${content}")" \
    | python3 -c "
import json,sys
d=json.load(sys.stdin)
if d.get('success'):
    r=d['result']
    print(f\"  ✓ {r['name']} {r['type']} {r['content']}\")
else:
    for e in d.get('errors', []):
        print(f\"  ✗ [{e.get('code')}] {e.get('message')}\")
    sys.exit(1)
"
}

create_record "_index._agents" "specification.website" ""
create_record "_mcp._agents"   "mcp.specification.website" "alpn,port"

if [[ "${ENABLE_DNSSEC:-0}" == "1" ]]; then
  echo "→ Enabling DNSSEC on the zone…"
  curl -sS -X PATCH "${API}/zones/${ZONE_ID}/dnssec" \
    -H "${H_AUTH}" -H "${H_TYPE}" \
    --data '{"status":"active"}' \
  | python3 -c "
import json,sys
d=json.load(sys.stdin)
if not d.get('success'):
    for e in d.get('errors', []):
        print(f\"  ✗ [{e.get('code')}] {e.get('message')}\")
    sys.exit(1)
r=d['result']
print(f\"  ✓ DNSSEC status: {r.get('status')}\")
ds=r.get('ds')
if ds:
    print(\"\\n  DS record (copy to your registrar if specification.website is not at Cloudflare Registrar):\")
    print(f\"    {ds}\")
key=r.get('key_tag')
if key is not None:
    print(f\"  Key tag: {key}; Algorithm: {r.get('algorithm')}; Digest type: {r.get('digest_type')}; Digest: {r.get('digest')}\")
"
fi

echo
echo "Done. Verify with:"
echo "  dig +short HTTPS _index._agents.${ZONE}"
echo "  dig +short HTTPS _mcp._agents.${ZONE}"
echo "  dig +short DS ${ZONE}"
echo
echo "Then re-run the agent-readiness scan:"
echo "  curl -sX POST https://isitagentready.com/api/scan -H 'Content-Type: application/json' \\"
echo "    -d '{\"url\":\"https://${ZONE}\"}' | python3 -c \"import json,sys; print(json.load(sys.stdin)['checks']['discoverability']['dnsAid'])\""

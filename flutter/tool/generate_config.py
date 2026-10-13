"""Create ignored Flutter configuration from public values only. Never dump .env."""
import argparse
import json
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--emulator", action="store_true", help="Use local Next.js on Android emulator")
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
values = {}
allowed = {"NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"}
for filename in (".env", ".env.local"):
    path = root / filename
    if not path.exists():
        continue
    for line in path.read_text().splitlines():
        key, sep, value = line.partition("=")
        if sep and key.strip() in allowed:
            values[key.strip()] = value.strip().strip("\"'")
config = {"SUPABASE_URL": values.get("NEXT_PUBLIC_SUPABASE_URL", ""), "SUPABASE_PUBLISHABLE_KEY": values.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", ""), "API_BASE_URL": "http://10.0.2.2:3000" if args.emulator else "https://www.barlabs.my.id"}
if not all(config.values()):
    raise SystemExit("Missing public Supabase settings; fill config.example.json manually instead.")
key = config["SUPABASE_PUBLISHABLE_KEY"]
if not key.startswith("sb_publishable_"):
    import base64
    try:
        claims = json.loads(base64.urlsafe_b64decode(key.split(".")[1] + "=="))
        assert claims.get("role") == "anon"
    except Exception:
        raise SystemExit("Refusing a non-public Supabase key.") from None
output = root / "flutter" / ("config.emulator.json" if args.emulator else "config.local.json")
output.write_text(json.dumps(config, indent=2) + "\n")
output.chmod(0o600)
print(f"Public configuration written to {output.name}; values not printed.")

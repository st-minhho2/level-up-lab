# Shared by the hook scripts. Source only. Bash 3.2 compatible (macOS default); JSON parsed with node.
# Reads the hook payload from stdin once into HOOK_JSON and exposes json_field <dotted.path>.
HOOK_JSON="$(cat)"
json_field() {
  printf '%s' "$HOOK_JSON" | node -e '
    const path = process.argv[1].split(".");
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk)).on("end", () => {
      try {
        let value = JSON.parse(data);
        for (const key of path) value = value?.[key];
        process.stdout.write(value === undefined || value === null ? "" : String(value));
      } catch {
        process.stdout.write("");
      }
    });' "$1"
}
block() { # block <script-name> <reason>
  echo "BLOCKED by .claude/hooks/$1: $2" >&2
  exit 2
}

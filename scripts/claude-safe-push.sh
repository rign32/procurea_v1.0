#!/usr/bin/env bash
# Safer push for parallel Claude Code sessions.
# Fetches, rebases, runs basic checks, then pushes. Fails loudly on conflict
# so you never force-push or overwrite another session's work.
#
# Usage: ./scripts/claude-safe-push.sh [remote] [branch]

set -e
cd "$(git rev-parse --show-toplevel)"

REMOTE="${1:-origin}"
BRANCH="${2:-$(git rev-parse --abbrev-ref HEAD)}"

if [ "$BRANCH" = "main" ]; then
  echo "❌ Don't push directly to main. Merge from staging after acceptance."
  exit 1
fi

echo "→ Fetching $REMOTE..."
git fetch "$REMOTE" --quiet

BEHIND=$(git rev-list --count "HEAD..$REMOTE/$BRANCH" 2>/dev/null || echo "0")

if [ "$BEHIND" != "0" ]; then
  echo "→ $BEHIND new commits on $REMOTE/$BRANCH — rebasing..."
  if ! git rebase "$REMOTE/$BRANCH"; then
    echo ""
    echo "❌ Rebase conflict. Resolve manually:"
    echo "   git status"
    echo "   # fix conflicted files"
    echo "   git add <files>"
    echo "   git rebase --continue"
    echo ""
    echo "   Or abort: git rebase --abort"
    exit 1
  fi
  echo "  ✓ Rebased cleanly"
fi

# --- Basic sanity before push -------------------------------------------
if git diff --quiet HEAD; then
  :
else
  echo "❌ Working tree not clean — commit or stash first"
  exit 1
fi

echo "→ Pushing $BRANCH to $REMOTE..."
git push "$REMOTE" "$BRANCH"

echo ""
echo "✓ Pushed. CI will trigger if the change touched non-ignored paths."
if command -v gh >/dev/null 2>&1; then
  sleep 3
  gh run list --limit 1 --branch "$BRANCH" --json status,displayTitle --jq '.[0] | "  → CI: \(.status)  \(.displayTitle)"' 2>/dev/null || true
fi

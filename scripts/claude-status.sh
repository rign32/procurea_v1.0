#!/usr/bin/env bash
# Quick overview of repo state for parallel Claude Code sessions.
# Run at the start of any new task to see what other sessions are doing
# before you edit files.
#
# Usage: ./scripts/claude-status.sh

set -e
cd "$(git rev-parse --show-toplevel)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Procurea — session status ($(date +%H:%M))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Branch:   $BRANCH"

# --- Sync with origin -----------------------------------------------------
git fetch origin --quiet 2>/dev/null || echo "  (fetch failed — offline?)"
AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo "?")
BEHIND=$(git rev-list --count "HEAD..origin/$BRANCH" 2>/dev/null || echo "?")
echo "Origin:   ahead=$AHEAD  behind=$BEHIND"
if [ "$BEHIND" != "0" ] && [ "$BEHIND" != "?" ]; then
  echo "          ↓ Another session pushed — run 'git pull --rebase' before editing"
fi

# --- Uncommitted work (potentially from OTHER sessions) ------------------
UNCOMMITTED=$(git status --short | wc -l | tr -d ' ')
UNTRACKED=$(git status --short | grep -c "^??" || true)
MODIFIED=$(git status --short | grep -c "^ M\|^M " || true)
DELETED=$(git status --short | grep -c "^ D\|^D " || true)

echo ""
echo "Working tree:"
echo "  uncommitted:  $UNCOMMITTED  (modified=$MODIFIED, deleted=$DELETED, untracked=$UNTRACKED)"

if [ "$UNCOMMITTED" -gt "10" ]; then
  echo "          ⚠️  $UNCOMMITTED uncommitted files — likely WIP from OTHER sessions"
  echo "          Run 'git status' to see them. Do NOT 'git add .' — stage specific files only."
fi

# --- Recent commits on origin (what other sessions just pushed) ----------
echo ""
echo "Recent on origin/$BRANCH (last hour):"
git log "origin/$BRANCH" --since="1 hour ago" --pretty=format:"  %h %s (%cr)" 2>/dev/null | head -10
echo ""

# --- Active CI run --------------------------------------------------------
if command -v gh >/dev/null 2>&1; then
  echo ""
  echo "Latest CI run on $BRANCH:"
  gh run list --limit 1 --branch "$BRANCH" --json status,conclusion,displayTitle,headSha --jq '.[0] | "  \(.status) \(.conclusion // "—") [\(.headSha[0:7])] \(.displayTitle)"' 2>/dev/null || echo "  (gh CLI query failed)"
fi

# --- Stashes --------------------------------------------------------------
STASHES=$(git stash list | wc -l | tr -d ' ')
echo ""
echo "Stashes:  $STASHES"
if [ "$STASHES" -gt "5" ]; then
  echo "          ⚠️  Stashes are accumulating — review with 'git stash list'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Tips:"
echo "  • NEVER 'git add .' — stage by name only"
echo "  • Sync before edit: git fetch && git pull --rebase"
echo "  • Commit often, small scope"
echo "  • See docs/multisession-workflow.md for full rules"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

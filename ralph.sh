#!/bin/bash
set -euo pipefail

# Exit codes: 0=COMPLETE, 1=NEEDS_HUMAN_REVIEW, 2=max iterations, 3=consecutive failures

BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
CYAN="\033[36m"
RESET="\033[0m"

check_dependencies() {
  local missing=()
  for cmd in claude jq; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done

  if (( ${#missing[@]} > 0 )); then
    printf "${RED}Missing dependencies: ${missing[*]}${RESET}\n"
    [[ " ${missing[*]} " == *" jq "* ]] && echo "  brew install jq"
    [[ " ${missing[*]} " == *" claude "* ]] && echo "  curl -fsSL https://claude.ai/install.sh | bash"
    exit 1
  fi
}

check_dependencies

FEATURE_NAME=""
MAX_ITERATIONS=100
MODEL=""
SUBAGENT_MODEL="sonnet"
PERMISSION_MODE="bypassPermissions"

usage() {
  cat <<EOF
Usage: $(basename "$0") <feature-name> [options]

Arguments:
  feature-name              Feature name in kebab-case (matches prds/<name>)

Options:
  -n, --max-iterations NUM  Maximum loop iterations (default: $MAX_ITERATIONS)
  -m, --model MODEL         Claude model for orchestrator (default: system default)
  -s, --subagent-model MODEL  Model for subagents (default: $SUBAGENT_MODEL)
  -p, --permissions MODE    Permission mode (default: $PERMISSION_MODE)
  -h, --help                Show this help message

Examples:
  $(basename "$0") light
  $(basename "$0") light -n 20
  $(basename "$0") light -n 10 -s opus
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case $1 in
    -n|--max-iterations) MAX_ITERATIONS="$2";    shift 2 ;;
    -m|--model)          MODEL="$2";            shift 2 ;;
    -s|--subagent-model) SUBAGENT_MODEL="$2";   shift 2 ;;
    -p|--permissions)    PERMISSION_MODE="$2";  shift 2 ;;
    -h|--help)           usage ;;
    -*)                  echo "Unknown option: $1"; echo ""; usage ;;
    *)                   FEATURE_NAME="$1";   shift ;;
  esac
done

if [[ -z "$FEATURE_NAME" ]]; then
  printf "${RED}feature-name is required${RESET}\n\n"
  usage
fi

PRD_DIR="prds/${FEATURE_NAME}"
ISSUES_DIR="${PRD_DIR}/issues"
LOG_DIR="${PRD_DIR}/logs"
PROGRESS_FILE="${PRD_DIR}/progress.txt"
INDEX_FILE="${ISSUES_DIR}/index.md"

if [[ ! -d "$PRD_DIR" ]]; then
  printf "${RED}PRD not found at ${PRD_DIR}${RESET}\n"
  exit 1
fi

if [[ ! -f "$INDEX_FILE" ]]; then
  printf "${RED}Issue index not found at ${INDEX_FILE}${RESET}\n"
  exit 1
fi

validate_git_state() {
  if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    printf "${RED}Not inside a git repository${RESET}\n"
    exit 1
  fi

  if ! git diff --quiet -- ':!prds/' || ! git diff --cached --quiet -- ':!prds/'; then
    printf "${RED}Uncommitted changes detected. Commit or stash first.${RESET}\n"
    git diff --name-only -- ':!prds/'
    git diff --cached --name-only -- ':!prds/'
    exit 1
  fi

  local untracked
  untracked=$(git ls-files --others --exclude-standard)
  if [[ -n "$untracked" ]]; then
    printf "${YELLOW}Untracked files:${RESET}\n"
    echo "$untracked" | head -10
    echo ""
  fi
}

validate_git_state

mkdir -p "$LOG_DIR"
[[ -f "$PROGRESS_FILE" ]] || touch "$PROGRESS_FILE"

CURRENT_TMPFILE=""

cleanup() {
  local exit_code=$?
  kill -TERM -$$ 2>/dev/null || true
  [[ -n "$CURRENT_TMPFILE" && -f "$CURRENT_TMPFILE" ]] && rm -f "$CURRENT_TMPFILE"
  exit "$exit_code"
}

trap cleanup EXIT INT TERM HUP

CLAUDE_CMD=(
  claude
  --print
  --verbose
  --output-format stream-json
  --no-session-persistence
  --permission-mode "$PERMISSION_MODE"
)
[[ -n "$MODEL" ]] && CLAUDE_CMD+=(--model "$MODEL")

STREAM_FILTER='try (fromjson | select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n") catch empty'
FINAL_RESULT='select(.type == "result").result // empty'

CONSECUTIVE_FAILURES=0
MAX_CONSECUTIVE_FAILURES=3
BASE_DELAY=5

printf "\n${BOLD}Ralph Loop${RESET} ${DIM}${FEATURE_NAME}${RESET}\n"
printf "${DIM}Iterations: ${MAX_ITERATIONS} | Permissions: ${PERMISSION_MODE}"
[[ -n "$MODEL" ]] && printf " | Model: ${MODEL}"
printf " | Subagents: ${SUBAGENT_MODEL}"
printf "${RESET}\n\n"

for ((i = 1; i <= MAX_ITERATIONS; i++)); do
  iter_start=$SECONDS
  logfile="${LOG_DIR}/iteration-${i}-$(date '+%Y%m%d-%H%M%S').log"

  printf "${CYAN}[${i}/${MAX_ITERATIONS}]${RESET} ${DIM}$(date '+%H:%M:%S')${RESET} Starting iteration...\n"

  CURRENT_TMPFILE=$(mktemp "${TMPDIR:-/tmp}/ralph.XXXXXX")

  set +o pipefail

  "${CLAUDE_CMD[@]}" \
    "Run /execute-ralph-loop ${FEATURE_NAME} --subagent-model ${SUBAGENT_MODEL}" \
  | tee "$CURRENT_TMPFILE" \
  | jq --unbuffered -Rrj "$STREAM_FILTER" \
  | tee "$logfile"

  pipe_statuses=("${PIPESTATUS[@]}")
  set -o pipefail

  claude_exit=${pipe_statuses[0]}

  if [[ $claude_exit -ne 0 ]]; then
    if grep -qi "hit your limit\|rate.limit" "$CURRENT_TMPFILE" "$logfile" 2>/dev/null; then
      printf "${YELLOW}Rate limited${RESET} ${DIM}pausing 5m before retry...${RESET}\n"
      rm -f "$CURRENT_TMPFILE"
      CURRENT_TMPFILE=""
      i=$((i - 1))
      sleep 300
      continue
    fi

    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))

    if (( CONSECUTIVE_FAILURES >= MAX_CONSECUTIVE_FAILURES )); then
      printf "\n${RED}Aborted: ${MAX_CONSECUTIVE_FAILURES} consecutive failures${RESET}\n"
      rm -f "$CURRENT_TMPFILE"
      CURRENT_TMPFILE=""
      exit 3
    fi

    delay=$(( BASE_DELAY * (2 ** (CONSECUTIVE_FAILURES - 1)) ))
    printf "${RED}Claude exited ${claude_exit}${RESET} ${DIM}retrying in ${delay}s (${CONSECUTIVE_FAILURES}/${MAX_CONSECUTIVE_FAILURES})${RESET}\n"
    sleep "$delay"

    rm -f "$CURRENT_TMPFILE"
    CURRENT_TMPFILE=""
    continue
  fi

  result=$(jq -rj "$FINAL_RESULT" "$CURRENT_TMPFILE" 2>/dev/null || echo "")
  rm -f "$CURRENT_TMPFILE"
  CURRENT_TMPFILE=""

  iter_elapsed=$(( SECONDS - iter_start ))
  iter_min=$(( iter_elapsed / 60 ))
  iter_sec=$(( iter_elapsed % 60 ))

  if [[ "$result" == *"COMPLETE"* ]]; then
    printf "\n${GREEN}${BOLD}Complete${RESET} ${DIM}${i} iteration(s) in ${iter_min}m ${iter_sec}s${RESET}\n"
    exit 0
  fi

  if [[ "$result" == *"NEEDS_HUMAN_REVIEW"* ]]; then
    printf "\n${YELLOW}${BOLD}Needs human review${RESET} ${DIM}log: ${logfile}${RESET}\n"
    exit 1
  fi

  if [[ -z "$result" ]]; then
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))

    if (( CONSECUTIVE_FAILURES >= MAX_CONSECUTIVE_FAILURES )); then
      printf "\n${RED}Aborted: ${MAX_CONSECUTIVE_FAILURES} consecutive empty results${RESET}\n"
      exit 3
    fi

    delay=$(( BASE_DELAY * (2 ** (CONSECUTIVE_FAILURES - 1)) ))
    printf "${YELLOW}Empty result${RESET} ${DIM}retrying in ${delay}s (${CONSECUTIVE_FAILURES}/${MAX_CONSECUTIVE_FAILURES})${RESET}\n"
    sleep "$delay"
    continue
  fi

  CONSECUTIVE_FAILURES=0
  printf "${GREEN}[${i}/${MAX_ITERATIONS}]${RESET} ${DIM}done in ${iter_min}m ${iter_sec}s${RESET}\n\n"
done

printf "\n${YELLOW}Max iterations (${MAX_ITERATIONS}) reached${RESET}\n"
exit 2

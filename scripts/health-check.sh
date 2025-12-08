#!/bin/bash

commit=true
origin=$(git remote get-url origin)
if [[ $origin == *statsig-io/statuspage* ]]; then
  commit=false
fi

declare -a KEYSARRAY
declare -a URLSARRAY

urlsConfig="public/urls.cfg"
echo "Reading $urlsConfig"
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  [ -z "$line" ] && continue
  IFS='=' read -r key url <<< "$line"
  [ -z "$url" ] && continue
  key="$(echo "$key" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  url="$(echo "$url" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  echo "  $key=$url"
  KEYSARRAY+=("$key")
  URLSARRAY+=("$url")
done < "$urlsConfig"

echo "***********************"
echo "Starting health checks with ${#KEYSARRAY[@]} configs:"

mkdir -p logs

# create a temp dir for curl stderr files and ensure cleanup
TMPDIR="$(mktemp -d 2>/dev/null || mktemp -d -t healthcheck)"
trap 'rm -rf "$TMPDIR"' EXIT

for (( index=0; index < ${#KEYSARRAY[@]}; index++ )); do
  key="${KEYSARRAY[index]}"
  url="${URLSARRAY[index]}"
  echo "  $key=$url"

  result="failed"
  time_total=""

  for i in 1 2 3; do
    tmp_err="$TMPDIR/healthcheck_${key}_$$.err"
    response=$(curl --silent --show-error --max-time 15 --connect-timeout 7 -o /dev/null -w "%{http_code} %{time_total}" "$url" 2>"$tmp_err")
    curl_exit=$?
    http_code=$(echo "$response" | awk '{print $1}')
    time_total=$(echo "$response" | awk '{print $2}')

    if [ "$curl_exit" -ne 0 ] || [ "$http_code" = "000" ]; then
  response=$(curl --silent --show-error --max-time 15 --connect-timeout 7 -k -o /dev/null -w "%{http_code} %{time_total}" "$url" 2>"$tmp_err")
      curl_exit=$?
      http_code=$(echo "$response" | awk '{print $1}')
      time_total=$(echo "$response" | awk '{print $2}')
    fi

    if [ "$curl_exit" -ne 0 ]; then
      err_msg="$(sed -n '1,10p' "$tmp_err" 2>/dev/null | tr -d '\n')"
      echo -e "    \033[31mERROR (curl exit $curl_exit): ${err_msg:-unknown error}\033[0m"
      result="failed"
      sleep 2
      rm -f "$tmp_err"
      continue
    fi

    rm -f "$tmp_err"

    if [[ "$http_code" =~ ^(2|3)[0-9][0-9]$ ]]; then
      echo -e "    \033[32m$http_code $time_total\033[0m"
      result="success"
      break
    else
      echo -e "    \033[31m$http_code $time_total\033[0m"
      result="failed"
      sleep 5
    fi
  done

  dateTime=$(date +'%Y-%m-%d %H:%M')
  if [[ $commit == true ]]; then
    mkdir -p public/status
    echo "$dateTime, $result, $time_total" >> "public/status/${key}_report.log"
    tail -2000 "public/status/${key}_report.log" > "public/status/${key}_report.log.tmp"
    mv "public/status/${key}_report.log.tmp" "public/status/${key}_report.log"
  else
    echo "    $dateTime, $result, $time_total"
  fi
done

if [[ $commit == true ]]; then
  echo "committing logs"
  git config user.name 'github-actions[bot]'
  git config user.email 'github-actions[bot]@users.noreply.github.com'
  git add -A --force public/status/ || echo "git add failed (continuing)"
  # commit may exit non-zero when there are no changes; don't abort the script
  git commit -am '[Automated] Update Health Check Logs' || echo "git commit had no changes or failed (continuing)"
  git push || echo "git push failed (continuing)"
fi

# exit zero so callers (cron/GitHub Actions runner) don't treat connection failures as script failure
exit 0

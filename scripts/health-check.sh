#!/bin/bash

commit=true
origin=$(git remote get-url origin)
if [[ $origin == *statsig-io/statuspage* ]]
then
  commit=false
fi

declare -a KEYSARRAY
declare -a URLSARRAY

urlsConfig="public/urls.cfg"
echo "Reading $urlsConfig"
# Read file line-by-line, handle CRLF, skip blank/comment lines, and split on the first '=' so we accept all URLs
while IFS= read -r line || [ -n "$line" ]; do
  # remove CR (for Windows-formatted files)
  line="${line//$'\r'/}"
  # skip empty lines and comments
  if [[ -z "$line" ]] || [[ "$line" =~ ^# ]]; then
    continue
  fi
  # split on first '='
  key="${line%%=*}"
  url="${line#*=}"
  # trim whitespace around key and url
  key="${key##+([[:space:]])}"
  key="${key%%+([[:space:]])}"
  url="${url##+([[:space:]])}"
  url="${url%%+([[:space:]])}"
  # if key is empty after trimming, skip
  if [[ -z "$key" ]]; then
    continue
  fi
  echo "  $key=$url"
  KEYSARRAY+=("$key")
  URLSARRAY+=("$url")
done < "$urlsConfig"

echo "***********************"
echo "Starting health checks with ${#KEYSARRAY[@]} configs:"

mkdir -p logs

# helper: returns 0 if http code is considered success
is_success_code() {
  local code=$1
  if [ "$code" -eq 200 ] || [ "$code" -eq 202 ] || [ "$code" -eq 301 ] || [ "$code" -eq 302 ] || [ "$code" -eq 307 ]; then
    return 0
  fi
  return 1
}

# helper: try a url up to N attempts; prints "http_code time_total" of last attempt and returns 0 on success
try_url_attempts() {
  local try_url="$1"
  local attempts=${2:-2}
  local last_http=0
  local last_time=0
  for ((t=1; t<=attempts; t++)); do
    response=$(curl -s -o /dev/null -w '%{http_code} %{time_total}' --max-time 10 "$try_url" 2>/dev/null)
    http_code=$(echo "$response" | cut -d ' ' -f 1)
    time_total=$(echo "$response" | cut -d ' ' -f 2)
    last_http=${http_code:-0}
    last_time=${time_total:-0}
    if is_success_code "$last_http"; then
      echo "$last_http $last_time"
      return 0
    fi
    sleep 2
  done
  echo "$last_http $last_time"
  return 1
}

# update a single key in urls.cfg (preserve other lines and order). If the key is missing, append it.
update_url_in_cfg() {
  local key="$1"
  local newurl="$2"
  local tmpfile
  tmpfile=$(mktemp) || tmpfile="${urlsConfig}.tmp"
  awk -F'=' -v k="$key" -v v="$newurl" 'BEGIN{OFS=FS} { if(substr($0,1,1)=="#"){print; next} if($1==k){print k,v; found=1; next} print } END{ if(!found) print k"="v }' "$urlsConfig" > "$tmpfile"
  mv "$tmpfile" "$urlsConfig"
  echo "Updated $urlsConfig: $key -> $newurl"
}

for (( index=0; index < ${#KEYSARRAY[@]}; index++ ))
do
  key="${KEYSARRAY[index]}"
  url="${URLSARRAY[index]}"
  echo "  $key=$url"

  # initial attempts (existing behavior: 3 attempts)
  result="failed"
  for i in {1..3}
  do
    read http_code time_total < <(try_url_attempts "$url" 1)
    echo "    $http_code $time_total"
    if is_success_code "$http_code"; then
      result="success"
      break
    fi
    sleep 2
  done

  # If still failing, attempt fallbacks and if any succeed, update urls.cfg
  if [ "$result" = "failed" ]; then
    echo "    $key appears to be failing — trying fallbacks"
    candidates=()

    # normalize: extract scheme and host/path
    if [[ "$url" =~ ^(https?)://(.*)$ ]]; then
      scheme="${BASH_REMATCH[1]}"
      rest="${BASH_REMATCH[2]}"
    else
      scheme="https"
      rest="$url"
    fi

    # scheme toggles
    if [ "$scheme" = "https" ]; then
      candidates+=("http://$rest")
    else
      candidates+=("https://$rest")
    fi

    # www toggles (only operate on hostname part)
    host_and_path="$rest"
    host=$(echo "$host_and_path" | cut -d'/' -f1)
    path=""
    if [[ "$host_and_path" == *"/"* ]]; then
      path="/${host_and_path#*/}"
    fi

    if [[ "$host" == www.* ]]; then
      host_no_www=${host#www.}
      candidates+=("$scheme://$host_no_www$path")
    else
      candidates+=("$scheme://www.$host$path")
    fi

    # deduplicate candidates
    uniq_candidates=()
    for c in "${candidates[@]}"; do
      skip=0
      for u in "${uniq_candidates[@]}"; do
        if [ "$c" = "$u" ]; then skip=1; break; fi
      done
      if [ $skip -eq 0 ]; then uniq_candidates+=("$c"); fi
    done

    # try candidates
    for cand in "${uniq_candidates[@]}"; do
      echo "      trying fallback: $cand"
      if read cand_http cand_time < <(try_url_attempts "$cand" 2); then
        echo "      fallback succeeded: $cand ($cand_http $cand_time)"
  # update arrays and urls.cfg (only update the single key to avoid dropping lines)
  URLSARRAY[index]="$cand"
  update_url_in_cfg "$key" "$cand"
        url="$cand"
        result="success"
        time_total="$cand_time"
        break
      else
        echo "      fallback failed: $cand ($cand_http $cand_time)"
      fi
    done
  fi

  dateTime=$(date +'%Y-%m-%d %H:%M')
  if [[ $commit == true ]]
  then
    mkdir -p public/status
    echo "$dateTime, $result, $time_total" >> "public/status/${key}_report.log"
    tail -2000 "public/status/${key}_report.log" > "public/status/${key}_report.log.tmp"
    mv "public/status/${key}_report.log.tmp" "public/status/${key}_report.log"
  else
    echo "    $dateTime, $result, $time_total"
  fi
done

if [[ $commit == true ]]
then
  echo "committing logs"
  git config user.name 'github-actions[bot]'
  git config user.email 'github-actions[bot]@users.noreply.github.com'
  git add -A --force public/status/
  git commit -am '[Automated] Update Health Check Logs'
  git pull -X theirs origin main
  git push origin main
fi

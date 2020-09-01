#!/bin/bash

function report() {
  echo "$@"
  payload='{
      "sdk":"'"$1"'",
      "group":"selenium",
      "id":"'$2'",
      "sandbox":'$3',
      "mandatory":false,
      "results": [
        {
          "test_name": "tutorial_basic",
          "passed": true
        },
        {
          "test_name": "tutorial_ultrafastgrid",
          "passed": true
        }
      ]
}'
  echo $payload

  curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X POST --data "$payload" "http://sdk-test-results.herokuapp.com/result"
}

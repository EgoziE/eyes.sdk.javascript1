#!/bin/bash

bash ./chrome_setup.sh > /dev/null 2>&1
bash ./bootstrap.sh > /dev/null 2>&1
cd home/project/$1
npx chromedriver --port=4444 --url-base=/wd/hub > /dev/null 2>&1 &
npm test

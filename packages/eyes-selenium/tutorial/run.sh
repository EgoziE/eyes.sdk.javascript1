#!/bin/bash
source ../../sdk-shared/tutorial/report.sh
set -e
[ -d "./package" ] && rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker-compose build $1
docker-compose run js_selenium_basic
docker-compose run js_selenium_ultrafastgrid


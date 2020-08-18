#!/bin/bash
set -e
rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker-compose build $1
docker-compose run wdio4_selenium_basic
docker-compose run wdio4_selenium_ultrafastgrid

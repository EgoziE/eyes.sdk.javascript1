#!/bin/bash

rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker-compose build
docker-compose run js_selenium_basic
docker-compose run js_selenium3_basic
docker-compose run js_selenium_ultrafastgrid
docker-compose run js_selenium3_ultrafastgrid

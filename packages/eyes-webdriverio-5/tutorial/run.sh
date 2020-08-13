#!/bin/bash

rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker-compose build
docker-compose run wdio5_selenium_basic
docker-compose run wdio5_selenium_ultrafastgrid

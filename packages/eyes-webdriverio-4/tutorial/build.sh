#!/bin/bash

rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker build -t wdio4_selenium_basic .
docker build -t wdio4_selenium_ultrafastgrid -f ./Dockerfile.ultrafastgrid .

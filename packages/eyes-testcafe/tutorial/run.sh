#!/bin/bash
set -e
[ -d "./package" ] && rm -r ./package
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker build -t tutorial_testcafe .
docker run -e APPLITOOLS_API_KEY tutorial_testcafe

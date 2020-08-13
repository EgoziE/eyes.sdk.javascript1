#!/bin/bash
set -e
[ -d "./package" ] && rm -r ./package
echo $(ls)
mkdir package
cd ..
yarn pack
package=$(find applitools*.tgz)
mv "$package" ./tutorial/package/"$package"
cd ./tutorial
docker build -t tutorial_cypress .
docker run -e APPLITOOLS_API_KEY tutorial_cypress

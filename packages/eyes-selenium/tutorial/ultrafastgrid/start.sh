#!/bin/bash

bash ./bootstrap.sh > /dev/null 2>&1
cd home/project/tutorial-selenium-javascript-ultrafastgrid
npm test

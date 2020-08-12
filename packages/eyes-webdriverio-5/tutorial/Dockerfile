FROM tutorial_nodejs:latest

RUN cd home/project \
    && git clone https://github.com/applitools/tutorial-webdriverio5-basic.git \
    && cd tutorial-webdriverio5-basic \
    && find ./test -type f -exec sed -i "s/'APPLITOOLS_API_KEY'/process.env.APPLITOOLS_API_KEY/g" {} \;

COPY basic/start.sh /
COPY package/ /

RUN filename=$(find applitools*.tgz) \
    && mv $filename home/project/tutorial-webdriverio5-basic/$filename \
    && cd home/project/tutorial-webdriverio5-basic \
    && npm install ./$filename \
    && npm install

CMD '/start.sh'

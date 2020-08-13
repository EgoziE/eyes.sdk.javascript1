FROM node:latest
ARG repo=tutorial-webdriverio5-basic
ENV REPOSITORY_NAME=$repo
RUN mkdir home/project \
    && cd home/project \
    && git clone https://github.com/applitools/${REPOSITORY_NAME}.git \
    && cd ${REPOSITORY_NAME} \
    && find ./test -type f -exec sed -i "s/'APPLITOOLS_API_KEY'/process.env.APPLITOOLS_API_KEY/g" {} \; \
    && find ./test -type f -exec sed -i "s/logLevel: 'silent',/logLevel: 'silent',\n hostname: 'selenium'/g" {} \;

COPY start.sh /
COPY package/ /

RUN filename=$(find applitools*.tgz) \
    && mv $filename home/project/${REPOSITORY_NAME}/$filename \
    && cd home/project/${REPOSITORY_NAME} \
    && npm install ./$filename \
    && npm install

CMD ./start.sh ${REPOSITORY_NAME}

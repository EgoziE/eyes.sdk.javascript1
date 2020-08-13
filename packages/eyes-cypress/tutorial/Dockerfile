FROM tutorial_nodejs:latest
ARG repo=tutorial-cypress
ENV REPOSITORY_NAME=$repo
RUN cd home/project \
    && git clone https://github.com/applitools/${REPOSITORY_NAME}.git \
    && cd ${REPOSITORY_NAME} \
    && sed -i "s/'APPLITOOLS_API_KEY'/process.env.APPLITOOLS_API_KEY/g" applitools.config.js

COPY start.sh /
COPY package/ /

RUN filename=$(find applitools*.tgz) \
    && mv $filename home/project/${REPOSITORY_NAME}/$filename \
    && cd home/project/${REPOSITORY_NAME} \
    && npm install ./$filename \
    && npm install

CMD ./start.sh ${REPOSITORY_NAME}

FROM ubuntu:23.10
RUN mkdir /web
WORKDIR /web
RUN apt update && apt -y upgrade && apt -y autoremove && apt -y install nodejs npm
RUN npm install node socket.io express mysql

# create an image with node and all dependencies
# set workdir to avoid crash

FROM ubuntu:23.10
RUN mkdir /web
WORKDIR /web
RUN apt update
RUN apt -y upgrade
RUN apt -y autoremove
RUN apt -y install nodejs
RUN apt -y install npm
RUN npm install socket.io
RUN npm install express

# create an image with node and all dependencies
# set workdir to avoid crash
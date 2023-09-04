FROM ubuntu:23.10
RUN mkdir /web
WORKDIR /web
run apt update
run apt -y upgrade
run apt -y autoremove
run apt -y install nodejs
run apt -y install npm
run npm install -g npm@latest
run npm install socket.io
run npm install --save-optional bufferutil utf-8-validate
run npm install eiows
run npm install express

# create an image with node and all dependencies
# set workdir to avoid crash
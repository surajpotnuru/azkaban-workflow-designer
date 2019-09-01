#!/bin/bash
sudo yum -y update
# install java
sudo yum install -y java
# install python3 and dependent packages
sudo yum install -y python3
sudo python3 -m pip install flask_cors
sudo python3 -m pip install flask
sudo python3 -m pip install requests
# sudo python3 -m pip install boto
# sudo python3 -m pip install boto3
# install nodejs and npm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 4.4.5
# install npm dependencies
npm install
# clone azkaban repo
cd ../
git clone https://github.com/azkaban/azkaban.git
cd azkaban
./gradlew installDist -x test
cd ../
# install http-server for serving frontend
npm i -g http-server
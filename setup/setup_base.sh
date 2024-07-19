#!/bin/bash -ex
IP=localhost
SSH_PORT=$1
PASS=tmp12345
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo apt-get update'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo apt-get install cups autossh sshpass git  -y'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'source /home/ggomes/.bashrc'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'nvm install 14'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'npm install -g localtunnel'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'npm install -g pm2'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo usermod -a -G lpadmin ggomes'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo udevadm control --reload-rules'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo udevadm trigger'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo usermod -aG plugdev $USER'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl restart cups'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'git clone https://github.com/scuver/scuver-rest.git'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'cd scuver-rest && npm i'
sshpass -p $PASS ssh -p $SSH_PORT $IP  'ssh -o StrictHostKeyChecking=no 168.119.202.164'

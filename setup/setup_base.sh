#!/bin/bash -ex
TARGET_SSH_PORT=${1:-2223}
TARGET_IP=${2:-localhost}
PASS=tmp12345

sshpass -p $PASS scp -P $TARGET_SSH_PORT  cupsd.conf $TARGET_IP:/etc/cups/cupsd.conf
sshpass -p $PASS scp -P $TARGET_SSH_PORT  99-usb-printer.rules $TARGET_IP:/etc/udev/rules.d/99-usb-printer.rules
sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa $TARGET_IP:/home/ggomes/.ssh/
sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa.pub $TARGET_IP:/home/ggomes/.ssh/

sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo apt-get update'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo apt-get install cups autossh sshpass git  -y'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'source /home/ggomes/.bashrc'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'nvm install 14'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'npm install -g localtunnel'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'npm install -g pm2'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo usermod -a -G lpadmin ggomes'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo udevadm control --reload-rules'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo udevadm trigger'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP "sudo usermod -aG plugdev $USER"
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl restart cups'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'git clone https://github.com/scuver/scuver-rest.git'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'cd scuver-rest && npm i'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP  'ssh -o StrictHostKeyChecking=no 168.119.202.164'

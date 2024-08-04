#!/bin/bash -ex

# arp -a
# ssh ggomes@<rasp_ip>
# sudo raspi-config

TARGET_SSH_PORT=2223 # 2222 - assim, 2223 - varunca
RASP_IP=192.168.1.198
RASP_PASS=tmp12345

sshpass -p $RASP_PASS scp ~/.ssh/id_rsa $RASP_IP:/home/ggomes/.ssh/
sshpass -p $RASP_PASS scp ~/.ssh/id_rsa.pub $RASP_IP:/home/ggomes/.ssh/
sshpass -p $RASP_PASS ssh $RASP_IP  "ssh -N -R $TARGET_SSH_PORT:localhost:22 168.119.202.164 -i /home/ggomes/.ssh/id_rsa"

 ssh 168.119.202.164

#!/bin/bash -ex
IP=localhost
SSH_PORT=$1
PASS=tmp12345
sshpass -p $PASS scp -P $SSH_PORT start_tastic.sh $IP:/home/ggomes/start_tastic.sh
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo mv /home/ggomes/start_tastic.sh /usr/local/bin/start_tastic.sh && sudo chmod +x /usr/local/bin/start_tastic.sh'
sshpass -p $PASS scp -P $SSH_PORT tastic.service $IP:/home/ggomes/tastic.service
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo mv /home/ggomes/tastic.service /etc/systemd/system/tastic.service'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl stop tastic'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl disable tastic'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl daemon-reload'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl enable tastic'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl start tastic'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo systemctl status tastic'
sleep 20
sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo journalctl -u tastic.service -b'
sshpass -p $PASS ssh -p $SSH_PORT $IP 'tail -n100 /home/ggomes/start_tastic.log'

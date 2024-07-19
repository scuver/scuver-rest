#!/bin/bash -ex
TARGET_SSH_PORT=${1:-2223}
TARGET_IP=${2:-localhost}
LT_HOST=${3:-varunca-print}
PASS=tmp12345

git add ~/dev/scuver-rest
git commit -m "deploy"
git push
ssh 168.119.202.164  "cd /Users/ggomes/dev/scuver-rest && git pull"

sed "s/TARGET_PORT/$TARGET_SSH_PORT/g; s/LT_HOST/$LT_HOST/g" "start_tastic_example.sh" > "start_tastic_GENERATED.sh"

sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa $TARGET_IP:/home/ggomes/.ssh/
sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa.pub $TARGET_IP:/home/ggomes/.ssh/
sshpass -p $PASS scp -P $TARGET_SSH_PORT start_tastic_GENERATED.sh $TARGET_IP:/home/ggomes/start_tastic.sh
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo mv /home/ggomes/start_tastic.sh /usr/local/bin/start_tastic.sh && sudo chmod +x /usr/local/bin/start_tastic.sh'
sshpass -p $PASS scp -P $TARGET_SSH_PORT tastic.service $TARGET_IP:/home/ggomes/tastic.service
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo mv /home/ggomes/tastic.service /etc/systemd/system/tastic.service'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl stop tastic'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl disable tastic'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl daemon-reload'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl enable tastic'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl start tastic'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl status tastic'
sleep 20
#sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo journalctl -u tastic.service -b'
sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/start_tastic.log'
#sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/.pm2/logs/tastic-print-out.log'
#sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/.pm2/logs/tastic-print-error.log'

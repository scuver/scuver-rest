#!/bin/bash -ex
TARGET_SSH_PORT=${1:-2222}
TARGET_IP=${2:-localhost}
LT_HOST=${3:-assim-print}
PASS=tmp12345
SLEEP_FOR=15

sed "s/TARGET_PORT/$TARGET_SSH_PORT/g; s/LT_HOST/$LT_HOST/g; s/SLEEP_FOR/$SLEEP_FOR/g" "start_tastic_example.sh" > "start_tastic_GENERATED.sh"

#/opt/homebrew/bin/sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa $TARGET_IP:/home/ggomes/.ssh/
#/opt/homebrew/bin/sshpass -p $PASS scp -P $TARGET_SSH_PORT  ~/.ssh/id_rsa.pub $TARGET_IP:/home/ggomes/.ssh/
/opt/homebrew/bin/sshpass -p $PASS scp -P $TARGET_SSH_PORT start_tastic_GENERATED.sh $TARGET_IP:/home/ggomes/start_tastic.sh
/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo mv /home/ggomes/start_tastic.sh /usr/local/bin/start_tastic.sh && sudo chmod +x /usr/local/bin/start_tastic.sh'
#/opt/homebrew/bin/sshpass -p $PASS scp -P $TARGET_SSH_PORT tastic.service $TARGET_IP:/home/ggomes/tastic.service
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo mv /home/ggomes/tastic.service /etc/systemd/system/tastic.service'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl stop tastic'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl disable tastic'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl daemon-reload'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl enable tastic'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl start tastic'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo systemctl status tastic'
#sleep 5
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'sudo journalctl -u tastic.service -b'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/start_tastic.log'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/.pm2/logs/tastic-print-out.log'
#/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 /home/ggomes/.pm2/logs/tastic-print-error.log'

/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'bash /usr/local/bin/start_tastic.sh &> /home/ggomes/start_tastic.log &'
/opt/homebrew/bin/sshpass -p $PASS ssh -p $TARGET_SSH_PORT $TARGET_IP 'tail -n50 -f /home/ggomes/start_tastic.log'
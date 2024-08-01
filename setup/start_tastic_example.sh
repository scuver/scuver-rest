#!/bin/bash

LOGFILE="/home/ggomes/start_tastic.log"

# Full paths to the binaries
LT_BIN="/home/ggomes/.nvm/versions/node/v14.21.3/bin/lt"
PM2_BIN="/home/ggomes/.nvm/versions/node/v14.21.3/bin/pm2"
AUTOSSH_BIN="/usr/bin/autossh"
SSH_IDENTITY="/home/ggomes/.ssh/id_rsa"

echo "Script started at $(date)" >> $LOGFILE

# Add a delay to ensure the network is ready
echo "Waiting for network to be ready..." >> $LOGFILE
sleep SLEEP_FOR  # Adjust this delay as necessary
echo "Starting services..." >> $LOGFILE

# Start SSH tunnel with retries for network issues only
SSH_COMMAND="$AUTOSSH_BIN -M 0 -N -R TARGET_PORT:localhost:22 168.119.202.164 -i $SSH_IDENTITY"
#SERVEO_COMMAND="$AUTOSSH_BIN -M 0 -N -p 443 -R0:localhost:3000 -L4300:localhost:4300 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 B1Kely8PXDF@a.pinggy.io"
RETRY_COUNT=0
MAX_RETRIES=5

# Start pm2
$PM2_BIN start /home/ggomes/scuver-rest/print.js --name tastic-print -f >> $LOGFILE 2>&1
$PM2_BIN save >> $LOGFILE 2>&1
echo "Started pm2 service" >> $LOGFILE

#sleep 1
#until $SERVEO_COMMAND >> $LOGFILE 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
#    if grep -q "Network is unreachable" $LOGFILE; then
#        echo "Retry SERVEO tunnel due to network issue ($RETRY_COUNT/$MAX_RETRIES)" >> $LOGFILE
#        RETRY_COUNT=$((RETRY_COUNT + 1))
#        sleep 10
#    else
#        echo "SERVEO authentication failed" >> $LOGFILE
#    fi
#done
#
#if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
#    echo "Failed to establish SERVEO tunnel after $MAX_RETRIES attempts." >> $LOGFILE
#fi

# Start localtunnel
sleep 1
$LT_BIN --port 3222 --subdomain LT_HOST >> $LOGFILE 2>&1 >> $LOGFILE &
echo "Started localtunnel" >> $LOGFILE

RETRY_COUNT=0

until $SSH_COMMAND >> $LOGFILE 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    if grep -q "Network is unreachable" $LOGFILE; then
        echo "Retry SSH tunnel due to network issue ($RETRY_COUNT/$MAX_RETRIES)" >> $LOGFILE
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 10
    else
        echo "SSH authentication failed" >> $LOGFILE
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to establish SSH tunnel after $MAX_RETRIES attempts." >> $LOGFILE
fi

echo "Started SSH tunnel" >> $LOGFILE

while true; do
 ssh -p 443 -R0:localhost:3222 -L4300:localhost:4300 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 B1Kely8PXDF@a.pinggy.io           ;
sleep 10; done

# Keep script running
tail -f /dev/null >> $LOGFILE 2>&1

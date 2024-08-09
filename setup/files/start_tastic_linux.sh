#!/bin/bash

pm2 start /home/ggomes/scuver-rest/print.js --name print -f
pm2 save
echo "Started pm2 service"

x11vnc -xkb -noxrecord -noxfixes -noxdamage -display :0 -auth guess &

autossh -M 0 -N -R varunca:5910:localhost:5900 serveo.net -o StrictHostKeyChecking=no -o ServerAliveInterval=10
autossh -M 0 -N -R varunca5911:localhost:5901 serveo.net -o StrictHostKeyChecking=no -o ServerAliveInterval=10
autossh -M 0 -N -R varunca:22:localhost:22 serveo.net -o StrictHostKeyChecking=no -o ServerAliveInterval=10

# Para ligar da maquina local ssh -L 5950:varunca:5911 serveo.net
# e depois localhost:5950 no vnc viewer
# SSH é ssh -J serveo.net varunca

#while true; do
#ssh -p 443 -R0:localhost:3222 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 B1Kely8PXDF@a.pinggy.io &
#ssh -p 443 -R0:localhost:5900  -o StrictHostKeyChecking=no -o ServerAliveInterval=30 qYRQRnpnMRp+tcp@a.pinggy.io  &
#sleep 10; done

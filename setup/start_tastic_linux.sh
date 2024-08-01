#!/bin/bash

x11vnc -xkb -noxrecord -noxfixes -noxdamage -display :0 -auth guess

while true; do
 ssh -p 443 -R0:localhost:5900  -o StrictHostKeyChecking=no -o ServerAliveInterval=30 B1Kely8PXDF+tcp@a.pinggy.io           ;
sleep 10; done
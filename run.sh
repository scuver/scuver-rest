#!/bin/bash
sshpass -p 'password_para_oak' autossh -M 0 -N -R 2222:localhost:22 ggomes@oh-168-119-202-164.client.oakhost-customer.net &
pm2 start /home/ggomes/scuver-rest/print.js &
lt --port 3222 --subdomain tastic-print &

#forever stopall
#killall forever
#killall node
#forever print.js &
#forever notify.js --shop=$1 &
#forever uber.js --shop=$1

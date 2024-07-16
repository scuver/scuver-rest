#forever stopall
#killall forever
#killall node
pm2 start print.js
#forever print.js &
lt --port 3222 --subdomain tastic-print &
#forever notify.js --shop=$1 &
#forever uber.js --shop=$1

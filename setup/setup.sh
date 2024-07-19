#!/bin/bash -ex

# arp -a
# ssh ggomes@<rasp_ip>
# sudo raspi-config

RASP_IP=192.168.1.196
TARGET_SSH_PORT=2223
LT_HOST=varunca-print
IP=168.119.202.164
SSH_PORT=22 # 2222 - assim, 2223 - varunca
PASS=2WS4rf3ed!

INPUT_FILE="input_file.txt"
OUTPUT_FILE="output_file.txt"

sed "s/TARGET_PORT/$TARGET_PORT/g; s/LT_HOST/$LT_HOST/g" "start_tastic.sh" > "start_tastic.sh.tmp"
mv "start_tastic.sh.tmp" "start_tastic.sh"

sshpass -p $PASS ssh -p $SSH_PORT $IP  "autossh -M 0 -N -R $TARGET_SSH_PORT:localhost:22 ggomes@168.119.202.164 -i /home/ggomes/.ssh/id_rsa"
sshpass -p $PASS scp -P $SSH_PORT cupsd.conf $IP:/etc/cups/cupsd.conf
sshpass -p $PASS scp -P $SSH_PORT 99-usb-printer.rules /etc/udev/rules.d/99-usb-printer.rules
sshpass -p $PASS scp -P $SSH_PORT ~/.ssh/id_rsa $IP:/home/ggomes/.ssh/
sshpass -p $PASS scp -P $SSH_PORT ~/.ssh/id_rsa.pub $IP:/home/ggomes/.ssh/
sshpass -p $PASS scp -P $SSH_PORT setup_base.sh $IP:/home/ggomes/setup_base.sh
sshpass -p $PASS scp -P $SSH_PORT setup_service.sh $IP:/home/ggomes/setup_service.sh
sshpass -p $PASS ssh -p $SSH_PORT $IP  'chmod +x /home/ggomes/setup_base.sh'
sshpass -p $PASS ssh -p $SSH_PORT $IP  'chmod +x /home/ggomes/setup_service.sh'
sshpass -p $PASS ssh -p $SSH_PORT $IP  "bash /home/ggomes/setup_base.sh $TARGET_SSH_PORT"
sshpass -p $PASS ssh -p $SSH_PORT $IP  "bash /home/ggomes/setup_service.sh $TARGET_SSH_PORT"

#open -a "Google Chrome" http://$IP:631
## TasticPrinter -> Raw -> Raw
#echo "Reboot the rpi?"
#select yn in "Yes" "No"; do
#    case $yn in
#        Yes ) sshpass -p $PASS ssh -p $SSH_PORT $IP 'sudo reboot'; break;;
#        No ) exit;;
#    esac
#done

# OLD

#forever stopall
#killall forever
#killall node
#pm2 start print.js
#forever print.js &
#lt --port 3222 --subdomain tastic-print &
#forever notify.js --shop=$1 &
#forever uber.js --shop=$1

#echo 'ssh -i ~/.ssh/id_rsa 168.119.202.164'
#echo "ssh localhost -p $SSH_PORT"
#sshpass -p $PASS ssh $IP

## ligar ao rasp por ethernet
#arp -a
## ver qual o que aparece ou desaparece conforme rasp ligado ou desligado
#ssh ggomes@192.168.1.196
## ou
#sudo raspi-config
#
##sudo passwd root
##su root
##cd /root
#
#sudo apt-get update
#sudo apt-get install cups autossh sshpass git  -y
#curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
#source /home/ggomes/.bashrc
#nvm install 14
#npm install -g localtunnel
#npm install -g pm2
#sudo usermod -a -G lpadmin ggomes
#sudo nano /etc/cups/cupsd.conf
#
## Only listen for connections from the local machine.
## COMENTAR - Listen localhost:631
## ADICIONAR - Port 631
## MANTER - Listen /var/run/cups/cups.sock
## ADICIONAR OS ALLOW ABAIXO
##<Location />
##  Order allow,deny
##  Allow all
##</Location>
##
##<Location /admin>
##  Order allow,deny
##  Allow all
##</Location>
##
##<Location /admin/conf>
##  AuthType Default
##  Require user @SYSTEM
##  Order allow,deny
##  Allow all
##</Location>
#
#lsusb
#sudo nano /etc/udev/rules.d/99-usb-printer.rules
#SUBSYSTEM=="usb", ATTR{idVendor}=="0fe6", ATTR{idProduct}=="811e", MODE="0666", GROUP="lp", SYMLINK+="usbprinter"
#SUBSYSTEM=="usb", ATTR{idVendor}=="1fc9", ATTR{idProduct}=="2016", MODE="0666", GROUP="lp", SYMLINK+="usbprinter"
#SUBSYSTEM=="usb", ATTR{idVendor}=="067b", ATTR{idProduct}=="2305", MODE="0666", GROUP="lp", SYMLINK+="usbprinter"
#sudo udevadm control --reload-rules
#sudo udevadm trigger
#sudo usermod -aG plugdev $USER
#sudo systemctl restart cups
## http://192.168.1.196:631
## TasticPrinter -> Raw -> Raw
#
#git clone https://github.com/scuver/scuver-rest.git
#cd scuver-rest || exit 0
#npm i
#
##sudo nano /etc/rc.local
##/usr/local/bin/start_tastic.sh &
##sudo chmod +x /etc/rc.local
#
## So para ir para os know_hosts
#ssh ggomes@oh-168-119-202-164.client.oakhost-customer.net
#
##sudo cp /home/ggomes/.ssh/known_hosts /root/.ssh/known_hosts
##sudo chown root:root /root/.ssh/known_hosts
##sudo chmod 644 /root/.ssh/known_hosts
##sudo chown root:root /root/.ssh
##sudo chmod 700 /root/.ssh
#
##ssh-keygen -t rsa -b 4096 -C "goncalo.p.gomes@gmail.com"
##ssh-copy-id -i ~/.ssh/id_rsa.pub ggomes@168.119.202.164
##ssh -i ~/.ssh/id_rsa ggomes@168.119.202.164
#
#sudo nano /usr/local/bin/start_tastic.sh
#
## NAO ESQUECER DE MUDAR A PASSWORD - NAO ESQUECER DE MUDAR A PASSWORD - NAO ESQUECER DE MUDAR A PASSWORD
## 2222 - assim
## 2223 - varunca
#
#
#
#
#
#sudo chmod +x /usr/local/bin/start_tastic.sh
#
#sudo nano /etc/systemd/system/tastic.service
#[Unit]
#Description=Run My Script at Startup
#After=network-online.target
#Wants=network-online.target
#
#[Service]
#Type=simple
#ExecStart=/usr/local/bin/start_tastic.sh
#Restart=on-failure
#User=ggomes
#Environment=PATH=/usr/bin:/bin:/usr/local/bin:/usr/local/sbin
#Environment=PM2_HOME=/home/ggomes/.pm2
#StandardOutput=syslog
#StandardError=syslog
#SyslogIdentifier=tastic
#
#[Install]
#WantedBy=multi-user.target
#
#
#[Install]
#WantedBy=multi-user.target
#
#sudo systemctl daemon-reload
#sudo systemctl enable tastic
#sudo systemctl start tastic
#sudo systemctl status tastic
#
## /usr/local/bin/start_tastic.sh
#
#ssh ggomes@oh-168-119-202-164.client.oakhost-customer.net
## 2222 - assim
## 2223 - varunca
#ssh ggomes@localhost -p 2223
#
#tail -f /home/ggomes/.pm2/logs/tastic-print-out.log
#
##sudo systemctl start bluetooth
##sudo systemctl enable bluetooth
##service bluetooth status
##bluetoothctl
##power on
##scan on
##trust 40:EF:4C:9A:5D:DF
##pair 40:EF:4C:9A:5D:DF
##connect 40:EF:4C:9A:5D:DF
#
## bash run.sh s4qRI8ezYhR947BJ39sF
## bash run.sh rYhGRvkYLA2HHyrhuMMd
#
#    1  sudo nano /etc/cups/cupsd.conf
#    2  sudo systemctl restart cups
#    3  git
#    4  ls
#    5  cd dev
#    6  ls
#    7  git clone git@github.com:scuver/scuver-rest.git
#    8  https://github.com/scuver/scuver-rest.git
#    9  git clone https://github.com/scuver/scuver-rest.git
#   10  ls
#   11  cd scuver-rest/
#   12  ls
#   13  node print.js
#   14  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
#   15  nano ~/.bashrc
#   16  nvm
#   17  nano ~/.bashrc
#   18  source ~/.bashrc
#   19  nvm
#   20  nvm install 14
#   21  npm i
#   22  node print.js
#   23  git pull
#   24  node print.js
#   25  git pull
#   26  node print.js
#   27  nano print.js
#   28  npm i body-parser
#   29  nano print.js
#   30  node print.js
#   31  nano print.js
#   32  node print.js
#   33  nano print.js
#   34  node print.js
#   35  nano print.js
#   36  node print.js
#   37  nano print.js
#   38  node print.js
#   39  nano print.js
#   40  git stash
#   41  git pull
#   42  npm i
#   43  node print.js
#   44  e Error: LIBUSB_ERROR_ACCESS
#   45  sudo nano /etc/udev/rules.d/99-usb-printer.rules
#   46  lsusb
#   47  sudo nano /etc/udev/rules.d/99-usb-printer.rules
#   48  sudo udevadm control --reload-rules
#   49  sudo udevadm trigger
#   50  sudo usermod -aG plugdev $USER
#   51  sudo reboot
#   52  nmcli dev wifi list
#   53  nmcli dev wifi connect ext password mscgg2017
#   54  sudo nmcli dev wifi connect ext password mscgg2017
#   55  nmcli connection show
#   56  ifconfig
#   57  cd dev
#   58  ls
#   59  cd scuver-rest/
#   60  forever print.js
#   61  npm i forever
#   62  forever print.js
#   63  npx forever print.js
#   64  history

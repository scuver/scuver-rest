# ligar ao rasp por ethernet
arp -a
# ver qual o que aparece ou desaparece conforme rasp ligado ou desligado
ssh pi@192.168.3.2
sudo apt-get install cups
sudo usermod -a -G lpadmin pi
sudo nano /etc/cups/cupsd.conf

# Only listen for connections from the local machine.
# COMENTAR - Listen localhost:631
#Port 631
#Listen /var/run/cups/cups.sock
#<Location />
#  Order allow,deny
#  Allow all
#</Location>
#
#<Location /admin>
#  Order allow,deny
#  Allow all
#</Location>
#
#<Location /admin/conf>
#  AuthType Default
#  Require user @SYSTEM
#  Order allow,deny
#  Allow all
#</Location>

sudo systemctl restart cups
# http://192.168.3.2:631

# Unknow Raw Raw

git clone https://github.com/scuver/scuver-rest.git

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm use 14
npm i



#!/bin/bash

echo "Initial block devices:"
lsblk

echo "Plug in your USB device and press Enter."
read -p ""

echo "Updated block devices:"
lsblk

echo "Recent dmesg entries for USB devices:"
dmesg | grep -i usb

echo "List of USB devices:"
lsusb

#!/bin/bash

echo "Listing /dev before plugging in the printer:"
ls /dev > /tmp/dev_before

echo "Plug in your USB printer and press Enter."
read -p ""

echo "Listing /dev after plugging in the printer:"
ls /dev > /tmp/dev_after

echo "Differences in /dev:"
diff /tmp/dev_before /tmp/dev_after


   46  lsusb
   47  sudo nano /etc/udev/rules.d/99-usb-printer.rules
   48  sudo udevadm control --reload-rules
   49  sudo udevadm trigger
   50  sudo usermod -aG plugdev $USER


curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && sudo apt update && sudo apt install ngrok

cp ngrok.yml ~/.config/ngrok/ngrok.yml

ngrok start assimssh

    1  sudo nano /etc/cups/cupsd.conf
    2  sudo systemctl restart cups
    3  git
    4  ls
    5  cd dev
    6  ls
    7  git clone git@github.com:scuver/scuver-rest.git
    8  https://github.com/scuver/scuver-rest.git
    9  git clone https://github.com/scuver/scuver-rest.git
   10  ls
   11  cd scuver-rest/
   12  ls
   13  node print.js
   14  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
   15  nano ~/.bashrc
   16  nvm
   17  nano ~/.bashrc
   18  source ~/.bashrc
   19  nvm
   20  nvm install 14
   21  npm i
   22  node print.js
   23  git pull
   24  node print.js
   25  git pull
   26  node print.js
   27  nano print.js
   28  npm i body-parser
   29  nano print.js
   30  node print.js
   31  nano print.js
   32  node print.js
   33  nano print.js
   34  node print.js
   35  nano print.js
   36  node print.js
   37  nano print.js
   38  node print.js
   39  nano print.js
   40  git stash
   41  git pull
   42  npm i
   43  node print.js
   44  e Error: LIBUSB_ERROR_ACCESS
   45  sudo nano /etc/udev/rules.d/99-usb-printer.rules
   46  lsusb
   47  sudo nano /etc/udev/rules.d/99-usb-printer.rules
   48  sudo udevadm control --reload-rules
   49  sudo udevadm trigger
   50  sudo usermod -aG plugdev $USER
   51  sudo reboot
   52  nmcli dev wifi list
   53  nmcli dev wifi connect ext password mscgg2017
   54  sudo nmcli dev wifi connect ext password mscgg2017
   55  nmcli connection show
   56  ifconfig
   57  cd dev
   58  ls
   59  cd scuver-rest/
   60  forever print.js
   61  npm i forever
   62  forever print.js
   63  npx forever print.js
   64  history

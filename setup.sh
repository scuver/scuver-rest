# ligar ao rasp por ethernet
arp -a
# ver qual o que aparece ou desaparece conforme rasp ligado ou desligado
ssh ggomes@192.168.1.194

sudo raspi-config
#Navigate to Network Options
#
#Use the arrow keys to navigate.
#Select Network Options.
#Press Enter.
#Select Wi-Fi
#
#Select Wi-Fi.
#Press Enter.
#Enter SSID
#
#Enter the SSID (name) of your Wi-Fi network.
#Press Enter.
#Enter Password
#
#Enter the password for your Wi-Fi network.
#Press Enter.
#Exit raspi-config
#
#Navigate to Finish.
#Press Enter.

sudo apt-get update
sudo apt-get install cups autossh sshpass git  -y
npm install -g localtunnel

sudo usermod -a -G lpadmin ggomes
sudo nano /etc/cups/cupsd.conf

# Only listen for connections from the local machine.
# COMENTAR - Listen localhost:631
# ADICIONAR - Port 631
# MANTER - Listen /var/run/cups/cups.sock
# ADICIONAR OS ALLOW ABAIXO
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
# http://192.168.1.195:631

# Unknow -> Raw -> Raw

git clone https://github.com/scuver/scuver-rest.git

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source /home/ggomes/.bashrc
nvm install 14
cd scuver-rest || exit 0
npm i
npm i -g forever

lsusb
sudo nano /etc/udev/rules.d/99-usb-printer.rules
# SUBSYSTEM=="usb", ATTR{idVendor}=="0fe6", ATTR{idProduct}=="811e", MODE="0666", GROUP="lp", SYMLINK+="usbprinter"
# SUBSYSTEM=="usb", ATTR{idVendor}=="1fc9", ATTR{idProduct}=="2016", MODE="0666", GROUP="lp", SYMLINK+="usbprinter"
sudo udevadm control --reload-rules
sudo udevadm trigger
sudo usermod -aG plugdev $USER

sudo nano /etc/rc.local
/usr/local/bin/start_ssh_tunnel.sh &
sudo chmod +x /etc/rc.local
sudo cp /home/ggomes/.ssh/known_hosts /root/.ssh/known_hosts
sudo chown root:root /root/.ssh/known_hosts
sudo chmod 644 /root/.ssh/known_hosts
sudo chown root:root /root/.ssh
sudo chmod 700 /root/.ssh

sudo nano /usr/local/bin/start_ssh_tunnel.sh
#!/bin/bash
sshpass -p 'password_para_oak' autossh -M 0 -N -R 2222:localhost:22 ggomes@oh-168-119-202-164.client.oakhost-customer.net &
sudo chmod +x /usr/local/bin/start_ssh_tunnel.sh
ssh ggomes@oh-168-119-202-164.client.oakhost-customer.net
/usr/local/bin/start_ssh_tunnel.sh

ssh ggomes@oh-168-119-202-164.client.oakhost-customer.net
ssh ggomes@localhost -p 2222

#sudo systemctl start bluetooth
#sudo systemctl enable bluetooth
#service bluetooth status
#bluetoothctl
#power on
#scan on
#trust 40:EF:4C:9A:5D:DF
#pair 40:EF:4C:9A:5D:DF
#connect 40:EF:4C:9A:5D:DF

# bash run.sh s4qRI8ezYhR947BJ39sF
# bash run.sh rYhGRvkYLA2HHyrhuMMd

forever stopall
forever print.js &

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

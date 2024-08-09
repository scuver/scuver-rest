sudo apt -y install sshpass ssh net-tools
ufw disable
ssh -J serveo.net ggomes@tastic1
rsync --progress -avz -e "sshpass -p m ssh -J serveo.net" files/* ggomes@tastic1:/home/ggomes/
sshpass -p m ssh -J serveo.net ggomes@tastic1
sudo apt install sshpass
sshpass -p m sudo apt-get update && sshpass -p m sudo apt -y install sshpass curl chromium-browser cups autossh sshpass git x11vnc gcc
#sshpass -p m sudo cp -pr silead /lib/firmware
sshpass -p m sudo cp /home/ggomes/cupsd.conf /etc/cups/cupsd.conf
sshpass -p m sudo cp /home/ggomes/99-usb-printer.rules /etc/udev/rules.d/99-usb-printer.rules
sshpass -p m sudo cp /home/ggomes/start_tastic_linux.sh /usr/local/bin/start_tastic_linux.sh && sshpass -p m sudo chmod +x /usr/local/bin/start_tastic_linux.sh
sshpass -p m sudo cp /home/ggomes/tastic-linux.service /etc/systemd/system/tastic-linux.service
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source /home/ggomes/.bashrc
nvm install 14
npm install -g pm2
sshpass -p m sudo usermod -a -G lpadmin ggomes
sshpass -p m sudo udevadm control --reload-rules
sshpass -p m sudo udevadm trigger
sshpass -p m sudo usermod -aG plugdev ggomes
sshpass -p m sudo systemctl restart cups
git clone https://github.com/scuver/scuver-rest.git
cd scuver-rest && npm i
sshpass -p m sudo systemctl enable tastic-linux
sshpass -p m sudo systemctl start tastic-linux
sshpass -p m sudo systemctl status tastic-linux
#wget https://raw.githubusercontent.com/Myself5/Chuwi_Hi10_Air_Linux/master/2in1screen.c
#gcc -O2 -o 2in1screen 2in1screen.c
#sshpass -p m sudo mv 2in1screen /usr/local/bin/
#sshpass -p m sudo chmod +x /usr/local/bin/2in1screen
#sshpass -p m sudo grub-mkconfig -o /boot/grub/grub.cfg

# Não esquecer de adicionar impressora no cups 172.29.24.197:631

# https://discourse.lubuntu.me/t/lxqt-monitor-resolution-in-lubuntu-20-04/2561/4
sudo nano /etc/X11/xorg.conf.d/10-monitor.conf
sudo chmod +x /etc/X11/xorg.conf.d/10-monitor.conf
Section "Monitor"
       Identifier "DSI-1"
       Modeline "900x1440R"  94.50  904 952 984 1064  1440 1443 1453 1481 +hsync -vsync
       Option "PreferredMode" "900x1440R"
EndSection

# WSL
# No powershell

dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# add samba printer
smb://Usuario:m@192.168.68.104/TasticPrinter

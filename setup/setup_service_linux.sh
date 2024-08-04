# tmp12345
rsync --progress -avz -e "sshpass -p tmp12345 ssh" files/* 192.168.1.199:/home/ggomes/
sshpass -p tmp12345 ssh 192.168.1.199 'sshpass -p tmp12345  sudo apt -y install sshpass curl'
sshpass -p tmp12345 ssh 192.168.1.199 << EOF
sshpass -p tmp12345 sudo cp /home/ggomes/cupsd.conf /etc/cups/cupsd.conf
sshpass -p tmp12345 sudo cp /home/ggomes/99-usb-printer.rules /etc/udev/rules.d/99-usb-printer.rules
sshpass -p tmp12345 sudo cp /home/ggomes/start_tastic_linux.sh /usr/local/bin/start_tastic_linux.sh && sshpass -p tmp12345 sudo chmod +x /usr/local/bin/start_tastic_linux.sh
sshpass -p tmp12345 sudo cp /home/ggomes/tastic-linux.service /etc/systemd/system/tastic-linux.service
sshpass -p tmp12345 sudo apt-get update
sshpass -p tmp12345 sudo apt-get install cups autossh sshpass git  localtunnel -y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
source /home/ggomes/.bashrc
nvm install 14
npm install -g pm2
sshpass -p tmp12345 sudo usermod -a -G lpadmin ggomes
sshpass -p tmp12345 sudo udevadm control --reload-rules
sshpass -p tmp12345 sudo udevadm trigger
sshpass -p tmp12345 sudo usermod -aG plugdev ggomes
sshpass -p tmp12345 sudo systemctl restart cups
git clone https://github.com/scuver/scuver-rest.git
cd scuver-rest && npm i
sshpass -p tmp12345 sudo systemctl enable tastic-linux
sshpass -p tmp12345 sudo systemctl start tastic-linux
sshpass -p tmp12345 sudo systemctl status tastic-linux
EOF

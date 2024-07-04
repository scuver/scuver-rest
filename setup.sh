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


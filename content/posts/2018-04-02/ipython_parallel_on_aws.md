---
title: "IPython parallel on aws"
cover: "/logos/aws.jpg"
category: "Systems management"
tags:

    - IPython
    - parallel
    - Jupyter
    - AWS VPC
    - Docker
date: 2018-04-02 0:00
---

TODO: reference VPC template

Use NAT instance
add ICMP to secure group (public/private)
OpenVPN

Install opevpn

easy-rsa old

Client:

Server:
yum -y install openvpn

sudo iptables -t nat -A POSTROUTING -s 172.16.0.0/22 -o eth0 -j MASQUERADE
sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE
sudo echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p

openvpn --genkey --secret static.key

easy-rsa

wget https://github.com/OpenVPN/easy-rsa-old/archive/2.3.3.tar.gz
tar xzf 2.3.3.tar.gz
ls
cp -rf easy-rsa-old-2.3.3/easy-rsa/2.0/* /etc/openvpn/easy-rsa



source vars
./clean-all
./build-ca
./build-dh
./build-key-server server

sudo chmod -R 0600 /etc/openvpn/keys



sudo iptables --table nat --verbose -L

sudo service iptables save

ssh -vvv -i /home/ec2-user/.ssh/dinne_key.pem ubuntu@10.0.20.165


TODO add to startup
sudo service openvpn start

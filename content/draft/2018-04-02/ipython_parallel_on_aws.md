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
systemctl restart openvpn@client.service


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
sudo service openvpn star


swarm

docker-machine

~/.aws/credentials
[default]
aws_access_key_id = AKID1234567890
aws_secret_access_key = MY-SECRET-KEY


export VPC=vpc-0ddc1767507d57a44
export REGION=eu-west-3 # the region to use
export SUBNET=subnet-private 
export ZONE=a # the zone to use

Swarm:

docker-machine --debug create -d amazonec2 --amazonec2-private-address-only --amazonec2-vpc-id $VPC --amazonec2-region $REGION --amazonec2-zone $ZONE --amazonec2-instance-type t2.micro --amazonec2-subnet-id $SUBNET --amazonec2-security-group swarm swarm-manager

docker-machine ip swarm-manager
eval $(docker-machine env swarm-manager)
docker swarm init --advertise-addr 10.0.0.22

aws ec2 describe-security-groups --filter "Name=group-name,Values=swarm"
SECURITY_GROUP_ID=sg- #Copy the group id here
$ aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 2377 --source-group $SECURITY_GROUP_ID
--source-group should be 10.0.0.0/8
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 7946 --source-group $SECURITY_GROUP_ID
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol udp --port 7946 --source-group $SECURITY_GROUP_ID
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 4789 --source-group $SECURITY_GROUP_ID
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol udp --port 4789 --source-group $SECURITY_GROUP_ID

$ eval $(docker-machine env demo-swarm-node1)
$ docker swarm join  --token TOKEN 10.0.0.22:2377 # This is the command copied from docker swarm init command's output

Test

docker-machine ssh swarm-node1
sudo groupadd -g 1003 dinne
sudo useradd -m -u 1003 -g 1003 dinne



NAT gateway

ec2-user@ip-10-0-130-198 ~]$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.128.1      0.0.0.0         UG    0      0        0 eth0
10.0.128.0      0.0.0.0         255.255.240.0   U     0      0        0 eth0
169.254.169.254 0.0.0.0         255.255.255.255 UH    0      0        0 eth0
172.16.0.0      172.16.0.2      255.255.252.0   UG    0      0        0 tun0
172.16.0.2      0.0.0.0         255.255.255.255 UH    0      0        0 tun0

[ec2-user@ip-10-0-130-198 ~]$ sudo iptables --table nat -S
-P PREROUTING ACCEPT
-P INPUT ACCEPT
-P OUTPUT ACCEPT
-P POSTROUTING ACCEPT
-A POSTROUTING -s 10.0.0.0/19 -o eth0 -j MASQUERADE

private manager node:

ubuntu@swarm-manager:~$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    0      0        0 eth0
10.0.0.0        0.0.0.0         255.255.224.0   U     0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker_gwbridge


public-node:
 
ubuntu@swarm-public-node2:~$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.128.1      0.0.0.0         UG    0      0        0 eth0
10.0.128.0      0.0.0.0         255.255.240.0   U     0      0        0 eth0
172.16.0.0      10.0.130.198    255.255.252.0   UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
172.18.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker_gwbridge



File server:

sudo systemctl start nfs-kernel-server.service

/etc/exports
    /home    10.0.0.0/8(rw,sync,no_root_squash)
sudo exportfs -a

swarm-node (test nfs access):
sudo apt install nfs-common
????sudo route add -net 172.16.0.0 netmask 255.255.0.0 gw 10.0.0.1
sudo mount 172.16.0.6:/home /local


network
https://github.com/moby/moby/issues/27399
docker network create --driver overlay --subnet=192.169.1.0/24 stm_overlay


//TODO-------------------------
access registry from manager
# docker --version
Docker version 17.09.0-ce, build afdb6d4

# sudo echo '{"insecure-registries" : ["docker01:5000"]}' > /etc/docker/daemon.json
# sudo service docker restart
# docker service create --name=registry --mount source=/data/registry,target=/var/lib/registry,type=bind --publish 5000:5000 registry:2
# docker pull alpine
# docker tag alpine docker01:5000/alpine
# docker push docker01:5000/alpine




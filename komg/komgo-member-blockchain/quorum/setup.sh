#!/bin/bash

#
# Create all the necessary scripts, keys, configurations etc. to run
# a cluster of N Quorum nodes with Raft consensus.
#
# The nodes will be in Docker containers. List the IP addresses that
# they will run at below (arbitrary addresses are fine).
#
# Run the cluster with "docker-compose up -d"
#
# Run a console on Node N with "geth attach .db/qdata_N/dd/geth.ipc"
# (assumes Geth is installed on the host.)
#
# Geth and Constellation logfiles for Node N will be in .db/qdata_N/logs/
#

# TODO: check file access permissions, especially for keys.


#### Configuration options #############################################

# One Docker container will be configured for each IP address in $ips
subnet="172.13.0.0/16"
ips=("172.13.0.2" "172.13.0.3" "172.13.0.4" "172.13.0.5")

# Docker image name
image=quorum

########################################################################

nnodes=${#ips[@]}

if [[ $nnodes < 2 ]]
then
    echo "ERROR: There must be more than one node IP address."
    exit 1
fi

${BASH_SOURCE%/*}/cleanup.sh

uid=`id -u`
gid=`id -g`
pwd=`pwd`

#### Create directories for each node's configuration ##################

echo '[1] Configuring for '$nnodes' nodes.'

n=1
for ip in ${ips[*]}
do
    qd=.db/qdata_$n
    mkdir -p $qd/{logs,keys}
    mkdir -p $qd/dd/geth

    let n++
done


#### Make permissioned-nodes.json and store keys #############################

echo '[2] Creating Enodes and permissioned-nodes.json.'

echo "[" > permissioned-nodes.json
n=1
for ip in ${ips[*]}
do
    qd=.db/qdata_$n

    # Generate the node's Enode and key
    docker run --rm -u $uid:$gid -v "$pwd/$qd":/qdata $image /usr/local/bin/bootnode -genkey /qdata/dd/nodekey
    enode=`docker run --rm -u $uid:$gid -v "$pwd/$qd":/qdata $image /usr/local/bin/bootnode -nodekey /qdata/dd/nodekey -writeaddress`

    # Add the enode to permissioned-nodes.json
    sep=`[[ $n < $nnodes ]] && echo ","`
    echo '  "enode://'$enode'@'$ip':30303?discport=0"'$sep >> permissioned-nodes.json

    let n++
done
echo "]" >> permissioned-nodes.json


#### Create accounts, keys and genesis.json file #######################

echo '[3] Creating Ether accounts and genesis.json.'

cat > genesis.json <<EOF
{
  "alloc": {
EOF

n=1
for ip in ${ips[*]}
do
    qd=.db/qdata_$n

    # Generate an Ether account for the node
    touch $qd/passwords.txt
    account=`docker run --rm -u $uid:$gid -v "$pwd/$qd":/qdata $image /usr/local/bin/geth --datadir=/qdata/dd --password /qdata/passwords.txt account new | cut -c 11-50`

    # Add the account to the genesis block so it has some Ether at start-up
    cat >> genesis.json <<EOF
    "${account}": {
      "balance": "0x1000000000000000000000000000"
    },
EOF

    let n++
done

cat >> genesis.json <<EOF
    "0x0000000000000000000000000000000000000020": {
      "balance": "1000000000000000000000000000"
    }
  },
  "coinbase": "0x0000000000000000000000000000000000000000",
  "config": {
    "homesteadBlock": 1,
    "eip150Block": 2,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 3,
    "eip158Block": 3,
    "byzantiumBlock": 4,
    "istanbul": {
      "epoch": 30000,
      "policy": 0
    },
    "isQuorum": true,
    "chainId": 10345
  },
EOF


n=1
echo "[" > verifiers.json
for ip in ${ips[*]}
do
  qd=.db/qdata_$n
  sep=`[[ $n < $nnodes ]] && echo ","`
  echo "\"`docker run --rm -u $uid:$gid -v "$pwd/$qd":/qdata $image bash -c "/usr/local/bin/nodekeytoaddress < /qdata/dd/nodekey"  | cut -c 19-58 | tr '[:upper:]' '[:lower:]'`\"$sep" >> verifiers.json
  let n++
done
echo "]" >> verifiers.json

cp verifiers.json .db/qdata_1/

echo '"extraData": "'`docker run --rm -u $uid:$gid -v "$pwd/.db/qdata_1":/qdata $image bash -c "/usr/local/bin/istanbulextradatagen < /qdata/verifiers.json"  | cut -c 23-400`'",' >> genesis.json


cat >> genesis.json <<EOF
  "gasLimit": "0x2FEFD800",
  "difficulty": "0x1",
  "mixHash": "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
  "nonce": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp": "0x00"
}
EOF

#### Make node list for tm.conf ########################################

nodelist=
n=1
for ip in ${ips[*]}
do
    sep=`[[ $ip != ${ips[0]} ]] && echo ","`
    nodelist=${nodelist}${sep}'"http://'${ip}':9000/"'
    let n++
done


#### Complete each node's configuration ################################

echo '[4] Creating Quorum keys and finishing configuration.'

n=1
for ip in ${ips[*]}
do
    qd=.db/qdata_$n

    cat  ${BASH_SOURCE%/*}/templates/tm.conf \
        | sed s/_NODEIP_/${ips[$((n-1))]}/g \
        | sed s%_NODELIST_%$nodelist%g \
              > $qd/tm.conf

    cp genesis.json $qd/genesis.json
    cp permissioned-nodes.json $qd/dd/permissioned-nodes.json
    cp permissioned-nodes.json $qd/dd/static-nodes.json

    # Generate Quorum-related keys (used by Constellation)
    docker run --rm -u $uid:$gid -v "$pwd/$qd":/qdata $image /usr/local/bin/constellation-node --generatekeys=/qdata/keys/tm,/qdata/keys/tma <<EOF


EOF
    echo 'Node '$n' public key: '`cat $qd/keys/tm.pub`
    mkdir $qd/constellation
    cp ${BASH_SOURCE%/*}/templates/start-node.sh $qd/start-node.sh
    chmod 755 $qd/start-node.sh

    let n++
done
rm -rf genesis.json permissioned-nodes.json verifiers.json


#### Create the docker-compose file ####################################

cat > docker-compose.yml <<EOF
version: '2'
services:
EOF

n=1
for ip in ${ips[*]}
do
    qd=.db/qdata_$n

    cat >> docker-compose.yml <<EOF
  node_$n:
    image: $image
    volumes:
      - './$qd:/qdata'
    networks:
      quorum_net:
        ipv4_address: '$ip'
    ports:
      - $((n+22000)):8545
    user: '$uid:$gid'
EOF

    let n++
done

cat >> docker-compose.yml <<EOF

networks:
  quorum_net:
    driver: bridge
    ipam:
      driver: default
      config:
      - subnet: $subnet
EOF


#### Create pre-populated contracts ####################################

# Private contract - insert Node 2 as the recipient
# cat ${BASH_SOURCE%/*}/templates/contract_pri.js \
#     | sed s:_NODEKEY_:`cat .db/qdata_2/keys/tm.pub`:g \
#           > contract_pri.js

# Public contract - no change required
# cp ${BASH_SOURCE%/*}/templates/contract_pub.js ./

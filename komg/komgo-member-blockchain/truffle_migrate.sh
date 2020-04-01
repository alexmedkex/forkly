#!/bin/bash

if [ -z $ENS_REGISTRY_CONTRACT_ADDRESS ];then
  echo "No ENS_REGISTRY_CONTRACT_ADDRESS defined"
  echo "truffle migrate"
  truffle migrate
  echo "truffle migrate finished"
else
  echo "npm run migrations:load"
  echo "ENS_REGISTRY_CONTRACT_ADDRESS $ENS_REGISTRY_CONTRACT_ADDRESS"
  npm run migrations:load
    echo $?
  echo "migrations:load finished"
  echo "About to run truffle migrate"
  truffle migrate
  echo "truffle migrate finished"
fi


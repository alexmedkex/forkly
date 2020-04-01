#!/usr/local/bin/python

import json
import argparse
import requests
import random

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

parser = argparse.ArgumentParser()

parser.add_argument('--role', '-r', type=str, default='buyer', choices=['buyer', 'seller'])
parser.add_argument('env', type=str, help='type local or localhost to create trades on localhost')
parser.add_argument('nTrades', type=int)

args = parser.parse_args()

trade = {
   'source':'VAKT',
   'vaktId':'6',
   'buyerEtrmId':'trade 6',
   'sellerEtrmId':'BP-1',
   'dealDate':'2017-12-31',
   'deliveryPeriod':{
      'startDate':'2017-12-31',
      'endDate':'2017-12-31'
   },
   'paymentTerms':{
      'eventBase':'BL',
      'when':'AFTER',
      'time':30,
      'timeUnit':'DAYS',
      'dayType':'CALENDAR'
   },
   'price':70.02,
   'currency':'USD',
   'priceUnit':'BBL',
   'quantity':600000,
   'deliveryTerms':'FOB',
   'minTolerance':1.25,
   'maxTolerance':1.25,
   'invoiceQuantity':'LOAD',
   'generalTermsAndConditions':'suko90',
   'laytime':'as per GT&Cs',
   'demurrageTerms':'as per GT&Cs',
   'law':'English Law',
   'requiredDocuments':[
   	'q88'
   ],
   'creditRequirement':'DOCUMENTARY_LETTER_OF_CREDIT',
   'seller':'08e9f8e3-94e5-459e-8458-ab512bee6e2c',
   'buyer':'a3d82ae6-908c-49da-95b3-ba1ebe7e5f85'
}

cargo = {
   'source':'VAKT',
   'vaktId':'6',
   'cargoId':'5555',
   'grade':'FORTIES',
   'parcels':[
      {
         'id':'idparcel1',
         'laycanPeriod':{
            'startDate':'2018-09-01',
            'endDate':'2018-09-30'
         },
         'vesselIMO':1,
         'vesselName':'Andrej',
         'loadingPort':'Banja luka',
         'dischargeArea':'Sarajevo',
         'inspector':'Kenan',
         'deemedBLDate':'2018-09-01',
         'quantity':3
      }
   ]
}

tokenHeaders = {
   'Content-Type': 'application/x-www-form-urlencoded',
   'Postman-Token': '4abeb3dd-0d14-45c4-828b-5b1471a1b6bb',
   'cache-control': 'no-cache'
}

keycloakUrl = 'http://localhost:8070/auth/realms/KOMGO/protocol/openid-connect/token' if args.env == 'local' or args.env == 'localhost' else 'https://keycloak.%s.gmk.solutions.consensys-uk.net/auth/realms/KOMGO/protocol/openid-connect/token' %args.env
profileUrl = 'http://localhost:3333/api/users/v0/profile' if args.env == 'local' or args.env == 'localhost' else 'https://api.%s.gmk.solutions.consensys-uk.net/api/users/v0/profile' %args.env
counterpartiesUrl = 'http://localhost:3333/api/coverage/v0/counterparties?query={}' if args.env == 'local' or args.env == 'localhost' else 'https://api.%s.gmk.solutions.consensys-uk.net/api/coverage/v0/counterparties?query={}' %args.env
tradeUrl = 'http://localhost:3333/api/trade-cargo/v0/trades/' if args.env == 'local' or args.env == 'localhost' else 'https://api.%s.gmk.solutions.consensys-uk.net/api/trade-cargo/v0/trades/' %args.env
movementUrl = 'http://localhost:3333/api/trade-cargo/v0/movements/' if args.env == 'local' or args.env == 'localhost' else 'https://api.%s.gmk.solutions.consensys-uk.net/api/trade-cargo/v0/movements/' %args.env

tokenReq = requests.post(keycloakUrl, data='username=superuser&password=z2L%22Y!vYja%3E%3D&grant_type=password&client_id=web-app', headers=tokenHeaders, verify=False)
token = json.loads(tokenReq.text)['access_token']

requestHeaders = {
   'authorization': 'Bearer %s' %token
}

profileReq = requests.get(profileUrl, verify=False, headers=requestHeaders)
myId = json.loads(profileReq.text)['company']

counterpartiesReq = requests.get(counterpartiesUrl, verify=False, headers=requestHeaders)
tradingCompanyIds = map(lambda x: x['staticId'], list(filter(lambda x: x['isFinancialInstitution'] is False, json.loads(counterpartiesReq.text))))

if len(tradingCompanyIds) is 0:
   print 'No counterparties, cannot create any trades'
   exit()

for i in range(args.nTrades):
   vaktId = random.randint(0,10000)
   trade['vaktId'] = '%s' % vaktId
   trade['buyerEtrmId'] = 'trade %s' % vaktId
   trade['sellerEtrmId'] = 'trade %s' % vaktId
   trade['price'] = round(random.uniform(1,6000),2)
   trade['quantity'] = random.randint(1, 1000000)
   trade['dealDate'] = '%s-%02d-%02d' % (random.randint(2000,2025), random.randint(1,12), random.randint(1,31))
   cargo['vaktId'] = '%s' % vaktId

   if args.role == 'seller':
      trade['seller'] = myId
      trade['buyer'] = random.choice(tradingCompanyIds)
   else:
      trade['seller'] = random.choice(tradingCompanyIds)
      trade['buyer'] = myId

   requests.post(tradeUrl, json=trade, verify=False, headers=requestHeaders)
   requests.post(movementUrl, json=cargo, verify=False, headers=requestHeaders)

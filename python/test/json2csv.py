#! /usr/bin/env python 
# -*- coding: utf-8 -*- 
import json
import csv
import urllib2
from datetime import datetime
import time

sTime = time.time()
print time.strftime('Start time: %m-%d %X', time.localtime(sTime))

url = "http://www.cpppc.org:8082/efmisweb/ppp/projectLivrary/getPPPList.do?queryPage="

# fetch initial data
response = urllib2.urlopen(url + '1')
raw = json.loads(response.read())

total  = raw['totalPage']
list_data = raw['list']

# fetch the left data
for i in range(2, total+1):
	res = urllib2.urlopen(url + str(i))
	tmp = json.loads(res.read())
	tmp_list = tmp['list']
	list_data.extend(tmp_list)

# open a file for writing
today = datetime.today()
fileName = 'data' + str(today.year) + str(today.month) + str(today.day) + '_' + str(today.hour) + str(today.minute) + '.csv'
output = open(fileName, 'wb')

# create the csv writer object
csvwriter = csv.writer(output)

count = 0

# write list into CSV
for item in list_data:
	values = []
	if count == 0:
		header = item.keys()
		csvwriter.writerow(header)
		count += 1
	
	# encode chinese string as gbk
	for v in item.values():
		if isinstance(v, basestring):
			v = v.encode('gb18030','ignore')
		values.append(v)
	csvwriter.writerow(values)
	#csvwriter.writerow(item.values())

output.close()

eTime = time.time()
print time.strftime('End time: %m-%d %X', time.localtime(eTime))
tTime = round(eTime - sTime)
print 'Tolal time: ', int(tTime)

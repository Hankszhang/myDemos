# -*- coding: utf-8 -*- 
import json
import csv
import urllib2

import sys
reload(sys)
sys.setdefaultencoding('gbk')

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
output = open('Data.csv', 'w')

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
	#for v in item.values():
	#	if isinstance(v, basestring):
	#		v = v.encode('gbk')
	#	values.append(v)
	#csvwriter.writerow(values)
	csvwriter.writerow(item.values())

output.close()
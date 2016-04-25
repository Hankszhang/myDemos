#!/usr/bin/python
#-- encoding:utf-8 --
""" this script is used for quering interview result
    Date: 2016-4-25
    Author: Hanks
"""

import urllib
import urllib2
from pyquery import PyQuery as pq
import time

def query():

    'Use this function to query my interview result.'

    data = {
        "type": "query_result",
        "idcard": "1534",
        "phone": "18521006165"
    }
    data_urlencode = urllib.urlencode(data)
    requrl = "http://m.join.qq.com/query/result"
    req = urllib2.Request(url=requrl, data=data_urlencode)
    res = urllib2.urlopen(req).read()
    pqhtml = pq(res)
    return pqhtml(".query-result").find("p").eq(1).text()

def sendmail(content=None):

    "Send email to my 163mail"

    if content is None:
        print 'content is None'
        return False
    try:
        from smtplib import SMTP
        from email.mime.text import MIMEText

        from_addr = "hankscindy@163.com"
        password = "hanks0722"
        to_addr = "hankszhang@sjtu.edu.cn"
        email_client = SMTP(host='smtp.163.com')
        email_client.login(from_addr, password)

        #create message
        msg = MIMEText(content, _charset='utf-8')
        msg['Subject'] = "Interview Status Changed!"
        email_client.sendmail(from_addr, to_addr, msg.as_string())
        return True
    except Exception, e:
        print e
        return False
    finally:
        email_client.quit()

def timer(delay):

    "Set a timer for repeating query"

    prevstr = u"你已完成所有面试环节"
    while True:
        content = query()
        if prevstr != content:
            sendmail(content)
        print time.strftime('%m-%d %X', time.localtime()) + " Result: "+ content
        time.sleep(delay)

if __name__ == '__main__':
    timer(3600)  #excute every 1 hour

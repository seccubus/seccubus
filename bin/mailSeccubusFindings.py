#!/usr/bin/env python
# ------------------------------------------------------------------------------
# Copyright 2016 Artien Bel, Frank Breedijk
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import requests, json, sys, smtplib
from  requests.auth import HTTPBasicAuth
from email.mime.text import MIMEText

#fakeIt = 1 -> no mail or updating findings
fakeIt = 0

#yeah yeah can iterate through this too and make a nice menu or whatever
workspaces = {'109':'test123',"110":"myworkspace"}

#seccubus api stuff
user=""
password=""
getScansURL = "https://127.0.0.1/seccubus/seccubus/json/getScans.pl"
getFindingsURL = "https://127.0.0.1/seccubus/seccubus/json/getFindings.pl"
updateFindingsURL= "https://127.0.0.1/seccubus/seccubus/json/updateFindings.pl"

#email info
sender= "sender@mydomain.com"
recipient="dst@mydomain.com"

#fill in all severities you want a mail made from
severityMailMatch = ["High","Medium"]
mailHost = "127.0.0.1"

#what text to update finding with after email is send
remarkTXT = "Finding automatically mailed"

def getScans(workspaceId):
    payload = "workspaceId="+ workspace 
    print "* Requesting scans for workspace: %s" % workspaces.get(workspaceId)
    r = requests.post(getScansURL, auth=HTTPBasicAuth(user,password), data=payload, verify=False)
    result = r.json()
    print "* There are %i scans for this workspace." %len(result)
    scanIds=[]
    for stuff in result:
        scanIds.append((stuff.get('id'), stuff.get('name')))
    return scanIds

def getFindings(workspace,scanIddict, status):
    scanId = scanIddict[0]
    scanName = scanIddict[1]
    payload = "workspaceId="+workspace+"&scanIds%5B%5D="+scanId+"&Status="+str(status)+"&Scans%5B%5D="+scanId+"&Host=*&HostName=*&Port=*&Plugin=*&Severity=*&Finding=*&Remark=*"
    r = requests.post(getFindingsURL, auth=HTTPBasicAuth(user,password), data=payload, verify=False)
    result = r.json()
    print "\t There are %i findings for scan: %s" % (len(result),scanName)
    scanResults=[]
    for stuff in result:
        scanResults.append((stuff.get('host'), stuff.get('hostName'), stuff.get('severityName'), stuff.get('port'), stuff.get('find'), stuff.get('remark'), stuff.get('id')))
    return scanResults

def sendFinding(findInfo,workspace,status):
    severity=findInfo[2]
    if (severity in severityMailMatch) and (findInfo[5].find(remarkTXT) < 0):
        print("\t\tFinding is above severity treshhold, and remark field does not contain string, lets mail!")
        firstlineFind=findInfo[4][0:findInfo[4].find("\n")]
        emailTopic = findInfo[0] + " (" + str(findInfo[1]) + ") - " + severity + " - " + firstlineFind
	emailBody = "Port: " + findInfo[3] + "\n" + findInfo[4]
        if fakeIt == 0:
            sendMail(emailTopic, emailBody)
            updateRemark(findInfo[6], workspace,status)
	else:
            print "+++ faking it, not actually sending mail or updating seccubus +++"

def sendMail(emailTopic, emailBody):
    msg = MIMEText(emailBody)
    msg['Subject'] = emailTopic
    msg['From'] = sender
    msg['To'] = recipient
    s = smtplib.SMTP(mailHost)
    s.sendmail(sender, [recipient],msg.as_string())
    s.quit()

def updateRemark(findingId, workspace,status):
    payload = "ids%5B%5D=" + findingId+ "&attrs%5Bremark%5D=" + remarkTXT + "&attrs%5Bstatus%5D=" + str(status) + "&attrs%5BworkspaceId%5D=" +workspace
    r=requests.post(updateFindingsURL, auth=HTTPBasicAuth(user,password), data=payload, verify=False)
    if r.status_code == 200:
        print "\t\t\tUpdated finding text"
    else:
        print "Error updating finding text. be careful, it will be send again if you redo this"

if __name__ == "__main__":
    workspace="106"
    wsScanIds = getScans(workspace)
    for scanId in wsScanIds:
        #status: 1 new, 2 changed, 3 open, 4 no issue, etc
        status =1
	findings=getFindings(workspace,scanId,status)
        if len(findings) > 0:
            for findInfo in findings:
		sendFinding(findInfo,workspace,status)	

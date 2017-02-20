About Seccubus
==============
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.x is the only actively developed and maintained branch and all support 
for Seccubus V1 has officially been dropped. 

Seccubus V2 works with the following scanners:
* Nessus 
* OpenVAS
* Skipfish
* Medusa (local and remote)
* Nikto (local and remote)
* NMap (local and remote)
* OWASP-ZAP (local and remote)
* SSLyze
* Medusa
* Qualys SSL labs

For more information visit [www.seccubus.com]

Seccubus Docker container
=========================

Usage
---

Running a full stack (db/app/frontend) in a single container. And get an interactive shell
---

```
docker run -it seccubus /bin/bash
```

By default the container holds a MariaDB server that runs and stores data locally. If you want data persistency there are two options:

Mount a local filesystem to `/var/lib/mysql`
```
docker run -it seccubus -v /some/local/dir:/var/lib/mysql /bin/bash
```

Please be aware that you can only run one container at a time if you mount a local directory on /var/lib/mysql.

Alternativly you cloud connect the container to a remote mysql/MariaDB database with environment viariables:
```
docker run -ti seccubus -e DBHOST=dns.name.of.db.host \
-e DBPOSRT=3306 \
-e DBNAME=name.of.database \
-e DBUSER=db.username \
-e DBPASS=password \
/bin/bash
```


Running a scan
---
Run the following command to start the scan 'ssllabs' in workspace 'Example' (this workspace is created by default if you use the local mysql database)

```
docker run -ti seccubus scan Example ssllabs
```

Please be aware that you need soem data persistency here or the data will be stored in a local database that will be deleted whent he container terminates

Show this help message
---
```
docker run -ti seccubus help
```

Default command
---
If you don't specify a command to docker run
```
docker run seccubus
```
The apache access log and error log will be tailed to the screen.


Other options
---
You can set the following environment variables:

* STACK - Determines which part of the stack is run
  - full - Run everything
  - front - Start apache to serve the html/javascript frontend (this requires that the APIURL variable is set too)
  - api - Start apache to serve the json api at / (starts MariaDB too if required)
  - web - Start apache to serve both the html/javascript frontend and the json
  - perl - Do not start apache, just use this container as an perl backend
* DBHOST, DBPORT, DBNAME, DBUSER, DBPASS - Database connection parameters
  - If DBHOST/DBPORT are set to 127.0.0.1/3306 the local MariaDB instance is started
* APIURL - Path to the API url
  - Set this if your set STACK to front to redirect the API calls to an alternative relative or absolute URL.
* BASEURI - Base URI for seccubus
  - Server the application at the value provided
* SMTPSERVER - IP address or host name of an SMTP server to be used for notifications
* SMTPFROM - From address used in notifications
* TICKETURL_HEAD/TICKETURL_TAIL - If these are set ticket numberrs will be linked to this URL
  - E.g. TICKERURL_HEAD = https://jira.example.com/projects/SECC/issues/
  - TICKERURL_TAIL = ?filter=allopenissues
  - Ticket SECC-666 would be linked to https://jira.example.com/projects/SECC/issues/SECC-666?filter=allopenissues
* SSHKEY1, SSHKEY2, SSHKEY3 .. SSHKEY9
  - The content of this environment variable will stored in the file /opt/seccubus/.ssh/SSHKEY1 etc.
  - You can use this mechanism to provide ssh keys that are used to start remote scans
* HTTP_AUTH_HEADER - Set the http authentication header
  - If you are using something like OpenAM to authenticate your users, this allows you to set which http request header contains the user that OpenAM detected


Change log
==========
Changes of this branch vs the [latest/previous release](https://github.com/schubergphilis/Seccubus/releases/latest)

---

21-2-2017 - 2.28 - The Docker edition
=================================================================

For my work at [Schuberg Philis](https://www.schubergphilis.com) we wanted to run Seccubus in Docker 
containers. This and inspiration from [Karl Newell](https://hub.docker.com/r/karlnewell/seccubus/) 
caused me to add a Dockerfile (and some other files) to Seccubus so that Seccubus can now be 
run in a docker container. 

In addition I fixed a couple of bugs and changed the ssllabs scanner so it now uses the v3 API endpoint.

Enhancements
------------
* #361 - arkenoi created a netsparker2ivil tool that allows you to manually import Netsparker scans
* #331 - Now using SSLLabs API v3
* #386 - New SSL labs API output featues incorporporated
* #389 - API endpoint URL has moved to a single function so it can be patched if deployed in a 
         three tier architecture
* #392 - Alternative handling of the updateFIndings.pl API
* #397 - Allow seccubus to authenticate via an http request header
* #399 - Create a Docker container for Seccubus

Bug Fixes
---------
* #364 - auto_gen column was missing from asset_host table
* #358 - Could not get findings when an asset was used for the query
* #360 - Not able to export report in PDF format - This breaks the scan
* #336 - Non-critical RPM errors on CentOS 5
* #376 - Removed 50 host limit in filters as it was counterproductive
* #374 - Fixed Nikto path detection code
* #377 - Hostname filter wasn't working correctly, typed Hostname iso HostName
* #385 - SSLlabs failed because cypher preference order was split out per protocol by SSLlabs now.
* #394 - SSLlabs scanner failed if all enpoints fail and --gradeonly was used

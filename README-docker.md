Seccubus Docker container
=========================

Seccubus provides a number of docker containers that allow you to either deploy a full Seccubus stack with lightweight containers or run a full stack in a single container to play around.

| Image name   | Purpose                                               | Contents |
| ------------ | ----------------------------------------------------- | -------- |
| seccubus       | Run a full Seccubus stack in a single container     | Perl code, web servers, cron daemon, scanning tools and MariaDB server |
| seccubus-front | Serving just the front end HTML, javascript and css | NGinx webserver and code. No database, cron daemon, scanning tools, perl code or database. |
| seccubus-web   | Serving front and code and API simultaniously       | Perl code, frontend HTML code. Cron daemon,  scanning tools or database.   |
| seccubus-api   | Serving just the API.                               | Perl code. No front end code, cron daemon, scanning tools or database.      |
| seccubus-perl  | Running command line scripts, e.g. to scan          | Perl code, scanning tools. No front end code, cron deamon or database       |
| seccubus-cron  | Running cron deamon to execute scans                | Perl code, scanning tools and cron daemon. No front end code, or database.   |


Usage
---

Running a full stack (db/app/frontend) in a single container. And get an interactive shell
---

```
docker run -it seccubus/seccubus /bin/bash
```

By default the container holds a mysql server that runs and stores data locally. If you want data persistency there are two options:

Connect the container to a remote mysql/MariaDB database with environment viariables:
```
docker run -e DBHOST=dns.name.of.db.host \
-e DBPOSRT=3306 \
-e DBNAME=name.of.database \
-e DBUSER=db.username \
-e DBPASS=password \
-ti seccubus/seccubus \
/bin/bash
```

Or, mount a data volume with a db directory on it
```
mkdir data
mkdir data/db
docker run -it seccubus/seccubus -v $(pwd)/data:/opt/seccubus/data /bin/bash
```

Please be aware that you can only run one container at a time if you mount a local directory on /var/lib/mysql.


Running a scan
---

There are two ways to run a scan

### Starting a scan on an already running container

To start the scan 'ssllabs' in the workspace 'Example' on an already running container, you could run a command like this:

```
docker exec -ti <containerID or tag> su - seccubus -c "do-scan --workspace Example --scan ssllabs"
```


### Dedicated scan container

The following command will create a new container just for a signle scan and terminate this container after the scan is finised. It starts the scan 'ssllabs' in workspace 'Example' (this workspace is created by default if you use the local mysql database)

```
docker run -ti seccubus/seccubus scan Example ssllabs
```

Please be aware that you need some data persistency here or the data will be stored in a local database that will be deleted whent he container terminates.

Or use a minimal container and an external database.

```
docker run -ti -e DBHOST=<my.db.hostname> seccubus/seccubus-perl scan Example ssllabs
```

An optional fourth parameter can be given to specify that the scan should only run on a certain weekday, e.g. to only run this scan on Monday, you can specify"

```
docker run -ti seccubus/seccubus scan Example ssllabs Mon
```

This is usefull for container ochestration, like e..g Kubernetes cron jobs.

Running a scheduler
---
You can run a docker container as a scheduler. This will make it run cron and allow your crontab to execute scans.You can populate the crontab by either placing a file called `crontab` in the /opt/seccubus/data volume or puting the lines of you crontab in evironement variables starting with `CRON_`

```
docker run -e "STACK=cron" -e "CRON_1=* 0 * * * bin/do-scan -w Example -s ssllabs" -ti seccubus/seccubus
```

This will spin up a container that executes scan ssllabs from workspace Example at midnight every night.

You can set the TZ vairable to control the timezone.

Or use a minimal cron container:

```
docker run -e "CRON_1=* 0 * * * bin/do-scan -w Example -s ssllabs" -e DBHOST=<my.db.hostname> -ti seccubus/seccubus-cron
```


Controlling TLS certificates
---
The Seccubus container is TLS enabled by default. The environment variable TLS controls this behaviour. Of it is set to anything other then `yes`, TLS is turned off.

There are three ways to control the certificate:
* Do nothing : Self signed certificates will be generated for you
* Populate the variables TLSCERT and TLSKEY :  The contents will be placed in /opt/seccubus/data/seccubus.pem and /opt/seccubus/data/seccubus.key and used
* Put the certificates in the files seccubus.pem and seccubus.key on a data volume and mount it on /opt/seccubus/data

Show this help message
---
```
docker run -ti seccubus/seccubus help
```

Default command
---
If you don't specify a command to docker run
```
docker run seccubus/seccubus
```
The web server access log and error log will be tailed to the screen.


Other options
---
You can set the following environment variables:

* STACK - Determines which part of the stack is run in a full stack container (seccubus).
  - full - Run everything
  - front - Start apache to serve the html/javascript frontend (this requires that the APIURL variable is set too)
  - api - Start apache to serve the json api at / (starts MariaDB too if required)
  - web - Start apache to serve both the html/javascript frontend and the json
  - perl - Do not start apache, just use this container as an perl backend
* DBHOST, DBPORT, DBNAME, DBUSER, DBPASS - Database connection parameters
  - In a full stack container, if DBHOST/DBPORT are set to 127.0.0.1/3306 the local MariaDB instance is started
  - Must be set in a seccubus-web, seccubus-api, seccubus-perl or seccubus-cron container
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
* TZ - Set the timezone of the container
* TLS - Controls TLS behaviour `yes` means TLS is on, otherwise TLS is off. TLS is on by default.
* JIT_GROUP - Controls JIT provisioning of users
* CRON_MAIL_TO - Mail cron messages to this addres
* CRON_* - Add these lines to crontab in alphabetical order

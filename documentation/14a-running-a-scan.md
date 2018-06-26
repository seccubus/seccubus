---
version: 2
category: user
layout: page
title: Running a scan
---

Seccubus installed on an operating system
---

Become the Seccubus user

```
sudo su - seccubus
```

Run the do-scan command

```
do-scan -w 'workspacename' -s 'scanname' -v
```

Seccubus docker container
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
An optional fourth parameter can be given to specify that the scan should only run on a certain weekday, e.g. to only run this scan on Monday, you can specify"

```
docker run -ti seccubus/seccubus scan Example ssllabs Mon
```

This is usefull for container ochestration, like e..g Kubernetes cron jobs.
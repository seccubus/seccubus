About Seccubus
==============
Seccubus automates regular vulnerability scans with various tools and aids
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
* testssl.sh (local and remote)

For more information visit [www.seccubus.com]

Docker
======

Available images.

| Image name     | Purpose                                             | Size |
| -------------- | --------------------------------------------------- | ---- |
| seccubus       | Run a full Seccubus stack in a single container     | [![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus "Get your own image badge on microbadger.com") |
| seccubus-front | Serving just the front end HTML, javascript and css | [![](https://images.microbadger.com/badges/image/seccubus/seccubus-front.svg)](https://microbadger.com/images/seccubus/seccubus-front "Get your own image badge on microbadger.com") |
| seccubus-web   | Serving front and code and API simultaniously       |[![](https://images.microbadger.com/badges/image/seccubus/seccubus-web.svg)](https://microbadger.com/images/seccubus/seccubus-web "Get your own image badge on microbadger.com") |
| seccubus-api   | Serving just the API.                               |[![](https://images.microbadger.com/badges/image/seccubus/seccubus-api.svg)](https://microbadger.com/images/seccubus/seccubus-api "Get your own image badge on microbadger.com") |
| seccubus-perl  | Running command line scripts, e.g. to scan          |[![](https://images.microbadger.com/badges/image/seccubus/seccubus-perl.svg)](https://microbadger.com/images/seccubus/seccubus-perl "Get your own image badge on microbadger.com") |
| seccubus-cron  | Running cron deamon to execute scans                |[![](https://images.microbadger.com/badges/image/seccubus/seccubus-cron.svg)](https://microbadger.com/images/seccubus/seccubus-cron "Get your own image badge on microbadger.com") |



Information about the docker containers is in [README-docker.md]

Change log
==========
Changes of this branch vs the [latest/previous release](https://github.com/schubergphilis/Seccubus/releases/latest)

---

x-x-2018 - v2.49 - Developement release
====================================================
New docker containers and compatibility with MySQL/MariaDB version 8

Differences with 2.48

Enhancements
------------
* Seccubus containers are now built based on Alpine
* Minimal specialized docker containers available for front end, api, front end+api, perl and cron

Bug Fixes
---------
* Seccubus rpm's are now also being built for Fedora version 27 and 28
* RPMs for Fedora version 25 depricated
* Fixed building of supporting Centos v7 rpms

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
| seccubus-front | Serving just the front end HTML, javascript and css | [![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus-front "Get your own image badge on microbadger.com") |
| seccubus-web   | Serving front and code and API simultaniously       |[![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus-web "Get your own image badge on microbadger.com") |
| seccubus-api   | Serving just the API.                               |[![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus-api "Get your own image badge on microbadger.com") |
| seccubus-perl  | Running command line scripts, e.g. to scan          |[![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus-perl "Get your own image badge on microbadger.com") |
| seccubus-cron  | Running cron deamon to execute scans                |[![](https://images.microbadger.com/badges/image/seccubus/seccubus.svg)](https://microbadger.com/images/seccubus/seccubus-cron "Get your own image badge on microbadger.com") |



Information about the docker containers is in [README-docker.md]

Change log
==========
Changes of this branch vs the [latest/previous release](https://github.com/schubergphilis/Seccubus/releases/latest)

---

9-5-2018 - v2.48 - Tenable.io compatibility and more
====================================================
This release is fully compatible with the Tenable.io vulnerability management platform.

Differences with 2.46

Enhancements
------------
* Seccubus now support Tenable.io as a scanning platform
* Added parsing of the ROBOT (bleichenbacher) attack to the SSLlabs scanner
* Added a dev environment example config
* Increased the size of the scannerparam field in the database

Bug Fixes
---------
* #635 - Hypnotoad path was set incorrectly in systemd startup script on CentOS 7
* #642 - Updated readme to address how to run a scan on a running container
* Fixed an error in the Docker examples in README.md
* Added zip to the docker image because it is needed for import/export


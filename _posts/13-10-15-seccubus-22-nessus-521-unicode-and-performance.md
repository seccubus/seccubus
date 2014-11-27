---
layout: post
title: Seccubus 2.2 – Nessus 5.2.1, unicode and performance
---
I’m proud to announce the release of Seccubus 2.2 which fixes issue with
Nessus 5.2.1 and later, unicode in .nessus files and brings a major
performance increase.

This release can be downloaded f[rom
Github](https://github.com/schubergphilis/Seccubus_v2/releases)

Release notes:

---

15-10-2013 - 2.2 - Nessus 5.2.1, unicode and performance
---

Key new features / issues resolved
----------------------------------
* Major performance increase by moving processing of sttus buttons and filters to backend
* Resolved an issue that cause incomptibility with Nessus API version 5.2.1 (Thanks Trelor)
* Resolved an issue around encoding of Unicode chracters in Nessus output
* Added shell script to execute crontab job only on a certain day
* Added shell script to execute crontab job only on a weeknumber that can be devided by a certain number
* Correct application of Apache license is now part of the unit tests
* Resolved some caching issues with IE

Bugs fixed (tickets closed):
----------------------------
* Issue #48 - Filters need to be processed in backend, not front end
* Issue #50 - Notification table not displayed on edit scan
* Issue #56 - IVIL conversion shell call needs qoutes around filename
* Issue #64 - New scan dialog shows 'new workspace' in title
* Issue #65 - Each CGI response header now invalidates caching
* Issue #66 - Username field too small
* Issue #72 - Apache license isn't applied correctly
* Issue #75 - Typo: datatbase in ConfigTest.pl
* Issue #77 - Seccubus incompatible with Nessus API 5.2.1
* Issue #78 - Unicode in nessus file breaks ivil import
* Issue #86 - getFilters API
* Updated dependancies in RPM

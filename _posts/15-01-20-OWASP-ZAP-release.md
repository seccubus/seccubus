---
layout: post
title: Seccubus v2.13 - Seccubus OWASP ZAP release!
---

Today I released Seccubus version 2.13 which supports the OWASP ZAP security tool. Download it [here](https://github.com/schubergphilis/Seccubus_v2/releases)

The OWASP Zed Attack Proxy (ZAP) is an easy to use integrated penetration testing tool 
for finding vulnerabilities in web applications. It's designed to be used by people with 
a wide range of security experience and as such is ideal for developers and functional testers 
who are new to penetration testing as well as being a useful addition to an experienced pentesters toolbox.

The intergration with Seccubus will make you able to launch the ZAP proxy scanner from the commandline 
and proccess the results into Seccubus. The default policy will be applicable when the scanner is launched. 
This can be altered by running the program "normally" with ./zap.sh and adjust the policy in the ZAP Gui

More information about ZAP Proxy can be found here: 
http://code.google.com/p/zaproxy/wiki/Introduction

Download the OWASP ZAP Proxy and extract the tar.gz
http://sourceforge.net/projects/zaproxy/files/2.3.1/ZAP_2.3.1_Linux.tar.gz/download

20-01-2015 - 2.13 - OWASP ZAP Proxy
======================================
Seccubus OWASP ZAP Proxy release

Don't forget you need a Java, Ubuntu example: 
sudo apt-get install openjdk-7-jre-headless

Below are some authentication examples for ZAP:

Seccubus ZAP option for authentication with session cookie: 
-o "-C JSESSIONID=KJHSAFKJH34SAFL572LKJ"  --hosts @HOSTS

Seccubus ZAP option for Basic Header authentication: 
-o "-A user:pass" --hosts @HOSTS

Seccubus ZAP option for performing Login and authenticate and exclude logout URL: 
-o "--auth-form http://example.org/login --auth-user myuser --auth-pass mypass --auth-verify-url http://example.org/profile -X /logout" --hosts @HOSTS

Bug Fixes
============================================
* No bug fixes in this version, only release with OWASP ZAP support

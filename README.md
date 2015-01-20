Seccubus V2 Read Me
===================
Seccubus automates regular vulnerability scans with vrious tools and aids 
security people in the fast analysis of its output, both on the first scan and 
on repeated scans.

On repeated scan delta reporting ensures that findings only need to be judged 
when they first appear in the scan results or when their output changes.

Seccubus 2.x is the only actively developed and maintained branch and all support 
for Seccubus V1 has officially been dropped. 

Seccubus V2 works with the following scanners:
* Nessus 4.x and 5.x (professional and home feed)
* Skipfish
* OpenVAS
* Medusa (local and remote)
* Nikto (local and remote)
* NMap (local and remote)
* SSLyze
* Medusa
* Burp Suite
* Qualys SSL labs

For more information visit [www.seccubus.com]

---

Release notes
=============

20-01-2015 - 2.13 - OWASP ZAP Proxy
======================================

Seccubus OWASP ZAP Proxy release

The OWASP Zed Attack Proxy (ZAP) is an easy to use integrated penetration testing tool for finding vulnerabilities in web applications.

It is designed to be used by people with a wide range of security experience and as such is ideal for developers and functional testers who are new to penetration testing as well as being a useful addition to an experienced pen testers toolbox. 

The intergration with Seccubus will make you able to launch the ZAP proxy scanner from the commandline and proccess the results into Seccubus. The default policy will be applicable when the scanner is launched. This can be altered by running the program "normally" with ./zap.sh and adjust the policy in the ZAP Gui

Download the OWASP ZAP Proxy and extract the tar.gz

http://sourceforge.net/projects/zaproxy/files/2.3.1/ZAP_2.3.1_Linux.tar.gz/download

More information about ZAP Proxy can be found here:
http://code.google.com/p/zaproxy/wiki/Introduction?tm=6

Don't forget you need a Java, Ubuntu example:
sudo apt-get install openjdk-7-jre-headless

Below are some authentication options examples for ZAP usage:

ZAP option for authentication with session cookie:
-o "-C JSESSIONID=KJHSAFKJH34SAFL572LKJ"

ZAP option for Basic Header authentication:
-o "-A user:pass"

ZAP option for performing Login and authenticate and exclude logout URL:
-o "--auth-form http://example.org/login --auth-user myuser --auth-pass mypass --auth-verify-url http://example.org/profile -X /logout"

Bug Fixes
============================================
* No bug fixes in this version, only release with OWASP ZAP support

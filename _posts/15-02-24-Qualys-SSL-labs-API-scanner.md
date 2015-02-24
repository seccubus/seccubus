---
layout: post
title: Seccubus now supports scanning via the Qualys SSL labs API
---

Personally I have always been a fan of Ivan Ristić's [Qualys SSL labs](https://www.ssllabs.com) a site that allows you to evaluate the quality of your SSL Labs configuraiton and the defacto gold standard when it comes to judging SSL setups.

That is why I added [support for SSL Labs in version 2.9 of seccubus](/2014/08/18/seccubus-v29-now-with-qualys-ssllabs-support/). At that time I implemented the feature by scraping the SSL Labs website.
While scraping wasn't prohibited, is sure was cumbersome and fragile, and it [did actually break](/2015/01/24/Ooops-SSLlabs-scanner-broken/)

Fortune has it that Ivan [release an API for SSL Labs](https://github.com/seccubus/ssllabs-scan/blob/master/ssllabs-api-docs.md) shortly after I released v2.9.

This version of Seccubus has a new SSL Labs scanner plugin that uses the SSL labs API

You can download the new version [here](https://github.com/schubergphilis/Seccubus_v2/releases)

Release notes
=============

24-02-2015 - 2.14 - SSL labs API
================================
The SSL labs scanner now uses the SSL labs API (see https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md) to check the SSL configuration of your website in stead of scraping the site.

Bug Fixes
=========
* No additional bugfixes

---
layout: post
title: Ooops, our SSL Labs scanner is broken
---

Be careful if you are using the SSL Labs scanner in Seccubus. Last week we were contacted by Ivan 
Ristic himself that we were overutilizing the SSL Labs scanner by requesting scans for multiple 
resources in a loop.

It turns out that our scanner is broken. Since the release of this scanner Qualys has release an 
[API](https://github.com/ssllabs/ssllabs-scan) so in stead of fixing the current, site scraping, 
scanner we will rewrite the scanner to use the API.

Be warned and stay tuned for this update.

Frank

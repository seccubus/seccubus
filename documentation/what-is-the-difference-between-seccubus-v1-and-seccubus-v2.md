---
version: 2
category: documentation
layout: page
title: What is the difference between Seccubus V1 and Seccubus V2?
---
# What is the difference between Seccubus V1 and Seccubus V2?

Before you try something new you want to know if it is going to be worth it.
This article should give you an idea of why we spend quite a lot of time and
energy in rebuilding Seccubus V2 from scratch.

I clearly recall the conversation between myself and my coworker Anton
Opgenoort that resulted in the first (internal) release of Seccubus. We were
discussing the pros and cons of different vulnerability management tools when
he challenged me: “Surely you can set up a Cron job to start a Nessus scan
yourself?” Anton claimed at one time, and now, more than three years later, it
has led to the Seccubus as we know it today. This little history illustrates
what is fundamentally wrong with Seccubus V1. While it functions quite well,
and has been maintainable for much longer than I expected, it is still in the
basis a bunch of shell scripts and some Perl CGI thrown together. It lacks a
fundamental design. Maintaining Seccubus is getting progressively harder and
some ideas that I have had for quite some time are simply not possible in the
V1 beast.

This has prompted me to start a full rewrite project which would still be
under construction today if Steve Launius had not joined the team and helped
me out a great deal.

Seccubus V2 is the next thing for the Seccubus project because:

* Unlike V1 it actually has a design
* V2 uses a real relational database unlike V1 which used the filesystem as a
hierarchical database
* The V2 web API is a real API which returns XML in stead of HTML thus
“Returning the X to AJAX™”
* As quite a few people pointed out “I’m not a GUI designer™” Steve put
together a great new user interface “That doesn’t suck™”
* All imports into V2 are based on IVIL. This makes the scanners extendible.
* Unlike V1, the V2 version does not require the webserver to be able to read
files from the Seccubus user.
* Seccubus V2 has workspaces, which hold multiple scans of the same “target”
* Seccubus V2 will have lots of new features in time:
   * Importing scans
   * Manual findings
   * Issues that group multiple findings together
   * Trouble ticket system integration
   * Reporting
   * Full audit trail


2011-04-28 - Seccubus v2.0.alpha2

Today the second Alpha version of Seccubus sees the light of day. As the name 
suggests this is an Alpha release with the associated quality. If you are 
running Seccubus V1 in a production environment we strongly suggest to not move 
to Seccubus V2 unless you have a specific reason to do so.

This second Alpha release addresses some speed issues and some issues with
Nessus scanning.

So what is the difference between Seccubus V2 and Seccubus V2?

Before you try something new you want to know if it is going to be worth it.
This article should give you an idea of why we spend quite a lot of time and
energy in rebuilding Seccubus V2 from scratch.

I clearly recall the conversation between myself and my coworker Anton
Opgenoort that resulted in the first (internal) release of Seccubus. We were
discussing the pros and cons of different vulnerability management tools when
he challenged me: .Surely you can set up a Cron job to start a Nessus scan
yourself?. Anton claimed at one time, and now, more than three years later,
it has led to the Seccubus as we know it today. This little history
illustrates what is fundamentally wrong with Seccubus V1. While it functions
quite well, and has been maintainable for much longer than I expected, it is
still in the basis a bunch of shell scripts and some Perl CGI thrown
together. It lacks a fundamental design. Maintaining Seccubus is getting
progressively harder and some ideas that I have had for quite some time are
simply not possible in the V1 beast.

This has prompted me to start a full rewrite project which would still be
under construction today if Steve Launius had not joined the team and helped
me out a great deal.

Seccubus V2 is the next thing for the Seccubus project because:

   · Unlike V1 it actually has a design
   · V2 uses a real relational database unlike V1 which used the filesystem as
     a hierarchical database
   · The V2 web API is a real API which returns XML in stead of HTML thus 
     returning the X to AJAX..
   · As quite a few people pointed out .I.m not a GUI designer.. Steve put
     together a great new user interface .That doesn.t suck..
   · All imports into V2 are based on IVIL. This makes the scanners
     extendible.
   · Unlike V1, the V2 version does not require the webserver to be able to
     read files from the Seccubus user.
   · Seccubus V2 has workspaces, which hold multiple scans of the same
     target.
   · Seccubus V2 will have lots of new features in time:
       o Importing scans (allready supported via CLI)
       o Manual findings
       o Issues that group multiple findings together
       o Trouble ticket system integration
       o Reporting
       o Full audit trail

Changelog for Alpha2
--------------------
17-03-2011 - 2.0.alpha2

New features / Issues resolved
Fixed slow speed of updates to multiple findings
Scanning with Nessus should work a lot better in this version

Bug fixed:
#30 - Document running scans
https://sourceforge.net/apps/trac/seccubus/ticket/30
#32 - load_ivil command line argument 'scan' is ignored
https://sourceforge.net/apps/trac/seccubus/ticket/32
#34 - Default port for OpenVAS scanning not set correctly
https://sourceforge.net/apps/trac/seccubus/ticket/34
#35 - ivil does not import title of Nessus finiding
https://sourceforge.net/apps/trac/seccubus/ticket/35
#37 - @HOSTS gets expanded to /tmp/seccus.hosts.PID in stead of
/tmp/seccubus.hosts.PID
https://sourceforge.net/apps/trac/seccubus/ticket/37
#38 - nessus2ivil should not die on unknown attribute
https://sourceforge.net/apps/trac/seccubus/ticket/38


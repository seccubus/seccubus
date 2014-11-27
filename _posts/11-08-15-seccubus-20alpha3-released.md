---
layout: post
title: Seccubus-2.0.alpha3 released
---
For those of you that were wondering, we’re not dead yet…
![;\)](https://www.seccubus.com/wp-includes/images/smilies/icon_wink.gif)

Today marks the release of Seccubus 2.0.alpha3. This release contains a major
bugfix and two smaller ones.

Also the Seccubus development team decided to start using Scrum for a more
agile development process. You can find our scrum board here: [https://www.piv
otaltracker.com/projects/324809#](https://www.pivotaltracker.com/projects/3248
09)

You can download Seccubus-2.0.alph3 [here](https://sourceforge.net/projects/se
ccubus/files/Seccubus_v2/Seccubus-2.0.alpha3/).

Release notes:

---

Seccubus V2 is currently in Alpha phase. Even though we tested this code
ourselves do not expect production ready code yet.

15-08-2011 - 2.0.alpha3
---

New features / Issues resolved
---
* Major bug in the delta engine resolved. It turned out that statusses where
not processed after a scan, but was called by the load_ivil utility.

Bugs fixed:
---
* #36 - Nessus scans don't seem to see targets
<https://sourceforge.net/apps/trac/seccubus/ticket/36>
* #12 - Gone hosts not not detected correctly
<https://sourceforge.net/apps/trac/seccubus/ticket/12>
* #42 - Scan parameters --workspace and --scan should be added automatically
<https://sourceforge.net/apps/trac/seccubus/ticket/42>

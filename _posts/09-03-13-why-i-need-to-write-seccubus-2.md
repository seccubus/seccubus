---
layout: post
title: Why I need to write Seccubus 2
---
**Database backend**

Seccubus currently stores configuration information, host information and
findings in flat files and direcdtory structures. Filtering is implemented by
directory globbing in perl. While this works fine when you have only a few
findings, it does not really scale well. This will cause slowness in Seccubus
installations with lots of hosts and/or finding.

**Data model**

Due to the hyrarchical nature of a directory structure, the datamodel of
Seccubus has been hyrarchical as well. Breaking free of this model cannot be
done easily and feels like solving the wrong problem. It also means that it is
difficult to change or improve the current model.

**Findings vs issues vs tickets**

At Schuberg Philis we don;t just forward Nessus findings to our colegues to
finx. In stead we aggregate them into trouble tickets which each contain a
single issue to finx. This can mean that a single Seccubus finding (e.g.
14260, nikto.nasl) can lead to multiple issues, but it can also mean that a
single issue is reported by multiple plugins (e.g. invalid SSL certificates).
The work of keeping the issues/tickets and Seccubus in sync is more work that
can be automated.

**Scanner plugin architecture**

Seccubus is quite tightly coupled with Nessus. And, although it also works
with OpenVAS I actually want to take it further. This means that the scanners
have to be handled in a more plugin like architecture.

**Vulnerability information**

There is an opportunity to extend the capabilities of the autoremark feature
to link with e.g. the OSVDB or some wiki like capabilities.

**Dashboards?**

I have had requests for dashboards, and will look into it.

**User Interface**

It could be better.


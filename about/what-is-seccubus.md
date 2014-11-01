---
layout: page
title: What is Seccubus?
---
# Seccubus automates regular vulnerability scans and provides delta reporting.

The goal is to reduce the analysis time for subsequent scans of the same
infrastructure by only reporting delta findings.

### What’s the issue?

Anyone who has ever used Nessus, OpenVAS, Nikto or another vulnerability
scanner will be familiar with the drawback of such tools. Tools like Nessus
are very valuable tools, but unfortunately the results contain a lot of noise.
Time needed to interpret and create a report using the results of a scan will
often be two or three times the time needed to do the actual scan. Seccubus was created in order to more effectively analyze the results of
regular scans of the same infrastructure by efficiently interpreting results.

### How does it work?

Seccubus runs scans at regular intervals and compares the findings of the last
scan with the findings of the previous scan. The results of this comparison
are available in a web GUI Findings have and can be tagged with one of the following statuses:

<table border="0">
<tbody>
<tr>
<td><strong>New </strong><br /></td>
<td>Finding was detected for the first time</td>
</tr>
<tr>
<td><strong>Open </strong></td>
<td>Finding was previously detected and has not been altered by the user</td>
</tr>
<tr>
<td valign="top"><strong>Changed</strong></td>
<td valign="top">Flinging has changed since it was last detected. This status remains until it is changed by the user</td>
</tr>
<tr>
<td valign="top"><strong>No Issue</strong></td>
<td valign="top">The finding does not pose any security risk and will remain this status until it changes. If the finding changes it will be marked as changed.</td>
</tr>
<tr>
<td valign="top"><strong>Gone</strong></td>
<td valign="top">The finding had been found in a previous run, but has done been fixed in this run.</td>
</tr>
<tr>
<td valign="top"><strong>Fixed </strong></td>
<td valign="top">The finding has been fixed and should not reappear. If this finding reappears it will be marked as changed.</td>
</tr>
<tr>
<td valign="top"><strong>Hard Masked</strong></td>
<td valign="top">The finding is bogus and will not leave this status unless the user changes it.</td>
</tr>
</tbody>
</table>
 Because the number of reported findings from Seccubus, especially on the
second or later run, is much smaller then the number of findings of a regular
scan, there will be much less time involved in the analysis of subsequent
runs.


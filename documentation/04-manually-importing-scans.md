---
category: user
layout: page
title: Manually importing scans
---

Seccubus always imports scan data inn two steps:
* Convert scan data from it's native format to IVIL format
* Import the IVIL data

E.g. for Nessus file 'something.nessus' the following can be done.

```bash
cd ~seccubus
bin/nessus2ivil --scanner 'Nessus' --timestamp '201901010000' --infile 'something.nessus'
bin/load_ivil --workspace 'your_workspace' --scan 'your_scan' --verbose 'something.ivil.xml'
```

Additionally you can attach the .nessus and .ivil.xml file to the scan as follows:
```bash
cd ~seccubus
bin/attach_file --workspace 'your_workspace' --scan 'your_scan' --timestamp '201901010000' --file 'something.nessus'
bin/attach_file --workspace 'your_workspace' --scan 'your_scan' --timestamp '201901010000' --file 'something.ivil.xml'
```
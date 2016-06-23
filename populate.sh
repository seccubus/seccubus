#!/bin/bash
#run vanuit de Seccubus_V2 dir
#Example: /Users/gtencate/Repositories/Seccubus_v2

mysqladmin --force -u seccubus --password=seccubus Drop Seccubus;
mysqladmin --force -u seccubus --password=seccubus Create Seccubus;
mysql --force -u seccubus --password=seccubus Seccubus < db/structure_v6.mysql
mysql --force -u seccubus --password=seccubus Seccubus < db/data_v6.mysql

#Populate Seccubus Nmap
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/load_ivil --workspace 'testdata_seccubus' --scan 'testdata_nmap' --scanner Nmap --timestamp 20150423172229 -v 'testdata/nmap.xml'
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/attach_file --workspace 'testdata_seccubus' --scan 'testdata_nmap' --timestamp 20150423172229 --file 'testdata/nmap.xml' --description 'Command output' -v
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/attach_file --workspace 'testdata_seccubus' --scan 'testdata_nmap' --timestamp 20150423172229 --file 'testdata/nmap.gnmap' --description 'Command output' -v
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/attach_file --workspace 'testdata_seccubus' --scan 'testdata_nmap' --timestamp 20150423172229 --file 'testdata/nmap.ivil.xml' --description 'Command output' -v

#Populate Seccubus Nessus
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/load_ivil --workspace 'testdata_seccubus' --scan 'testdata_nessus' --scanner Nessus --timestamp 20150523172229 -v 'testdata/unicode.ivil.xml'
perl -I/opt/seccubus/SeccubusV2 /opt/seccubus/bin/attach_file --workspace 'testdata_seccubus' --scan 'testdata_nessus' --timestamp 20150523172229 --file 'testdata/unicode.nessus' --description 'Command output' -v
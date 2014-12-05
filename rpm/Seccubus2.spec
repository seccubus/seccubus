#
# Copyright 2014 Frank Breedijk, Peter Slootweg, Glenn ten Cate, blabla1337
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
%define installdir	/opt/seccubus
%define homedir		%{installdir}
%define bindir		%{installdir}/bin
%define confdir		/etc/seccubus
%define webdir		%{installdir}/www
%define vardir		%{installdir}/var
%define seccuser	seccubus
%define docsdir		%{installdir}/doc/

%define moddir		%{installdir}/SeccubusV2
%define scandir		%{installdir}/scanners

Name:		Seccubus
Version:	2.0.beta5
Release:	0
Summary:	Automated regular vulnerability scanning with delta reporting
Group:		Network/Tools
License:	GPL
URL:		http://www.seccubus.com

Packager:	Frank Breedijk <fbreedijk@schubergphilis.com>

BuildRoot:	%{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildArch:	noarch

Source0:	http://downloads.sourceforge.net/project/%{name}/%{name}_v2/%{name}-%{version}.tar.gz

#BuildRequires:	
Requires:	perl-Algorithm-Diff
Requires:	perl-DBD-mysql
Requires:	perl-JSON
Requires:	perl-XML-Simple
Requires:	perl-libwww-perl
Requires:	perl-HTML-Tree
Requires:	perl-Net-IP
Requires:	httpd
Requires:	mysql
Requires:	ruby

%description
Tool to automatically fire regular vulnerability scans with Nessus, OpenVAS, 
Nikto or Nmap. 
Compare results of the current scan with the previous scan and report on the 
delta in a web interface. Main objective of the tool is to make repeated scans 
more efficient.
Nessus scanning needs Ruby 
Nmap scanning needs the Nmap scanner
Nikto scanning needs the Nikto scanner

%clean
[ %{buildroot} != "/" ] && %{__rm} -rf %{buildroot}

%prep
%setup -q -n  %{name}-%{version}

perl Makefile.PL
mkdir -p %{buildroot}/%{installdir}
#mkdir -p %{buildroot}/%{webdir}
#mkdir -p %{buildroot}/%{bindir}
#mkdir -p %{buildroot}/%{confdir}
#mkdir -p %{buildroot}/%{vardir}
mkdir -p %{buildroot}/%{docsdir}/db
mkdir -p %{buildroot}/%{docsdir}/GUI
#mkdir -p %{buildroot}/%{moddir}
#mkdir -p %{buildroot}/%{scandir}
mkdir -p %{buildroot}/etc/httpd/conf.d

%build
make

%install
./install.pl --buildroot=%{buildroot} --confdir=%{confdir} --bindir=%{bindir} --dbdir=%{vardir} --wwwdir=%{webdir} --basedir=%{homedir} --docdir=%{docsdir}

cp ChangeLog.md LICENSE.txt NOTICE.txt README.md AUTHORS.txt %{buildroot}/%{docsdir}

cat > %{buildroot}/etc/httpd/conf.d/%{name}.conf <<-EOF
#
# This configuration file maps the Seccubus logs
# into the URL space. By default these results are
# only accessible from the local host.
#
Alias /seccubus %{webdir}

<Location /seccubus>
    Order deny,allow
    Deny from all
    Allow from 127.0.0.1
    Allow from ::1
    # Allow from .example.com
    AddHandler cgi-script .pl
    Options ExecCGI
</Location>
EOF

cat > %{buildroot}/%{confdir}/config.xml <<- EOF
<?xml version="1.0" standalone='yes'?>
<seccubus>
	<database>
		<engine>mysql</engine>
		<database>seccubus</database>
		<host>localhost</host>
		<port>3306</port>
		<user>%{seccuser}</user>
		<password>%{seccuser}</password>
	</database>
	<paths>
		<modules>%{installdir}/SeccubusV2</modules>
		<scanners>%{scandir}</scanners>
		<bindir>%{bindir}</bindir>
		<configdir>%{confdir}</configdir>
		<dbdir>%{vardir}</dbdir>
	</paths>
	<smtp>
		<server>localhost</server>
		<from>seccubus@localhost</from>
	</smtp>
</seccubus>

EOF

################################################################################
%pre
%{_sbindir}/groupadd -r -f %{seccuser}
grep \^%{seccuser} /etc/passwd >/dev/null
if [ $? -ne 0 ]; then
	%{_sbindir}/useradd -d %{installdir} -g %{seccuser} -r %{seccuser}
fi
%{_sbindir}/usermod -G $(id -nG apache|sed -e 's/  *$//g' -e 's/  */,/g'),%{seccuser} apache

## %preun
%post
/bin/cat << OEF
################################################################################

After installation, create a database and database user. Populate the db with provided
scripts:

  # mysql << EOF
  create database seccubus;
  grant all privileges on seccubus.* to seccubus@localhost identified by 'seccubus';
  flush privileges;
  EOF

  # mysql -u seccubus -pseccubus seccubus < %{vardir}/structure_v4.mysql
  # mysql -u seccubus -pseccubus seccubus < %{vardir}/data_v4.mysql

You can change the db name and username/password, make sure you update
%{confdir}/config.xml accordingly

Look for more information on http://www.seccubus.com/documentation/seccubus-v2

Apache on this host now has a configfile /etc/httpd/conf.d/%{name}.conf
The default config makes Seccubus available on http://localhost/seccubus
(Note: you may have to restart Apache)

################################################################################
OEF
chcon -R --reference=/var/www/cgi-bin %{webdir}/seccubus/json/
## %post

%postun
%{_sbindir}/usermod -G $(id -nG apache|sed -e 's/%{seccuser}//' -e 's/  *$//g' -e 's/  */,/g') apache
## %postun

################################################################################
%files
%defattr(-,%{seccuser}, %{seccuser})
#
%attr(644, root, root) %config /etc/httpd/conf.d/%{name}.conf
%attr(644, root, root) %config %{confdir}/config.xml
#
%{confdir}

%{installdir}
%attr(644, %{seccuser}, %{seccuser}) %{installdir}/SeccubusV2.pm

%{moddir}
%{bindir}
%{docsdir}
%{scandir}
%{webdir}
%{vardir}

%changelog
* Tue Sep 23 2014 Frank Breedijk <fbreedijk@schubergphilis.com>
- Making it a lot simpler
* Mon Aug 18 2014 Frank Breedijk <fbreedijk@schubergphilis.com>
- Fixed SE Linux isseu thanks to Arkenoi
- Added support for Qualys SSLlabs
* Fri Aug 1 2014 Glenn ten Cate <gtencate@schubergphilis.com>
- New scanner Medusa added by Arkanoi
- Burp parser by SphaZ
* Tue Mar 19 2013 Frank Breedijk <fbreedijk@schubergphilis.com>
- New DB version
* Mon Dec 24 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Fixed permissions of files in  %{webdir}/seccubus/json/updateWorkspace.pl
* Sat Oct 05 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Building the rpm is now part of an automated build process. Unless there
  are any changes to this file in the Git repository changes will not be
  recorded here
* Wed Aug 15 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Corrected major error in beta4
* Tue Jul 10 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Corrected performance and installation issues
- Version 2.0.beta4
* Fri Feb 24 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Removed oldstyle gui
* Fri Jan 27 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Version 2.0.beta2
* Sat Jan 07 2012 Frank Breedijk <fbreedijk@schubergphilis.com>
- Moved old GUi to oldstyle
- New GUI is now main GUI
- Version 2.0.beta1
* Thu Nov 23 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Added support for rebuilt GUI
- Removed quadruplicate docs/HTML reference
* Thu Nov 18 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Fixed missing dependancies 
* Thu Nov 17 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- Permissions of scanner files are not correct 
* Tue Sep 13 2011 Frank Breedijk <fbreedijk@schubergphilis.com>
- version 2.0.alpha4
* Thu Aug 25 2011 Peter Slootweg <peter@pxmedia.nl>
- version 2.0.alpha3
* Mon May 2 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha2
* Mon Mar 14 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha1
* Thu Feb 10 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 2.0.alpha0
* Thu Feb 10 2011 Peter Slootweg <pslootweg@schubergphilis.com>
- version 1.5.4
* Tue Nov 9 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- version 1.5.3
* Mon Sep 6 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- homedir wasn't owned by seccubus user
* Wed Sep 1 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- removed dependencies on nessus and mod_perl
* Mon Aug 30 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- Removed last remaining /home/seccubus references
* Tue Jun 22 2010 Peter Slootweg <pslootweg@schubergphilis.com>
- Initial Spec File

# ------------------------------------------------------------------------------
# $Id$
# ------------------------------------------------------------------------------
# Seccubus perl module. This is where most of the real logic is
# ------------------------------------------------------------------------------
#  Copyright 2011 Frank Breedijk of Schuberg Philis
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
# ------------------------------------------------------------------------------
package SeccubusScanners;

=head1 NAME $RCSfile: SeccubusScanners.pm,v $

This Pod documentation generated from the module SeccubusScanners gives a
list of all functions within the module.

=cut

@ISA = ('Explorer')
@EXPORT = qw ( 
		FILETYPES
		SCANNERS
	);

my (
	%FILETYPES,
	%SCANNERS,
   );
use strict;
use Carp;
#use SeccubusConfig;

# Close the PM file.
return 1;

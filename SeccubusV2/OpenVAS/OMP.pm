#!/usr/bin/perl
#
# Filename:     OMP.pm
# Description:  Pure-Perl interface to the OpenVAS Management Protocol
# Creator:      Winfried Neessen <wn@neessen.net>
#
# $Id$
#
# Last modified: [ 2013-06-12 12:13:43 ]

## This is the OpenVAS::OMP package {{{
package OpenVAS::OMP;

### Global modules {{{
use strict;
use warnings;
use Carp;
use IO::Socket::SSL;
use XML::Simple qw( :strict );
# }}}

### Global variables {{{
our $VERSION = '0.04';
# }}}

### Constants definitions {{{
use constant CHUNK_SIZE		=> 8192;
use constant CONN_TIMEOUT	=> 30;
use constant DEFAULT_PORT	=> 9390;
use constant DEFAULT_HOST	=> 'localhost';
use constant DEFAULT_SSL_VERIFY	=> 0;
# }}}

#### Public methods

### Module constructor // new() {{{
sub new
{

	## Create class and read arguments
	my ( $class, %args ) = @_;
	my $self = bless {}, $class;

	## Read arguments
	$self->{ 'host' }	= delete( $args{ 'host' } ) || DEFAULT_HOST;
	$self->{ 'timeout' }	= delete( $args{ 'timeout' } ) || CONN_TIMEOUT;
	$self->{ 'port' }	= delete( $args{ 'port' } ) || DEFAULT_PORT;
	$self->{ 'ssl_verify' }	= delete( $args{ 'ssl_verify' } ) || DEFAULT_SSL_VERIFY;
	$self->{ 'username' }	= delete( $args{ 'username' } );
	$self->{ 'password' }	= delete( $args{ 'password' } );

	## Check for mantatory arguments
	croak( 'No host argument given' )
		unless( defined( $self->{ 'host' } ) and $self->{ 'host' } ne '' );
	croak( 'No port argument given' )
		unless( defined( $self->{ 'port' } ) and $self->{ 'port' } ne '' );
	croak( 'Unsupported value "' . $self->{ 'ssl_verify' } . '" for argument "ssl_verify".' )
		if( $self->{ 'ssl_verify' } < 0 or $self->{ 'ssl_verify' } > 1 );

	## Warn about unrecognized arguments
	carp( "Unrecognized arguments: @{ [ sort keys %args ] }" ) if %args;

	## Return object
	return $self;

}
# }}}

### Send a request (hashref) to the OMP and return a XML hashref (or raw XML) // commandHash() {{{
sub commandHash
{

	## Get object and arguments
	my ( $self, $cmdHash, $raw ) = @_;

	## cmdHash needs to be a hash/hashref
	croak( 'Method "commandHash()" requires the first argument to be a hash/hashref' )
		unless( ref( $cmdHash ) eq 'HASH' );

	## Convert command hash to XML
	my $cmdXML = XMLout( $cmdHash, NoEscape => 0, SuppressEmpty => 1, KeepRoot => 1, KeyAttr => 'command' );

	## Send commandXML to server
	my $response = $self->_sendSock( $cmdXML );

	## Close socket connection
	$self->{ 'socket' }->close();

	## Return RAW or hashref version
	if( defined( $raw ) )
	{
		return $response;
	} else {
		return XMLin( $response, ForceArray => 1, KeyAttr => 'command_response' );
	}

}
# }}}

### Send a request (pure XML) to the OMP and return a XML hashref (or raw XML) // commandXML() {{{
sub commandXML
{

	## Get object and arguments
	my ( $self, $cmdXML, $raw ) = @_;

	## cmdHash needs to be a hash/hashref
	croak( 'Method "commandXML()" requires the first argument to be a hash/hashref' )
		unless( defined( $cmdXML ) and ref( $cmdXML ) eq '' );

	## Send commandXML to server
	my $response = $self->_sendSock( $cmdXML );

	## Close socket connection
	$self->{ 'socket' }->close();

	## Return RAW or hashref version
	if( defined( $raw ) )
	{
		return $response;
	} else {
		return XMLin( $response, ForceArray => 1, KeyAttr => 'command_response' );
	}

}
# }}}

### Request version string from OMP server // getVersion() {{{
sub getVersion
{

	## Get object
	my $self = shift;

	## Connect and authenticate with OMP server
	$self->_connect();

	## Send commandXML to server
	$self->{ 'socket' }->syswrite( '<get_version/>' );
	my $response = XMLin( $self->_readSock, ForceArray => 1, KeyAttr => 'command_response' );

	## Check respone
	croak( 'getVersion failed: ' . $response->{ 'status_text' } )
		unless( defined( $response->{ 'status' } ) and $response->{ 'status' } eq '200' );
	
	## Return response
	print STDERR 'OMP server version: ' . $response->{ 'version' }->[0] . "\n";
	return $response->{ 'version' }->[0];

}
# }}}


#### Private methods

### Initiate a SSL connection with the server // _connect() {{{
sub _connect
{

	## Get object
	my $self = shift;

	## Create a SSL socket
	my $socket = IO::Socket::SSL->new
	(

		PeerHost	  => $self->{ 'host' },
		PeerPort	  => $self->{ 'port' },

		Timeout		  => $self->{ 'timeout' },
		Proto		  => 'tcp',

		SSL_verify_mode   => $self->{ 'ssl_verify' },
	
	) or croak( 'Unable to connect to host ' . $self->{ 'host' } . ':' . $self->{ 'port' } . ': ' . &IO::Socket::SSL::errstr );

	## Reference socket in the object
	$self->{ 'socket' } = \*$socket;

}
# }}}

### Authenticate with the OMP server // _authenticate() {{{
sub _authenticate
{

	## Get object
	my $self = shift;

	## Make sure the everything required is available
	croak( 'Not connected with the OMP server' )
		unless( defined( $self->{ 'socket' } ) and ref( $self->{ 'socket' } ) eq 'IO::Socket::SSL' );
	croak( 'Username or password not provided' )
		unless( defined( $self->{ 'username' } ) and defined( $self->{ 'password' } ) );

	## Generate XML authentication string
	my ( $auth, $authXML );
	$auth->{ 'authenticate' }->{ 'credentials' } = [ { 'username' => [ $self->{ 'username' } ], 'password' => [ $self->{ 'password' } ] } ];
	$authXML = XMLout( $auth, NoEscape => 0, SuppressEmpty => 1, KeepRoot => 1, KeyAttr => 'authenticate' );

	## Send authentication string to OMP server and read response
	$self->{ 'socket' }->syswrite( $authXML );
	my $response = $self->_readSock;

	## Check repsonse
	my $authResponse = XMLin( $response, ForceArray => 1, KeyAttr => 'authenticate_response' );
	if( defined( $authResponse->{ 'status' } ) and $authResponse->{ 'status' } eq '200' )
	{
		return 1;
	}
	elsif( defined( $authResponse->{ 'status' } ) and $authResponse->{ 'status' } ne '200' )
	{
		carp( 'Error: ' . $authResponse->{ 'status_text' } );
		return undef;
	}
	else 
	{
		carp( 'Unexpected failure.' );
		return undef;
	}

}
# }}}

### Send date to socket // _sendSock() {{{
sub _sendSock
{

	## Get object
	my ( $self, $cmdXML ) = @_;

	## Connect and authenticate with OMP server
	$self->_connect();
	$self->_authenticate();

	## Send commandXML to server
	$self->{ 'socket' }->syswrite( $cmdXML );
	my $response = $self->_readSock;

	## Return the server response
	return $response;

}
# }}}

### Read from socket // _readSock() {{{
sub _readSock
{

	## Get object
	my $self = shift;

	## Make sure we are connected to the OMP server
	croak( 'Not connected with the OMP server' )
		unless( defined( $self->{ 'socket' } ) and ref( $self->{ 'socket' } ) eq 'IO::Socket::SSL' );

	## Read from socket
	my ( $length, $response );
	do {

		$length = $self->{ 'socket' }->sysread( my $buffer, CHUNK_SIZE );
		undef $length if( $length == 0 );
		undef $length if( $length < CHUNK_SIZE );

		$response .= $buffer if defined( $buffer );

	} while ( $length );

	## Return the response
	return $response;

}
# }}}



1;
__END__

=head1 NAME

OpenVAS::OMP - Pure-perl interface to the OpenVAS Management Protocol

=head1 SYNOPSIS

	use OpenVAS::OMP;

	my $omp = OpenVAS::OMP->new(
		host		=> 'localhost',
		ssl_verify	=> 1,
		username	=> 'ttester',
		password	=> 'Th!s-Is,S3crEt',
		port		=> 9390,
	);

	my $hashrefRequest	= $omp->commandHash( $hashref );
	my $xmlRequest		= $omp->commandXML( '<get_info name="CVE-2010-1234" type="cve" details="1"/>', 1 );
	my $version		= $omp->getVersion;

=head1 DESCRIPTION

This module is a simple pure perl interface to the OpenVAS Management Protocol (OMP). It provides
and similar functionality as the OMP-CLI client (shipped with OpenVAS). 

=head1 METHODS

=over 4

=item B<new>( I<configuration hash> )

The class constructor. It accepts serveral configuration arguments (some of them which are optional). 

=over 4

=item B<host> 

Optional argument. Defaults to 'I<localhost>'. This arguments tells the module the hostname of the server
to connect to.

=item B<port>

Optional argument. Defaults to 'I<9390>'. Use this argument to provide the server port for the OMP server.

=item B<username>

Provide a username to authenticate to the OMP server. This argument is not needed for the B<getVersion()> call.

=item B<password>

Provide a password to authenticate to the OMP server. This argument is not needed for the B<getVersion()> call.

=item B<ssl_verify>

Optional argument. Defaults to 'I<1>' (true). Tell IO::Socket::SSL to verify the SSL certificate on the OMP
server. If this argument is set to true and the server certificate is not valid, no connection will be 
established. If set to 'I<0>' or 'I<undef>' the module will not perform any SSL certificate validation (which
is not a good idea).

=back

=item B<getVersion>()

Get the version string from the OMP server. This call doesn't require any user authentication, so username and
password arguments are not required in the constructor call.

=item B<commandXML>( I<XML string> [, I<request raw response> ] )

Query the OMP server with the provided XML string. The resposne will be a hashref with the server response. If
you prefer the raw XML output from the server, the optional I<request raw response> argument can be set.

=item B<commandHash>( I<hashref> [, I<request raw response> ] )

Query the OMP server with the provided hashref. The call will take the hashref and convert it to a XML string
and will then query the OMP server. The resposne will be a hashref with the server response. If
you prefer the raw XML output from the server, the optional I<request raw response> argument can be set.

=back

=head1 DEVELOPMENT

The project and the latest code can be found on BitBucket: I<https://bitbucket.org/wneessen/openvas-omp/>

=head1 COPYRIGHT

Copyright (C) 2013 by Winfried Neessen <wn@neessen.net>. Published under the terms of the Artistic License 2.0.

=cut

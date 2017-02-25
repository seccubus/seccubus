package Seccubus::Controller::Status;
use Mojo::Base 'Mojolicious::Controller';


# This action will render a template
sub show {
	my $self = shift;
	
	my $json = [];
	my $status = 200;

	my @configs = qw(
		/home/seccubus/etc/config.xml
		/etc/seccubus/config.xml
		/opt/seccubus/etc/config.xml
   	);

	my @dirs = qw (
		modules
		scanners
		bindir
		configdir
		dbdir
	);

	my $config_found = 0;
	my $config_file = "";
	foreach my $config ( @configs ) {
		if ( -e $config ) {
			$config_found = 1;
			$config_file = $config;
		}
	}
	if( $config_found) {
		push @$json, { name => "Configuration file", result => "OK", message => "Configuration file found at '$config_file'"};
	} else {
		push @$json, { name => "Configuration file", result => "Error", message => "Configuration file could not be found. Please copy one of the example configuration files to one of the following locations and edit it:" . join(", ",@configs)};
		$status = 500;
		goto EXIT;
	}

	require SeccubusV2;
	my $config = SeccubusV2::get_config();

	##### Test paths
	foreach my $dir ( @dirs ) {
		if ( ! -d $config->{paths}->{$dir} ) {
			push @$json, { name => "Path $dir", result => "Error", message => "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', does not exist"};
			$status = 500;
			goto EXIT;
		} else {
			push @$json, { name => "Path $dir", message => "The path for '$dir', '$config->{paths}->{$dir}' defined in '$config_file', was found", result => "OK"};
		}
	}

	##### Test database login
	require SeccubusDB;
	my $dbh = SeccubusDB::open_database();

	if ( ! $dbh ) {
		push @$json, { name => "Database login", message => "Unable to log into the the database. Either the definitions in '$config_file' are incorrect or you need to create '$config->{database}->{engine}' database '$config->{database}->{database}' on host '$config->{database}->{host}' and grant user '$config->{database}->{user}' the rights to login in with the specified password.\nFor mysql execute the following command: create database $config->{database}->{database};grant all privileges on $config->{database}->{database}.* to $config->{database}->{user} identified by '<password>';exit", result => "Error"};
		$status = 500;
		goto EXIT;
	} else {
		push @$json, { name => "Database login", message => "Login to database '$config->{database}->{database}' on host '$config->{database}->{host}' with the credentials from '$config_file', was successful", result => "OK"};
	}

	##### Test database tables
	my $current_db_version = $SeccubusV2::DBVERSION;

	# Make sure login to the database was successful
	my $tables = SeccubusDB::sql( return	=> "ref",
			  	      query	=> "show tables",
				    );

	if ( ! @$tables ) {
		my $file = $config->{paths}->{dbdir} . "/structure_v$current_db_version" . "\." . $config->{database}->{engine};
		push @$json, { name => "Database structure", message => "Your database seems to be empty, please execute the sql statements in '$file' to create the required tables", result => "Error"};
		$status = 500;
		goto EXIT;
		# TODO: Add link to screen that does this for the user
		# my $api = "api/updateDB.pl?toVersion=$current_db_version&action=structure";
	} else {
		push @$json, { name => "Database structure", message => "Your database does have datastructures in it.", result => 'OK'};
	}

	##### Test the default DB data version
	eval {
		local $SIG{__DIE__}; # No sigdie handler

		my @version = SeccubusDB::sql( return	=> "array",
			   	       query	=> "SELECT value FROM config 
				                    WHERE name = ?",
		   	    	   values	=> [ "version" ],
		 	     	);

		if ( $version[0] != $current_db_version ) {
			my $file = $config->{paths}->{dbdir} . "/";
			if ( $version[0] eq "" ) {
				$file .= "data_v$current_db_version." . $config->{database}->{engine};
			} elsif ( $version[0] < $current_db_version ) {
				$file .= "upgrade_v$version[0]_v" . ($version[0]+1) . "." . $config->{database}->{engine};
			} else {
				push @$json, { name => "Database version error", message => "Your database returned version number '$version[0]', the developers for Seccubus do not know what to do with this", result => "Error"};
				$status = 500;
				goto EXIT;
			}
			push @$json,{ name => "Database version", message => "Your database is not current, please execute the sql statements in '$file' to update the database to the next version and rerun this test", result => 'Error'};
			$status = 500;
			goto EXIT;
		} else {
			push @$json,{ name => "Database version", message => "Your database has the base data and is the current version.", result => 'OK'};
		}		 	     
	} or do {
		my $file = $config->{paths}->{dbdir} . "/data_v$current_db_version" . "\." . $config->{database}->{engine};
		push @$json, { name => "Database data", message => "Your database is missing data, please execute the sql statements in '$file' to insert the base data into the database", result => 'OK'};
		$status = 500;
		goto EXIT;
		# TODO: Direct user to a helpfull screen
		# my $api = "api/updateDB.pl?toVersion=&action=data";
		# $message = "$msg. API Call: '$api'";
	};

	##### Test if the user exists in the database
	if ( $ENV{REMOTE_USER} ) {
		my @user = SeccubusDB::sql( return   => "array",
					    query	=> 'SELECT 	username
					    		    FROM	users
							    WHERE	username = ?',
					    values	=> [ $ENV{REMOTE_USER} ],
			   );
		if ( $user[0] eq $ENV{REMOTE_USER} ) {
			push @$json, {name => "HTTP authentication", message => "Authentication is set up on your HTTP server, and user '$ENV{REMOTE_USER}' exists in the database", result => 'OK'};
		} else {
			push @$json, {name => "HTTP authentication", message => "Authentication is set up on your HTTP server, but '$ENV{REMOTE_USER}' does not exist in the database, run the bin/add_user util", result => 'Error'};
			$status = 500;
			goto EXIT;
		}
	} else {
		push @$json, {name => "HTTP authentication", message => "Authentication is not set up on your HTTP server, emulating user 'admin'", result => 'OK'};
	}

	##### Test SMTP config
	if ( ! exists $config->{smtp} ) {
		push @$json, {name => "SMTP configuration", message => "No smtp configuration specified in you config file, notification will NOT be sent", result => 'Warn'};
	} elsif(  ! exists $config->{smtp}->{server} ) {
		push @$json, {name => "SMTP configuration", message => "No smtp server specified", result => "Warning"};
	} elsif( ! gethostbyname($config->{smtp}->{server}) ) {
		push @$json, {name => "SMTP configuration", message => "Cannot resolve smtp server $config->{smtp}->{server}", result => "Warning"};
	} elsif( ! exists $config->{smtp}->{from} ) {
		push @$json, {name => "SMTP configuration", message => "No from address specified", result => "Warning"};
	} elsif ( $config->{smtp}->{from} !~ /^[\w\.\+]+\@[\w\d\.]+$/ ) {
		push @$json, {name => "SMTP configuration", message => "$config->{smtp}->{from} doesn't apear to be a valid email address", result => "Error"};
	} else {
		push @$json, {name => "SMTP configuration", message => "SMTP configuration OK", result => "OK"};
	}

	
EXIT:	
	$self->render(
		json => $json,
		status => $status,
	);
}

1;

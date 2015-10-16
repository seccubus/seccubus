# ------------------------------------------------------------------------------
# Copyright 2014 Frank Breedijk, Steve Launius, Artien Bel (Ar0xA), Petr
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
package SeccubusScanSchedule;

=head1 NAME $RCSfile: SeccubusScanSchedule.pm,v $

This Pod documentation generated from the module SeccubusScanSchedule gives a 
list of all functions within the module.

=cut

use SeccubusDB;
use SeccubusRights;

@ISA = ('Exporter');

@EXPORT = qw ( 
	get_schedules
	create_schedule
	update_schedule
	del_schedule
	);

use strict;
use Carp;

sub get_schedules($;);
sub create_schedule($$$$$$$$);
sub update_schedule($$$$$$$);
sub del_schedule($;);

=head1 Data manipulation - schedules

=head2 get_schedules

Get all schedules for a certain scan from the database

=over 2

=item Parameters

=over 4

=item scan_id - id of the scan

=back 

=item Checks

User must be able to read workspace. 

=back

=cut

sub get_schedules($;){
	my $scan_id = shift or die "No scan_id provided";
	my ($workspace_id) = 
		sql(return	=> "array",
			 query	=> "SELECT	workspace_id FROM scans WHERE	scans.id = ?",
			values	=> [ $scan_id ]
	);
	return undef if(!$workspace_id || ! may_write($workspace_id) );
	my $sch_scans =  sql( "return"	=> "ref",
		    "query"	=> "
		    	SELECT 
					sch.`id`,
					sch.`scan_id`,
					sch.`status`,
					sch.`last_run`
				FROM 
					scan_schedule sch, 
					scans s 
				where 
					s.id=sch.scan_id and
					s.workspace_id = ? and
					s.id = ?;",
		    'values' => [$workspace_id, $scan_id]
	);
	return [ map {
			my $data = {};
			$data->{id} = $_->[0];
			$data->{scanId} = $_->[1];
			$data->{status} = $_->[2];
			$data->{lastRun} = $_->[3];
			$data->{month} = _getScheduleType('month',$data->{id});
			$data->{week} = _getScheduleType('week',$data->{id});
			$data->{wday} = _getScheduleType('wday',$data->{id});
			$data->{day} = _getScheduleType('day',$data->{id});
			$data->{hour} = _getScheduleType('hour',$data->{id});
			$data->{min} = _getScheduleType('min',$data->{id});
			$data;
		} @{$sch_scans} ];
}


sub _getScheduleType($$){
	my ($typeName,$schedule_id) = @_;
	return  join ',', map { $_->[0]; } @{ sql(
		"return" => "ref",
		"query" => "select distinct `$typeName` from `schedules` where schedule_id = ?",
		'values' => [$schedule_id]
	) };


}
=head2 create_schedule

Creates a schedule

=over 2

=item Parameters

=over 4

=item workspace_id - Id of workspace in which schedule needs to be created

=item scan_id - Id of the scan this schedule belongs to

=item month - Month number (1-12). If every month, then '*' (default)

=item week - Month week number (1-5). If every week, then * (default)

=item day - Month day number (1-31), if every day, then * (default)

=item hour - Hour number (0-23), if every hour, then * (default)

=item min - Minute number (0-60), if every minute, then * (default)

=back 

=item Checks

User must be able to write workspace. 

Scan must exist in workspace

Month value must be in range: 1-12 or *

Week value must be in range: 1-5 or *

Day value must be in range: 1-31 or *

Hour value must be in range: 0-23 or *

Min value must be in range: 0-59 or *

=item Returns

Newly inserted id

=back

=cut

sub create_schedule($$$$$$$$){
	my $workspace_id = shift or die "No workspace_id provided";
	my $scan_id = shift or die "No scan_id provided";
	my @months = _checkData('month', 1, 12, shift);
	my @weeks = _checkData('week', 1, 5, shift);
	my @wdays = _checkData('wday', 0, 6, shift);
	my @days = _checkData('day', 1, 31, shift);
	my @hours = _checkData('hour', 0, 23, shift);
	my @mins = _checkData('min', 0, 23, shift);

	return undef if(! may_write($workspace_id) );
	my ($scan_test_id) = sql( 'return' => "array",
		'query'	=> "
			SELECT	scans.id
			FROM	scans
			WHERE	scans.id = ? AND 
			workspace_id = ?",
		'values'	=> [ $scan_id, $workspace_id ]
	);
	die ("Scan $scan_id is not in workspace $workspace_id") if ( $scan_test_id != $scan_id );

	my $id = sql( 'return' => 'id',
		'query' => 'INSERT INTO `scan_schedule` 
				(`scan_id`)
			VALUES (?)',
		'values' => [$scan_id]
	);

	map {
		my $month = $_;
		map {
			my $week = $_;
			map {
				my $wday = $_;
				map {
					my $day = $_;
					map {
						my $hour = $_;
						map {
							my $min = $_;
							sql('return' => 'id',
								'query' => "INSERT INTO `schedules` 
								(`schedule_id`,`month`,`week`,`wday`,`day`,`hour`,`min`)
								VALUES (?,?,?,?,?,?,?)",
								'values' => [$id,$month,$week,$wday,$day,$hour, $min]
								);
							} @mins;
						} @hours;
					} @days;
				} @wdays;
			} @weeks;
		} @months;
	return $id;
}




sub _checkData($$$$){
	my ($parName, $min, $max, $par) = @_;
	my $defStr = "need to be * or ".$min."-".$max." and/or splitted by ',', eg: 1,5,10";
	die "No ".$parName." provided [".$par."], ".$defStr if($par eq '');
	return ($par) if($par eq '*');
	return map {
		die $parName." is not int [".$_."], ".$defStr if($_ ne int($_));
		die $parName." is out of range [".$_."], ".$defStr if($_ < $min || $_ > $max);
		$_;
		} split /,/, $par;
}
=head2 update_schedule

Updates a Schedule

=over 2

=item Parameters

=over 4

=item schedule_id - Id of the schedule

=item month - Month number (1-12). If every month, then '*' (default)

=item week - Month week number (1-5). If every week, then * (default)

=item day - Month day number (1-31), if every day, then * (default)

=item hour - Hour number (0-23), if every hour, then * (default)

=item min - Minute number (0-60), if every minute, then * (default)

=back 

=item Checks

User must be able to write workspace. 

Scan must exist in workspace

Month value must be in range: 1-12 or *

Week value must be in range: 1-5 or *

Day value must be in range: 1-31 or *

Hour value must be in range: 0-23 or *

Min value must be in range: 0-59 or *

=item Returns

updated ID

=back

=cut

sub update_schedule($$$$$$$){
	my $schedule_id = shift or die "No schedule_id provided";
	my @months = _checkData('month',1,12,shift);
	my @weeks = _checkData('week',1,5,shift);
	my @wdays = _checkData('weekday',0,6,shift);
	my @days = _checkData('day',1,31,shift);
	my @hours = _checkData('hour',0,23,shift);
	my @mins = _checkData('min',0,59,shift);
	my ($workspace_id) = sql( 'return' => 'array',
		'query' => 'SELECT s.workspace_id
			FROM `scan_schedule` sch, `scans` s
			WHERE  sch.scan_id = s.id and sch.id = ?',
		'values' => [$schedule_id]
	);
	return undef if(!$workspace_id || ! may_write($workspace_id) );

	sql('return' => 'id', 
		'query' => "delete from `schedules` where `schedule_id` = ?", 
		'values'=>[$schedule_id]
		);

	map {
		my $month = $_;
		map {
			my $week = $_;
			map {
				my $wday = $_;
				map {
					my $day = $_;
					map {
						my $hour = $_;
						map {
							my $min = $_;
							sql('return' => 'id',
								'query' => "INSERT INTO `schedules` 
								(`schedule_id`,`month`,`week`,`wday`,`day`,`hour`,`min`)
								VALUES (?,?,?,?,?,?,?)",
								'values' => [$schedule_id,$month,$week,$wday,$day,$hour, $min]
								);
							} @mins;
						} @hours;
					} @days;
				} @wdays;
			} @weeks;
		} @months;
	return $schedule_id;
}


=head2 del_schedule

Delete a schedule

=over 2

=item Parameters

=over 4

=item schedule - id of the schedule

=back 

=item Checks

User must be able to write workspace. 

=back

=cut

sub del_schedule($;) {
	my $schedule_id = shift or die "No schedule_id provided";

	my ($workspace_id) = sql( 'return' => 'array',
		'query' => 'SELECT s.workspace_id
			FROM `scan_schedule` sch, `scans` s
			WHERE  sch.scan_id = s.id and sch.id = ?',
		'values' => [$schedule_id]
	);
	return undef if(!$workspace_id || ! may_write($workspace_id) );

	sql("return" => 'id',
		"query" => "DELETE FROM `schedules` WHERE schedule_id = ? ",
		"values" => [$schedule_id]
	);
	return sql( "return"	=> "handle",
			    "query"	=> "DELETE FROM `scan_schedule` WHERE id = ?",
			    "values"	=> [ $schedule_id ]
	);
}


# Close the PM file.
return 1;

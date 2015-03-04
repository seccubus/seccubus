import {StatusPage}     from '../components/status-page/status-page';
import {FindingsPage}   from '../components/findings-page/findings-page';
import {RunsPage}       from '../components/runs-page/runs-page';
import {ScansPage}      from '../components/scans-page/scans-page';
import {WorkspacesPage} from '../components/workspaces-page/workspaces-page';

export var RoutesConfig = [
    {
        pageName: 'Status',
        path: 'status',
        component: StatusPage
    },
    {
        pageName: 'Findings',
        path: 'findings',
        component: FindingsPage
    },
    {
        pageName: 'Runs',
        path: 'runs',
        component: RunsPage
    },
    {
        pageName: 'Scans',
        path: 'scans',
        component: ScansPage
    },
    {
        pageName: 'Workspaces',
        path: 'workspaces',
        component: WorkspacesPage
    },
];

export var defaultUrl = '/status';

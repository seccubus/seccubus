import { Injectable } from '@angular/core';

//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';


import * as myConfig from './config';

import { Workspace } from './workspace';
import { WORKSPACES } from './mock-workspaces';
import { MessageService } from './message.service';

@Injectable()
export class WorkspaceService {

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) { }

  getWorkspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(myConfig.apiUrl + '/workspaces')
      .pipe(
        catchError(this.handleError('getWorkspaces', []))
      )
    ;
  }

  getWorkspace(id: number): Observable<Workspace> {
    const url = `${myConfig.apiUrl}/workspace/${id}`);
    return this.http.get<Workspace>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  updateWorkspace(workspace: Workspace): Observable<any> {
    return this.http.put(
      `${myConfig.apiUrl}/workspace/${workspace.id}`,
      workspace,
      myConfig.httpOptions
    ).pipe(
      tap(_ => this.log(`updated workspace id=${workspace.id}`)),
      catchError(this.handleError<any>('updateWorkspace'))
    );
  }

  addWorkspace(workspace: Workspace): Observable<Workspace> {
    return this.http.post<Hero>(`${myConfig.apiUrl}/workspaces`, workspace, myConfig.httpOptions).pipe(
      tap((workspace: Workspace) => this.log(`added workspace with id=${workspace.id}`)),
      catchError(this.handleError<Workspace>('addWorkspace'))
    );
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add('WorkspaceService: ' + message);
  }
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      if ( error.error.message  ) {
        this.log(`${operation} failed: ${error.error.message}`);
      } else {
        this.log(`${operation} failed: ${error.message}`);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };



}

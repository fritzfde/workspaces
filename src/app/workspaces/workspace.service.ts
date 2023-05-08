import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  constructor(private http: HttpClient) {}

  getWorkspaces(): Observable<any> {
    return this.http.post<any>(
      'https://39314-3000.2.codesphere.com/listWorkspaces',
      {
        teamId: 1,
      }
    );
  }

  createWorkspace(workspace: {
    teamId: number;
    name: string;
  }): Observable<any> {
    const httpOptions: {
      headers: HttpHeaders;
      observe: 'response';
      responseType: 'text';
    } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response',
      responseType: 'text',
    };

    return this.http.post(
      'https://39314-3000.2.codesphere.com/createWorkspace',
      workspace,
      httpOptions
    );
  }

  deleteWorkspace(workspaceId: number): Observable<any> {
    const httpOptions: {
      headers: HttpHeaders;
      observe: 'response';
      responseType: 'text';
    } = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      observe: 'response',
      responseType: 'text',
    };
    return this.http.post(
      'https://39314-3000.2.codesphere.com/deleteWorkspace',
      {
        teamId: 1,
        workspaceId,
      },
      httpOptions
    );
  }
}

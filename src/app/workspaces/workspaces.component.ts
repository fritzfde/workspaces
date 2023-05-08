import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './workspace.model';
import { CreateWorkspaceModalComponent } from './create-workspace-modal/create-workspace-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css'],
})
export class WorkspacesComponent implements OnInit, OnDestroy {
  dataSource!: MatTableDataSource<Workspace>;
  displayedColumns: string[] = ['name', 'actions'];
  private subscriptions = new Subscription();
  workspaceCreatedSubscription: Subscription | null = null;
  @Output() workspaceCreated = new EventEmitter();

  constructor(
    private workspaceService: WorkspaceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(): void {
    if (this.workspaceCreatedSubscription) {
      this.workspaceCreatedSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.subscribeToWorkspaceCreated();
    this.loadWorkspaces();
  }

  onWorkspaceCreated(event: any) {}

  subscribeToWorkspaceCreated(): void {
    this.workspaceCreatedSubscription = this.workspaceCreated.subscribe(
      () => {
        this.loadWorkspaces();
      },
      (error) => {
        // Handle the error
      },
      () => {
        // Handle the completion
      }
    );
  }

  loadWorkspaces() {
    this.subscriptions.add(
      this.workspaceService
        .getWorkspaces()
        .pipe(
          tap((workspaces) => {
            this.dataSource = new MatTableDataSource(workspaces);
          }),
          catchError((error) => this.handleError(error))
        )
        .subscribe()
    );
  }

  openCreateWorkspaceModal() {
    const dialogRef = this.dialog.open(CreateWorkspaceModalComponent, {
      // width: '300px',
    });

    dialogRef.componentInstance.workspaceCreated.subscribe((newWorkspace) => {
      if (newWorkspace) {
        this.loadWorkspaces();
      }
    });

    this.subscriptions.add(
      dialogRef
        .afterClosed()
        .pipe(
          tap(() => {}),
          catchError((error) => {
            this.handleError(error);
            return of(null);
          })
        )
        .subscribe()
    );
  }

  deleteWorkspace(workspaceId: number) {
    this.subscriptions.add(
      this.workspaceService
        .deleteWorkspace(workspaceId)
        .pipe(
          tap(() => {
            this.loadWorkspaces();
            this.snackBar.open(
              `Workspace with ID "${workspaceId}" was deleted successfully`,
              'x',
              { duration: 5000 }
            );
          }),
          catchError((error) => {
            this.snackBar.open(
              `Workspace with ID "${workspaceId}" was deleted successfully, but an error occurred: ${error.message}`,
              'x',
              { duration: 5000 }
            );
            return of(null);
          })
        )
        .subscribe()
    );
  }

  closeModal(): void {
    this.dialog.closeAll();
  }

  private handleError(error: any) {
    console.error(error);
    this.snackBar.open(`An error occurred: ${error.message}`, '', {
      duration: 3000,
    });
    return throwError(error);
  }
}

import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkspaceService } from '../workspace.service';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of, Subscription, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-workspace-modal',
  templateUrl: './create-workspace-modal.component.html',
  styleUrls: ['./create-workspace-modal.component.css'],
})
export class CreateWorkspaceModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter();
  @Output() workspaceCreated = new EventEmitter();
  isCreatingWorkspace = false;

  workspaceForm!: FormGroup;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private workspaceService: WorkspaceService,
    private dialogRef: MatDialogRef<CreateWorkspaceModalComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.workspaceForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  onSubmit(): void {
    const workspaceData = {
      name: this.workspaceForm.get('name')?.value,
    };
  }

  create() {
    if (this.workspaceForm.valid) {
      const workspaceData = this.workspaceForm.value;
      this.subscriptions.add(
        this.workspaceService
          .createWorkspace({ teamId: 1, ...workspaceData })
          .pipe(
            tap((newWorkspace) => {
              this.isCreatingWorkspace = false;
              this.workspaceCreated.emit(newWorkspace);
              if (newWorkspace) {
                this.snackBar.open(
                  `Workspace "${workspaceData.name}" was created successfully`,
                  'x',
                  { duration: 5000 }
                );
              }
              // this.dialogRef.close();
            }),
            catchError((error) => {
              this.isCreatingWorkspace = false;
              this.workspaceCreated.emit(error);
              return of(null);
            }),
            finalize(() => {
              this.workspaceCreated.emit();
              this.isCreatingWorkspace = false;
            })
          )
          .subscribe()
      );
    }
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceDetailComponent } from './workspace-detail/workspace-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    WorkspacesComponent,
    WorkspaceDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';


import { AppComponent } from './app.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { WorkspaceDetailComponent } from './workspace-detail/workspace-detail.component';
import { WorkspaceService } from './workspace.service';
import { MessagesComponent } from './messages/messages.component';
import { MessageService } from './message.service';
import { AppRoutingModule } from './/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    WorkspacesComponent,
    WorkspaceDetailComponent,
    MessagesComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    WorkspaceService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
export const apiUrl = "/api/"

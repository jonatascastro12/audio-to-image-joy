import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MyNavComponent} from './my-nav/my-nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatInputModule
} from '@angular/material';
import {MyDashboardComponent} from './my-dashboard/my-dashboard.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MyNavComponent,
    MyDashboardComponent
  ],
  imports: [

    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes} from '@angular/router';

import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { ListComponent } from './components/list/list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MapComponent } from './components/map/map.component';
import { NewdeviceComponent } from './components/newdevice/newdevice.component';
import { AuthGuard } from './guards/auth.guard';
import { UsersComponent } from './components/users/users.component';
import { UpdatedeviceComponent } from './components/updatedevice/updatedevice.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiKeysComponent } from './components/api-keys/api-keys.component';
import { AuditlogComponent } from './components/auditlog/auditlog.component';
import { ViewdeviceComponent } from './components/viewdevice/viewdevice.component';
import { PreviewdeviceComponent } from './components/previewdevice/previewdevice.component';
import { FormatDateComponent } from './components/format-date/format-date.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ClickToCopyComponent } from './components/click-to-copy/click-to-copy.component';
import { DeviceCardComponent } from './components/device-card/device-card.component';
import { DeviceListComponent } from './components/device-list/device-list.component';
import { LocationPipe } from './pipes/location.pipe';
import { ManageUserComponent } from './components/manage-user/manage-user.component';
import { FlashmessageComponent } from './components/flashmessage/flashmessage.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'register', component: RegisterComponent, canActivate: [AuthGuard]},
  {path: 'list', component: ListComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'map', component: MapComponent},
  {path: 'newdevice', component: NewdeviceComponent, canActivate: [AuthGuard]},
  {path: 'updatedevice/:id', component: UpdatedeviceComponent, canActivate: [AuthGuard]},
  {path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
  {path: 'viewdevice/:id', component: ViewdeviceComponent},
  {path: 'resetpassword', component: ResetPasswordComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    DashboardComponent,
    MapComponent,
    NewdeviceComponent,
    UsersComponent,
    UpdatedeviceComponent,
    ApiKeysComponent,
    AuditlogComponent,
    ViewdeviceComponent,
    PreviewdeviceComponent,
    FormatDateComponent,
    ResetPasswordComponent,
    ClickToCopyComponent,
    DeviceCardComponent,
    ListComponent,
    DeviceListComponent,
    LocationPipe,
    ManageUserComponent,
    FlashmessageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    FormsModule,
    NgbModule,
  ],
  providers: [ValidateService, AuthService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

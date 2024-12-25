import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DiagramComponent } from './diagram/diagram.component';
import { ConfigComponent } from './components/config/config.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { SysHiddenDirective } from './directive/sys-hidden.directive';

@NgModule({
  declarations: [
    DiagramComponent,
    AppComponent,
    ConfigComponent,
    SysHiddenDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    // HttpClientModule, // @deprecated — use provideHttpClient(withInterceptorsFromDi()) as providers instead
    FormsModule,
    // ReactiveFormsModule,
    MaterialModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor() {
    console.log('AppModule loaded');

    let entryUrl = window.location.href;
    let entryUrlObj = new URL(entryUrl);
    let entryUrlParams = entryUrlObj.searchParams;

    let targetUriForOpen=entryUrlParams.get("open")
    
    if (targetUriForOpen) {
      try {
        let targetURL = new URL(targetUriForOpen);
        console.info(`"${targetUriForOpen}" ---> "${targetURL}"`)
      } catch(err) {
        console.error(`"${targetUriForOpen}" is invalid URI pattern`)
      }
    }

  }
}

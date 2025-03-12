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
import { AppService } from './app.service';

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
  constructor(private appService:AppService) {
    console.log('AppModule loaded');

    let entryUrl = window.location.href;
    let entryUrlObj = new URL(entryUrl);
    let entryUrlParams = entryUrlObj.searchParams;

    let targetUriForOpen=entryUrlParams.get("open")
    
    if (targetUriForOpen) {
      try {
        let targetURL = new URL(targetUriForOpen);
        console.info(`"${targetUriForOpen}" ---> "${targetURL}"`)
        console.info(`target protocol ---> "${targetURL.protocol }"`) 
        console.info(`target pathname ---> "${targetURL.pathname }"`) 
        if(targetURL.protocol=="file:") {
          if((navigator as any)?.userAgentData?.platform.toUpperCase().includes("WIN")) {
            let targetFilePath=targetURL.pathname;
            let match_win_file_pattern=targetURL.pathname.match("([a-zA-Z]+[:])")
            if(match_win_file_pattern != null) {
              targetFilePath = targetURL.pathname.substring(match_win_file_pattern.index??0);
            }
          }
        } else {
          var request = new XMLHttpRequest();
          request.open('GET', targetURL.href, true);
          request.onreadystatechange = () => {
              if (request.readyState === 4) {
                if(request.status === 200) {
                  var type = request.getResponseHeader('Content-Type');
                  if (type?.indexOf("text") !== 1) {
                      return request.responseText;
                  }
                } else 
                if(request.status > 300) {
                  alert(`fail to load : ${request.status}`)
                }
              }
              return null;
          }
          request.send(null);
        }
        
      } catch(err) {
        console.error(`"${targetUriForOpen}" is invalid URI pattern`)
      }
    }

  }
}

import { APP_BASE_HREF } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigComponent } from './components/config/config.component';
import { HttpClient } from '@angular/common/http';
import JSEncrypt from 'jsencrypt';
import CryptoJs from 'crypto-js';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'bpmn-js-app';
  //diagramUrl = '/assets/tds-rq-diagram.bpmn';
  //diagramUrl = APP_BASE_HREF+'/assets/flow-v2.bpmn';
  //https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn
  importError?: Error;
  showBuildInfo:boolean = false;

  handleImported(event: { type: any; error: any; warnings: any; }) {

    const {
      type,
      error,
      warnings
    } = event;

    if (type === 'success') {
      console.log(`Rendered diagram (%s warnings)`, warnings.length);
    }

    if (type === 'error') {
      console.error('Failed to render diagram', error);
    }

    this.importError = error;
  }

  constructor(private appService: AppService,
              protected httpClient: HttpClient,
              public dialog: MatDialog
  ) {
    console.log('AppComponent loaded');

    this.appService.eventEmitter.asObservable().subscribe(eventName => {
      const dialogRef = this.dialog.open(ConfigComponent, {
        width: '90%', height: '70%',
        disableClose: true
      })

      
      dialogRef.componentInstance.event.asObservable().subscribe(val => {
        dialogRef.close();
        if(val=='apply') {
          console.debug('config dialog apply')
        }
        if(val=='cancel') {
          console.debug('config dialog cancel')
        }
      })
      dialogRef.afterClosed().subscribe(result => {
        console.debug("dialog")
      })
    })

    // this.appService.menuBarStatus.subscribe(value => {
    //   if(value=="active") {
        
    //   }
    // })
  }

  get buildInfo() {
    return _buildInfo;
  }

  ngOnInit() {
    this.doInitialize();
  }

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:keydown', ['$event'])
  handleKeydownEvent(event: KeyboardEvent) {
    if (event.type === 'keydown') {
      if( event.code === 'Slash'
       && event.shiftKey
       && event.ctrlKey ) {
        // [Ctrl]+[Shift]+[/] to toggle

        this.appService.sysHiddenFlag.next(!this.appService.sysHiddenFlag.value);
      }
    }
  }

  private doInitialize() {

    
    // load deployment config
    this.httpClient.get("assets/data/deployment.runtime.json").subscribe(res => {

      AppService.deployment_runtime_data=((typeof res == "string")?JSON.parse(res):res);
      let jsEncryptObj_enc = new JSEncrypt({ log:true });
      let jsEncryptObj_dec = new JSEncrypt({ log:true });
      let setupCypherConfig=function(encryptor:JSEncrypt, decryptor:JSEncrypt) {
        encryptor.setPublicKey(rsaConfig.pub);
        decryptor.setPrivateKey(rsaConfig.prv);
      }
      eval(`
        setupCypherConfig(jsEncryptObj_enc, jsEncryptObj_dec)
      `);
      this.initializeRuntimeConfig(jsEncryptObj_enc, jsEncryptObj_dec)
    })
  }

  private initializeRuntimeConfig(jsEncryptObj_enc:JSEncrypt, jsEncryptObj_dec:JSEncrypt) {
    if(AppService.deployment_runtime_data?.RUNTIME_CFG_CONTENT) {
      let runtime_cfg_content = jsEncryptObj_dec.decrypt(AppService.deployment_runtime_data.RUNTIME_CFG_CONTENT)

      if(runtime_cfg_content) {
        let [aes_hex_k, aes_hex_iv] = runtime_cfg_content.split(":");
        this.httpClient.get("assets/data/cfg.runtime.enc-b64", {responseType: 'text'}).subscribe(res => {
          let decryptedContent = CryptoJS.AES.decrypt(
                res, 
                CryptoJS.enc.Hex.parse(aes_hex_k), 
                { 
                    iv: CryptoJS.enc.Hex.parse(aes_hex_iv), 
                    mode: CryptoJS.mode.CBC, 
                    padding: CryptoJS.pad.Pkcs7 
                })
                .toString(CryptoJS.enc.Utf8)

          AppService.config_runtime_data = JSON.parse(decryptedContent);
        })
      }
    }
  }

}

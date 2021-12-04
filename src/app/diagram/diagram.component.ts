import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
  SimpleChanges,
  EventEmitter
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */
//import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.production.min.js';
import * as BpmnJSModeler from 'bpmn-js/dist/bpmn-modeler.development.js';
import * as BpmnJSViewer from 'bpmn-js/dist/bpmn-modeler.development.js';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import BpmnPropertiesPanelModule from 'bpmn-js-properties-panel'
import BpmnPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn'
import BpmnTaskResizeableModule from 'bpmn-js-task-resize/lib'
import BpmnJsCustomRendererModule from 'custom-modules/bpmn-js-custom-renderer'
import { diff } from 'bpmn-js-differ';
import BpmnModdle from 'bpmn-moddle';

import * as $ from 'jquery';

import { from, Observable, Subscription } from 'rxjs';
import { LoadingScreenService } from '../services/loading-screen.service';

declare const Window: any;
const defaultBlankDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_16sl5yv" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="8.8.2">
  <bpmn:process id="Process_1q79h8l" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1q79h8l" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.component.html',
  styles: [
    `
      .diagram-container {
        height: 100%;
        width: 100%;
      }
      .propPanel {
        position: absolute;
        top: 0px;
        right: 0px;
        z-index: 20000;
      }
      .btn-group-01 {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        z-index: 20000;
      }
      .btn-group-02 {
        position: absolute;
        bottom: 1rem;
        right: 5rem;
        z-index: 20000;
      }
      .split-bar-right {
        margin-right: 5px;
        border-right: 5px solid #3f51b5;
      }
      .hide {
        display: none;
      }
      .djs-palette.hide {
        display: none;
      }
      .top-center {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%, 0)
      }
      .panel {
        background: lightgray;
      }
      .changed-items-container {
        max-height: 200px;
        overflow-y: auto;
      }
      .changed-items-container table {
        background: white;
      }
      .changed-items-container td {
        border: 1px solid black;
      }
    `
  ]
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy {
  private bpmnJSModeller: any;
  private bpmnJSBaseVerViewer: any = null;
  private bpmnJSCrntVerViewer: any = null;

  
  @ViewChild('diagramBaseCompareRef', { static: true }) diagramBaseCompareContainerEl!: ElementRef;
  @ViewChild('diagramRef', { static: true }) diagramContainerEl!: ElementRef;
  @ViewChild('propPanelRef', { static: true }) propPanelEl!: ElementRef;
  @Output() importDone: EventEmitter<any> = new EventEmitter();
  @Input() url: string|null = null;

  downloadAncher = document.createElement("a");
  uploadInput = document.createElement("input");
  uploadInput2 = document.createElement("input");
  filename = "filename.bpmn";
  searchText = "";
  bpmnChanges = {}
  currentBpmnXml:string|null = null;
  baseBpmnXml:string|null = null;
  baseCompareEnabled:boolean = false;
  showListOfChangedElements:boolean = false;

  constructor(
    private http: HttpClient,
    private loadingScreenService:LoadingScreenService) {

    this.uploadInput.type = "file";
    this.uploadInput.addEventListener('change', (event) => {
      console.debug("uploadInput change");
      const reader = new FileReader();
      reader.onload = (event) => {
        let xml = event.target?.result;
        this.importDiagram(xml as string)
      }
      if(this.uploadInput?.files && this.uploadInput?.files[0] != null) {
        reader.readAsText(this.uploadInput.files[0]);
      }
    });
    this.uploadInput2.type = "file";
    this.uploadInput2.addEventListener('change', (event) => {
      console.debug("uploadInput2 change");
      const reader = new FileReader();
      reader.onload = (event) => {
        let baseXml = event.target?.result;
        this.bpmnJSBaseVerViewer.importXML(baseXml).then((event:any) => {
          console.debug("bpmnJSBaseVerViewer.importXML", event);
          this.doCompareDiagram()
        });
        
      }
      if(this.uploadInput2?.files && this.uploadInput2?.files[0] != null) {
        reader.readAsText(this.uploadInput2.files[0]);
      }
    });
    this.uploadInput.style.display = "none";
    this.downloadAncher.style.display = "none";

    this.bpmnJSModeller = new BpmnJSModeler({
      // textRenderer: {
      //   defaultStyle: {
      //     fontSize: '16px',
      //   },
      //   externalStyle: {
      //     fontSize: '16px',
      //   }
      // },
      additionalModules: [
        BpmnColorPickerModule,
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        BpmnTaskResizeableModule,
        BpmnJsCustomRendererModule
      ],
      taskResizingEnabled: true,
      eventResizingEnabled: true
    });

    this.bpmnJSBaseVerViewer = new BpmnJSViewer();
    this.bpmnJSCrntVerViewer = new BpmnJSViewer();

    this.bpmnJSModeller.on('import.parse.start', (event:any) => {
      /*
        event = {
          xml: xml
        }
      */
      console.log("import.parse.start");
      this.loadingScreenService.showSpinner();
    })
    
    this.bpmnJSModeller.on('import.parse.complete', (event:any) => {
      /*
        event = {
          error: null,
	        definitions: definitions,
	        elementsById: elementsById,
	        references: references,
	        warnings: parseWarnings
        }
      */
      this.bpmnJSCrntVerViewer.importDefinitions(event.definitions);

    })

    this.bpmnJSModeller.on('import.done', (result:any) => {
      console.log("import.done");
      this.loadingScreenService.stopSpinner();
      this.bpmnJSModeller.get('canvas').zoom('fit-viewport');
      
      if (!result.error) {
        this.bpmnJSModeller.get('canvas').zoom('fit-viewport');
      } else {
        console.error(result.error);
      }
    });
  }

  ngAfterContentInit(): void {

    this.bpmnJSModeller.attachTo(this.diagramContainerEl.nativeElement);
    this.bpmnJSModeller.get('keyboard').bind(document);
    

    // let overlays = this.bpmnJS.get('overlays');
    // let exportBtn = $('<div>export</div>');
    // overlays.add("SCAN_OK", {
    //   position: {
    //     left: 0,
    //     bottom: 0
    //   },
    //   html: exportBtn
    // });

    let propertiesPanel = this.bpmnJSModeller.get('propertiesPanel');
    propertiesPanel?.detach();
    propertiesPanel?.attachTo(this.propPanelEl.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes.url) {
      if(changes.url.currentValue != null) {
        this.loadUrl(changes.url.currentValue);
      } else {
        this.doResetToBlank();
      }
    }
  }

  ngOnDestroy(): void {
    this.bpmnJSModeller.get('keyboard').unbind();
    this.bpmnJSModeller.destroy();
  }

  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string): Subscription {
    console.log("loadUrl :: ", url);

    return (
      this.http.get(url, { responseType: 'text' }).pipe(
        switchMap((xml: string) => this.importDiagram(xml)),
        map(result => result.warnings),
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );
  }

  /**
   * Creates a Promise to import the given XML into the current
   * BpmnJS instance, then returns it as an Observable.
   *
   * @see https://github.com/bpmn-io/bpmn-js-callbacks-to-promises#importxml
   */
  private importDiagram(xml: string): Observable<{warnings: Array<any>}> {
    console.debug("importDiagram");
    this.currentBpmnXml = xml;
    return from(this.bpmnJSModeller.importXML(this.currentBpmnXml) as Promise<{warnings: Array<any>}>);
  }
  private doCompareDiagram() {

    this.bpmnJSBaseVerViewer.saveXML({}, (err:any, baseXml:any) => {
      this.bpmnJSCrntVerViewer.saveXML({}, (err:any, newXml:any) => {
        const baseBpmnDefs = new BpmnModdle().fromXML(baseXml);
        const currentBpmnDefs = new BpmnModdle().fromXML(newXml);

        this.bpmnChanges = diff(baseBpmnDefs.__zone_symbol__value.rootElement, currentBpmnDefs.__zone_symbol__value.rootElement);
        console.log("bpmnChanges :: ", this.bpmnChanges);
      })
    })
  }

  validateFileName() {
    if(this.filename.indexOf(".") < 0) {
      this.filename = `${this.filename}.bpmn`;
    }
  }
  doLoad() {
    this.uploadInput.click();
  }
  doLoadBase() {
    this.uploadInput2.value = "";
    this.uploadInput2.click();
  }
  doSaveToServer() {
    window.alert("save to server doesn't support yet");
  }
  doSaveAsFile() {
    this.bpmnJSModeller.saveXML({ format: true }, (err:any, xml:any) => {
      
      this._doSaveAsFile(new Blob([xml], {type: "text/xml"}));
    });
  }
  async _doSaveAsFile(blob:Blob) {
    if(Window.showSaveFilePicker) {
      const fileHandle = await Window.showSaveFilePicker();
      const fileStream = fileHandle.createWriteable();
      await fileStream.write(blob);
      await fileStream.close();
    } else {
      this._doDownload(blob);
    }
  }
  doDownload() {
    this.bpmnJSModeller.saveXML({ format: true }, (err:any, xml:any) => {
      let blob = new Blob([xml], {type: "text/xml"});
      this._doDownload(blob);
    });
  }
  _doDownload(blob:Blob) {
    let blobUrl = window.URL.createObjectURL(blob);
    this.downloadAncher.href = blobUrl;
    this.downloadAncher.download = this.filename;
    this.downloadAncher.click();
  }
  doSearch() {
    let result = this.bpmnJSModeller.find(this.searchText);
    console.log("search result", result);
  }
  doZoomIn() {
    window.alert("doesn't support yet");
  }
  doZoomOut() {
    window.alert("doesn't support yet");
  }
  doZoomFitBaseContent() {
    this.bpmnJSBaseVerViewer.get('canvas').zoom('fit-viewport');
  }
  doZoomFitContent() {
    this.bpmnJSModeller.get('canvas').zoom('fit-viewport');
    this.bpmnJSCrntVerViewer.get('canvas').zoom('fit-viewport');
  }

  doResetToBlank() {
    this.importDiagram(defaultBlankDiagram);
  }
  doToggleCompareBase() {
    console.debug("doToggleCompareBase");
    this.baseCompareEnabled = !this.baseCompareEnabled;
    
    if(this.baseCompareEnabled) {

      this.bpmnJSModeller.detach()
      this.bpmnJSCrntVerViewer.attachTo(this.diagramContainerEl.nativeElement);
      this.bpmnJSBaseVerViewer.attachTo(this.diagramBaseCompareContainerEl.nativeElement);
      

      let palette2 = this.bpmnJSCrntVerViewer.get('palette');
      //palette2.close();
      //(palette2._container as HTMLElement).classList.add('hide');
      (palette2._container as HTMLElement).style.display = "none";

      
      this.bpmnJSCrntVerViewer.importDefinitions(this.bpmnJSModeller.getDefinitions());

    } else {
      this.bpmnJSBaseVerViewer.detach();
      this.bpmnJSCrntVerViewer.detach();
      this.bpmnJSModeller.attachTo(this.diagramContainerEl.nativeElement);

      //show palette after attach
      let palette = this.bpmnJSModeller.get('palette');
      palette.open();

      // (palette._container as HTMLElement).classList.remove('hide');
      // console.log("palette._container", palette._container);
    }
    
  }


  doToggleListOfChangedElements() {
    this.showListOfChangedElements = !this.showListOfChangedElements;
  }
}

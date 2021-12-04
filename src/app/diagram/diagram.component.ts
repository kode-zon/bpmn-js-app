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
import * as BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import BpmnPropertiesPanelModule from 'bpmn-js-properties-panel'
import BpmnPropertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn'
import BpmnTaskResizeableModule from 'bpmn-js-task-resize/lib'
import BpmnJsCustomRendererModule from 'custom-modules/bpmn-js-custom-renderer'

import * as $ from 'jquery';

import { from, Observable, Subscription } from 'rxjs';

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
    `
  ]
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy {
  private bpmnJS: any;

  @ViewChild('diagramRef', { static: true }) diagramContainerEl!: ElementRef;
  @ViewChild('propPanelRef', { static: true }) propPanelEl!: ElementRef;
  @Output() importDone: EventEmitter<any> = new EventEmitter();
  @Input() url: string|null = null;

  downloadAncher = document.createElement("a");
  uploadInput = document.createElement("input");
  filename = "filename.bpmn";
  searchText = "";

  constructor(private http: HttpClient) {

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
    this.uploadInput.style.display = "none";
    this.downloadAncher.style.display = "none";

    this.bpmnJS = new BpmnJS({
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


    this.bpmnJS.on('import.done', (result:any) => {
      console.log("import.done");
      this.bpmnJS.get('canvas').zoom('fit-viewport');
      
      if (!result.error) {
        this.bpmnJS.get('canvas').zoom('fit-viewport');
      } else {
        console.error(result.error);
      }
    });
  }

  ngAfterContentInit(): void {

    this.bpmnJS.attachTo(this.diagramContainerEl.nativeElement);

    this.bpmnJS.get('keyboard').bind(document);
    

    // let overlays = this.bpmnJS.get('overlays');
    // let exportBtn = $('<div>export</div>');
    // overlays.add("SCAN_OK", {
    //   position: {
    //     left: 0,
    //     bottom: 0
    //   },
    //   html: exportBtn
    // });

    let propertiesPanel = this.bpmnJS.get('propertiesPanel');
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
    this.bpmnJS.get('keyboard').unbind();
    this.bpmnJS.destroy();
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
    return from(this.bpmnJS.importXML(xml) as Promise<{warnings: Array<any>}>);
  }

  validateFileName() {
    if(this.filename.indexOf(".") < 0) {
      this.filename = `${this.filename}.bpmn`;
    }
  }
  doLoad() {
    this.uploadInput.click();
  }
  doSaveToServer() {
    window.alert("save to server doesn't support yet");
  }
  doSaveAsFile() {
    this.bpmnJS.saveXML({ format: true }, (err:any, xml:any) => {
      
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
    this.bpmnJS.saveXML({ format: true }, (err:any, xml:any) => {
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
    let result = this.bpmnJS.find(this.searchText);
    console.log("search result", result);
  }
  doZoomIn() {
    window.alert("doesn't support yet");
  }
  doZoomOut() {
    window.alert("doesn't support yet");
  }
  doZoomFitContent() {
    this.bpmnJS.get('canvas').zoom('fit-viewport');
  }

  doResetToBlank() {
    this.importDiagram(defaultBlankDiagram);
  }

}

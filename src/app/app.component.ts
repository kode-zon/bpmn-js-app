import { APP_BASE_HREF } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bpmn-js-app';
  //diagramUrl = '/assets/tds-rq-diagram.bpmn';
  //diagramUrl = APP_BASE_HREF+'/assets/flow-v2.bpmn';
  //https://cdn.staticaly.com/gh/bpmn-io/bpmn-js-examples/dfceecba/starter/diagram.bpmn
  importError?: Error;

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

}

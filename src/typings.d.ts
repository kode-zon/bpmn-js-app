//declare module 'bpmn-js/dist/bpmn-modeler.production.min.js';
declare module 'bpmn-js/dist/bpmn-modeler.development.js';
declare module 'bpmn-js-color-picker';
declare module 'bpmn-js-properties-panel';
declare module 'bpmn-js-properties-panel/lib/provider/bpmn';
declare module 'bpmn-js-task-resize/lib';
//declare module 'custom-modules/bpmn-js-custom-renderer';
declare module 'bpmn-js-differ';
declare module 'bpmn-moddle';
declare module 'jquery';

declare var _buildInfo: BuildInfoInterface
interface BuildInfoInterface {
            systemName: string,
            version: string,
            buildNumber: string,
            buildTime: number,
            revision: string,
            revisionShort: string,
            branchName: string,
            buildUser: string
}

declare var rsaConfig: RsaConfigInterface
interface RsaConfigInterface {
  pub: string,
  prv: string,
}
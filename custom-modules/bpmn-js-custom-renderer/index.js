import CustomBpmnRenderer from './CustomBpmnRenderer';
import CustomBpmnTextRenderer from './CustomBpmnTextRenderer';

export default {
    __init__: ['customBpmnRenderer', 'customBpmnTextRenderer'],
    customBpmnRenderer: [ 'type', CustomBpmnRenderer ],
    customBpmnTextRenderer: [ 'type', CustomBpmnTextRenderer ]
}
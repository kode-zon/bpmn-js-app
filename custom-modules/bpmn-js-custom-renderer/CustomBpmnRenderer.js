import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

const HIGH_PRIORITY = 1500;

export default class CustomBpmnRenderer extends BaseRenderer {
    constructor(eventBus, bpmnRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.bpmnRenderer = bpmnRenderer;
    }

    canRender(element) {
        // only labels
        return element.labelTarget;
    }

    renderExternalLabel(parentGfx, element) {

        console.log("CustomBpmnRenderer.renderExternalLabel");

        var box = {
          width: 90,
          height: 30,
          x: element.width / 2 + element.x,
          y: element.height / 2 + element.y
        };
    
        return renderLabel(parentGfx, super.getLabel(element), {
          box: box,
          fitBox: true,
          style: assign(
            {},
            textRenderer.getExternalStyle(),
            {
              fill: getLabelColor(element, defaultLabelColor, defaultStrokeColor)
            }
          )
        });
    }
}
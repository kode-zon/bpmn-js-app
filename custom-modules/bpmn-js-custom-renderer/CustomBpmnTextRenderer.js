import TextRenderer from 'bpmn-js/lib/draw/TextRenderer';

export default class CustomBpmnTextRenderer extends TextRenderer {
    constructor(config) {
        super(config);
    }

    getExternalLabelBounds(bounds, text) {

        console.debug("CustomBpmnTextRenderer.getExternalLabelBounds");

        var layoutedDimensions = textUtil.getDimensions(text, {
          box: {
            width: 90,
            height: 30,
            x: bounds.width / 2 + bounds.x,
            y: bounds.height / 2 + bounds.y
          },
          style: externalStyle
        });
    
        // resize label shape to fit label text
        return {
          x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
          y: Math.round(bounds.y),
          width: Math.ceil(layoutedDimensions.width),
          height: Math.ceil(layoutedDimensions.height)
        };
    
      };
}


CustomBpmnTextRenderer.$inject = [
  'config.textRenderer'
];
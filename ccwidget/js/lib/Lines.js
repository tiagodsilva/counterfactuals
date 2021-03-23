import * as widgets from '@jupyter-widgets/base'; 
var _ = require('lodash');

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var LinesModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'LinesModel',
        _view_name : 'LinesView',
        _model_module : 'ccwidget',
        _view_module : 'ccwidget',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        value : "Hello!"
    })
});


// Custom View. Renders the widget model.
var LinesView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function() {
        this.value_changed();
   
        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on('change:value', this.value_changed, this);
    },

     value_changed: function() {
        this.el.textContent = this.model.get('value');
    }
});


export {
  LinesModel,
  LinesView 
}


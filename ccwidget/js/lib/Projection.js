import * as widgets from '@jupyter-widgets/base';
import setCSS from "./html/setCSS.js";
import setDivs from "./html/setDivs.js";
import { DrawProjection } from "./vis/projection.js";
var _ = require('lodash');

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var ProjectionModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'ProjectionModel',
        _view_name : 'ProjectionView',
        _model_module : 'ccwidget',
        _view_module : 'ccwidget',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        value : "Hello!"
    })
});


// Custom View. Renders the widget model.
var ProjectionView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM
    render: function() {
        this.value_changed();

        let filepath = this.model.get("filepath");
        setCSS(this.el);
        setDivs(this.el);
        this.el.classList.add("cfWidget");

        let correspondents = this.model.get("cfr_cfs");
        let projection = this.model.get("projection");
        let dist = this.model.get("dist");
        let cfa = this.model.get("cfa");
        // console.log(correspondents);
        setTimeout(() => {
          DrawProjection(correspondents, projection, dist, cfa)
        }, 225);
        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on('change:value', this.value_changed, this);
    },

    value_changed: function() {
        this.el.textContent = this.model.get('value');
    }
});


export {
  ProjectionModel,
  ProjectionView
}

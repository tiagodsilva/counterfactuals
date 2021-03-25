import * as widgets from '@jupyter-widgets/base'; 
import {LinePath, drawStep, fdir, features, drawCanvas} from "./vis/lines.js"; 
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
        // this.value_changed();
        
        let div = document.createElement("div"); 
        div.id = "CFLinesDIV"; 
        this.el.appendChild(div); 
        const self = this; 
        const dataset = this.model.get("_lines"); 
        const order = this.model.get("_order"); 
        const features = Object.keys(dataset); 
        const divID = "CFLinesSVG"; 
        self.lines = {}; 
        self.initialize = true; 
        setTimeout(() => { 
            drawCanvas(div.id, dataset); 
            for(let i = 0; i < features.length; i++) { 
                const feat = features[i];  
                const data = dataset[feat]; 
                let lineChart = new LinePath(data, divID, feat, order[feat], this); 
                lineChart.draw(); 
                lineChart.axis(); 
                lineChart.path(); 
                lineChart.circles(); 
                lineChart.label(); 
                lineChart.brush(); 
                self.lines[feat] = lineChart; 
            } 
        }, 229); 
        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on('change:_lines', this.value_changed, this, features);
    },

     value_changed: function() {
        // this.el.textContent = this.model.get('value'); 
        const self = this; 
        const dataset = this.model.get("_lines"); 
        // console.log(dataset); 
        const order = this.model.get("_order"); 
        if(!self.intialize) { 
            setTimeout(() => {  
                for(let i = 0; i < features.length; i++) { 
                    const feat = features[i]; 
                    const data = dataset[feat]; 
                    self.lines[feat].update(data, order[feat]); 
                }  
            }, 229) 
        } 
        self.initialize = false; 
    }
});


export {
  LinesModel,
  LinesView 
}


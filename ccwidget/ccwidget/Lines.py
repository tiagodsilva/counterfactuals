import ipywidgets as widgets
from traitlets import Unicode, Dict, List, Float, observe
from .utils.root_path import ROOT_PATH
# See js/lib/Projection.js for the frontend counterpart to this file.

@widgets.register
class Lines(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode("LinesView").tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode("LinesModel").tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('ccwidget').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('ccwidget').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    cfData = Dict(dict()).tag(sync = True) 
    _feature_interacted = Unicode("None").tag(sync = True) 
    _interaction = Float(1).tag(sync = True) 
    def __init__(self, cfa: dict, on_brush = None): 
        """ 
        The constructor method of the widget. 
    
        Parameters 
        -------------- 
        cfa: dict of dicts 
            A dictionary containing the json data for each feature. 

        on_brush: function 
            A function that dictates what will happen with the plot on brushing. 
        """      
        super().__init__() 
        self.cfData = cfa 
        self._on_brush = on_brush 
        self._feature_interacted = "None" 
        self._interaction = 1 
        self._selection = {} 
        for i in self.cfData[0].keys(): # initialize _selection 
            self._selection[i] = None 
    
    @observe("_interaction") 
    def _observe_selection(self, change): 
        if self._interaction >= 0 and self._feature_interacted is not None: 
            self._selection[self._feature_interacted] = self._interaction 
        elif self._feature_interacted is not None: 
            self._selection[self._feature_interacted] = None 
        if self._on_brush is not None: 
            self._on_brush(self._selection) 
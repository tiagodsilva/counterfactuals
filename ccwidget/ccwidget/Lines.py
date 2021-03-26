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

    _lines = Dict(dict()).tag(sync = True) 
    _order = Dict(dict()).tag(sync = True) 
    _fdir = Dict(dict()).tag(sync = True) 
    ROOT_PATH = Unicode(ROOT_PATH).tag(sync = True) 
    _feature_interacted = Unicode("None").tag(sync = True) 
    _interaction = Float(1).tag(sync = True) 

    # initialize = True # check if the widget is initializing now 
    def __init__(self, lines: dict, order: dict, feat_direction: dict, on_brush = None): 
        """ 
        The constructor method of the widget. 
    
        Parameters 
        -------------- 
        lines: dict of pd.DataFrame  
            A dictionary containing the json data for each feature. 

        order: dict 
            A dictionary in which the keys are the features and the 
            values are the order in which they will appear in the chart. 

        feat_direction: dict 
            A dictionary containing, for each feature, a value of 1 
            if its values are increasing and -1 otherwise. 
        
        on_brush: function 
            A function that dictates what will happen with the plot on brushing. 
        """      
        super().__init__() 
        self._lines = lines 
        self._order = order 
        self._on_brush = on_brush 
        self._fdir = feat_direction 
        self._feature_interacted = "None" 
        self._interaction = 1 
        self._selection = {} 
        for i in self._lines.keys(): # initialize _selection 
            self._selection[i] = None 
    
    @observe("_interaction") 
    def _observe_selection(self, change): 
        if self._interaction >= 0 and self._feature_interacted is not None: 
            self._selection[self._feature_interacted] = self._interaction 
        elif self._feature_interacted != "None": # this must be Unicode
            print(self._feature_interacted)
            self._selection[self._feature_interacted] = None 
        if self._on_brush is not None: 
            self._on_brush(self._selection) 
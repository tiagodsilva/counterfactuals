import ipywidgets as widgets
from traitlets import Unicode, Dict, List, observe
from .utils.root_path import ROOT_PATH
# See js/lib/Projection.js for the frontend counterpart to this file.

@widgets.register
class Lines(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode("ProjectionView").tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode("ProjectionModel").tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('ccwidget').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('ccwidget').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    def __init__(self, cfa, on_brush = None): 
        """ 
        The constructor method of the widget. 

        Parameters 
        -------------- 
        cfa: dict of dicts 
            A dictionary containing the json data for each feature. 

        on_brush: function 
            A function that dictates what will happen with the plot on brushing. 
        """ 
        self.cfa = cfa 
        self._on_brush = on_brush 

    
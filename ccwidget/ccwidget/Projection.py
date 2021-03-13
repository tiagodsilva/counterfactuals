import ipywidgets as widgets
from traitlets import Unicode, Dict, List
from .utils.root_path import ROOT_PATH
# See js/lib/Projection.js for the frontend counterpart to this file.

@widgets.register
class Projection(widgets.DOMWidget):
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

    cfa = List([]).tag(sync = True)
    dist = List([]).tag(sync = True)
    cfr_cfs = List([]).tag(sync = True)
    projection = List([]).tag(sync = True)

    filepath = Unicode(ROOT_PATH).tag(sync = True)
    # value = Unicode("Hello!").tag(sync = True)
    def __init__(self, *args, cfa, dist, cfr_cfs, projection, **kwargs):
        """
        Constructor method for the widget.
        Inherits from widgets.DOMWidget.

        Parameters
        -------------
        cfa: dict
            A json containing the counterfactuals' values.
        dist: dict
            A json containing the distance between the
            real value all counterfactuals.
        cfr_cfs: dict
            A dataframe containing the correspondence between
            the value of the real counterfactuals and the
            synthetic counterfactuals.
        projection: dict
            A dataframe containing the coordinates of
            the counterfactuals' projection.
        """
        super().__init__(*args, **kwargs)

        # this will receive a dict, instead of a dataframe,
        # because we need to use traitlets built-in types!

        self.cfa = cfa
        self.dist = dist
        self.cfr_cfs = cfr_cfs
        self.projection = projection

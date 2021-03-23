import pandas as pd
from .Projection import Projection

class CFOverview:

    def __init__(self, cfa, dist, cfr_cfs, projection, dist_orig_real, on_select = None):
        """
        Constructor method for CFOverview.

        Parameters
        -------------
        cfa: pd.DataFrame
            A dataframe containing the values of the counterfactuals.

        dist: pd.DataFrame
            A dataframe containing the distance between the real
            value and all counterfactuals.

        cfr_cfs: pd.DataFrame
            A dataframe containing the correspondence between the
            values of the real counterfactuals and the synthetic counterfactuals.

        projection: pd.DataFrame
            A dataframe containing the coordinates of the counterfactuals' projection.
        """
        self.cfa = cfa
        self.dist = dist
        self.cfr_cfs = cfr_cfs
        self.projection = projection
        self.dist_orig_real = dist_orig_real
        self._on_select = on_select
        self._widget = Projection(cfa = self.cfa.to_dict("records"),
                        dist = self.dist.to_dict("records"),
                        cfr_cfs = self.cfr_cfs.to_dict("records"),
                        projection = self.projection.to_dict("records"),
                        dist_orig_real = self.dist_orig_real.to_dict("records"),
                        on_select = self._on_select)
    @property
    def widget(self):
        return self._widget

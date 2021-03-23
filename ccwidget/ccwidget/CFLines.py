import pandas as pd 

class CFLines: 

    def __init__(self, cfa, on_brush = None): 
        """ 
        Constructor method for CFLines. 

        Parameters 
        -------------- 
        cfa: dict of pd.DataFrame 
            A dictionary containing, for each feature, the change values of the counterfactuals. 

        on_brush: function 
            A function that dictates what happens on brush. 
        """ 
        self.steps = steps 
        self._on_brush = on_brush 

    def update_chart(self, cfa): 
        pass 

    @property 
    def widget(self): 
        return self._widget 
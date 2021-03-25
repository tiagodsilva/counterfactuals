import pandas as pd 

from .Lines import Lines 
class CFLines: 

    def __init__(self, lines: dict, order: pd.DataFrame, on_brush = None): 
        """ 
        Constructor method for CFLines. 

        Parameters 
        -------------- 
        lines: dict of pd.DataFrame 
            A dictionary containing, for each feature, the change values of the counterfactuals. 

        order: pd.DataFrame 
            A dataframe containing the order in which the features will be plotted. 
        
        on_brush: function 
            A function that dictates what happens on brush. 
        """ 
        # for feat in lines.keys(): 
            # lines[feat] = lines[feat].to_dict("records") 
        
        self.lines = dict((feat, lines[feat].to_dict("records")) for feat in lines.keys())  
        self._on_brush = on_brush 
        self.order = dict(zip(order["0"], order[""]))
        self._widget = Lines(self.lines, self.order, self._on_brush) 
        
    def update_chart(self, lines, order): 
        self._widget._order = dict(zip(order["0"], order[""]))   
        self._widget._lines = dict(
            (feat, lines[feat].to_dict("records")) for feat in lines.keys() 
        ) 


    @property 
    def widget(self): 
        return self._widget 
    

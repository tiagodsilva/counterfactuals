import pandas as pd 

from .Lines import Lines 
class CFLines: 

    def __init__(self, cfa: dict, on_brush = None): 
        """ 
        Constructor method for CFLines. 

        Parameters 
        -------------- 
        cfa: dict of pd.DataFrame 
            A dictionary containing, for each feature, the change values of the counterfactuals. 

        on_brush: function 
            A function that dictates what happens on brush. 
        """ 
        dicts = {} 
        for i in range(len(cfa)): 
            dicts[i] = {} 
            for feat in cfa[i].keys(): 
                dicts[i][feat] = cfa[i][feat].to_dict("records") 
        
        self.cfa = dicts 
        self._on_brush = on_brush 
        self._widget = Lines(self.cfa, self._on_brush) 
        
    def update_chart(self, cfa): 
        self.cfa = cfa 


    @property 
    def widget(self): 
        return self._widget 
    

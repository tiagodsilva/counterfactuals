import os 
from pathlib import Path 

CURRENT_DIR = os.path.dirname(os.path.realpath(__file__)) 
ROOT_PATH = str(Path(CURRENT_DIR).parent.parent) 

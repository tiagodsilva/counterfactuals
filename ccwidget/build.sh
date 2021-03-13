jupyter nbextension install --sys-prefix --symlink --overwrite --py ccwidget 
jupyter nbextension enable --sys-prefix --py ccwidget 
cd ccwidget 
rm static -rf
cd ../js
rm dist -rf
npm run build
cd ../.

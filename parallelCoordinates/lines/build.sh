sudo kill -9 `sudo lsof -t -i:9999` 
python -m http.server 9999&. 

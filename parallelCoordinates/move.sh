message=$1 
cp projection/* ../../ProjectionCounterCrime/ -r 
cd ../../ProjectionCounterCrime 
git add . 
git commit -m "$message"  
git push origin main 
cd ../counterfactuals 

#include<iostream>
#include<vector>
using namespace std;
int main(){
    vector<string> v = {
        "Nikhil", "Nakul", "Nitin", "Sagar", "Kapil", "Navin", "Sahil"
    };

    vector<string> sorted;

    int a = 30;
    while(a--){
        string q;
        cin>>q;
    for(int i = 0; i < v.size(); i++){
        bool flag = true;
        for(int j = 0, k = 0; j < v[i].size() && k < q.size(); j++, k++){
            if(v[i][j] != q[k]){
                flag = false;
            }
        }
        if(flag) sorted.push_back(v[i]);
   }

   for(int i = 0; i < sorted.size(); i++){
      cout<<sorted[i]<<endl;
   }
       sorted.clear();

    }

   
    return 0;
}
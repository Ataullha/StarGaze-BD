from __future__ import division, print_function
# coding=utf-8
import sys
import os
import glob
import re
import numpy as np
import cv2
import json
import base64
# from flask_cors import CORS



# Keras
from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image


# Flask utils
from flask import Flask, redirect, url_for, request, render_template,jsonify
from werkzeug.utils import secure_filename
#from gevent.pywsgi import WSGIServer
import tensorflow as tf

app= Flask(__name__)
# cors = CORS(app)


dic_class={1:"Bangabandhu Sheikh Mujibur Rahman",0:"Ayman", 2:"Humayun Ahmed", 4:"Muhammad Zafar Iqbal", 7:"Shakib Al Hasan", 8:"Sheikh Hasina",
          6:"Shahidul Alam",5:"Runa Laila",3:"Jamilur Reza Chowdhury",9:"Wasfia Nazreen"}

MODEL_PATH = 'models/model.h5'

model=load_model(MODEL_PATH,compile=False)
print("..model loaded successfully.....")



@app.route('/hello')
def Hello():
    return "Hello"





@app.route("/classify_image",methods=['GET','POST'])
def classify_image():
    if request.method =='POST':
        f = request.form['file']
        encoded_data = f.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

       
        result=[]
        X = []
        scalled_raw_img = cv2.resize(img,(180,180))
        X.append(scalled_raw_img)
        X = np.array(X)
        X = X/255
        y = model.predict(X)
        z=np.argmax(y)
        if np.argmax(y)==0:
            print(dic_class[z])
        elif np.argmax(y)==1:
            print('Bangabandhu Sheikh Mujibur Rahman')
        elif np.argmax(y)==2:
            print('Humayun Ahmed')
        elif np.argmax(y)==3:
            print('Jamilur Reza Chowdhury')
        elif np.argmax(y)==4:
            print('Muhammad Zafar Iqbal')
        elif np.argmax(y)==5:
            print('Runa Laila')
        elif np.argmax(y)==6:
            print('Shahidul Alam')
        elif np.argmax(y)==7:
            print('Shakib Al Hasan')
        elif np.argmax(y)==8:
            print('Sheikh Hasina')
        elif np.argmax(y)==9:
            print('Wasfia Nazreen')
        
        result ={
            'class': dic_class[z],
            'class_probability': np.around(y*100,2).tolist()[0],
            'class dictionary':dic_class
        }
        result
        r=jsonify(result)
        r.headers.add('Access-Control-Allow-Origin','*')
        return r
        

    
    

    


if __name__ == "__main__":
    app.run(debug=True)
























if __name__=='__main__':
    print("Starting Python Flask Server For Sports Celebrity Image Classification")
    app.run(port=5000)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from fastapi import Request



import openai
from openai import OpenAI

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

import os
import re
import io
import base64

from typing import Dict, Any



app = FastAPI()


# Allow requests from all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


df = ''
# Global variables to store data
global_name = ['none']
global_py_code = []
global_analysis = "none"
global_plots = []

def get_completion(prompt, model="gpt-3.5-turbo"):
    messages = [{"role": "user", "content": prompt}]
    
    client = OpenAI(api_key='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')
 
    response = client.chat.completions.create(
      model=model,
      messages=messages
    )
    return response

def get_name (resp):
    prompt_forNames = f"""
I want you to extract the name's of Recommended visualization techniques mention in following text,
which is delimited by triple backticks.

Format your response as a list of names separated by commas.

text = : '''{resp}'''
"""
    name_response = get_completion(prompt_forNames)
    # print(name_response.choices[0].message.content)
    name_response = name_response.choices[0].message.content.split(',')
    return name_response

def get_code (resp):
    prompt_forCode = f"""
I want you to extract the python code for visualization techniques mention in following text,
which is delimited by triple backticks. There could be one or more then python code for
visualization techniques 

Format your response as a list of code
Each visualization technique's code should be on separated  ```python.


text = : '''{resp}'''
"""
    code_response = get_completion(prompt_forCode)
    # print(code_response.choices[0].message.content)

    code_response=code_response.choices[0].message.content.split('```python')
    code_response = [re.sub(r'`', '', c) for c in code_response]

    imports= []
    python_code=[]
    for i, code_block in enumerate(code_response):
            if len(code_block)>0:
                code_block = code_block + '''plot_buffer = io.BytesIO()\nplt.savefig(plot_buffer, format='png')\nplot_buffer.seek(0)\nplot_bytes = base64.b64encode(plot_buffer.getvalue()).decode()\nplot_images.append(plot_bytes)\nplt.close()'''
                imports = imports + re.findall(r"import .*?\n", code_block)
                for imp in imports:
                    code_block = code_block.replace(imp, '')
                python_code.append(code_block.replace('\n'.join(imports), ''))
        
    return python_code

def get_analysis (resp):
            
    prompt_forAnalysis = f"""
I want you to extract the Analysis mention in following text,
which is delimited by triple backticks. 

Format your response as simple text not formatimng, 


text = : '''{resp}'''
"""
    Analysis_response = get_completion(prompt_forAnalysis)
    # print(Analysis_response.choices[0].message.content)
    Analysis_response=Analysis_response.choices[0].message.content.replace('\n',' ')
    return Analysis_response

def run_python_code(code):
    plot_images= []
    for c in code:
        c=c.strip()
        # print(type(c))
        print(c)
        exec(c)
    return plot_images


def gpt_response (df):
    
    prompt = f"""
Your task is to assist a Data Analyst by suggesting suitable and insightful 
visualizations based on the uploaded data. Provide analysis relevant to the data, 
such as identifying trends, making forecasts, highlighting anomalies, correlation, etc.

Following are the 3 items should be always in your response 
1. Recomended viualizations, 
2. Pyhton code for each viualizations, 
3. overall analysis of data

Always folow this formate. Only replace the text present in [] square brackets with your answer 

1. '''visualizations [visualizations 1] ''' 
'''visualizations [visualizations 2] ''' 
'''visualizations [visualizations N] '''

2. '''python [visualizations 1 code] ''' 
'''python [visualizations 2 code] '''  
'''python [visualizations N code] '''

# make sure every think which is not python code 
is in coment form 
# saprate each python go by '''python 

3. '''Analysis: '''

df: ```{df}```

"""  

    result=get_completion(prompt)
    # print(result.choices[0].message.content)
    result = result.choices[0].message.content
    return result

async def perform_analysis(df):
    response =  gpt_response(df)
    
    global global_name, global_py_code, global_analysis
    global_name = get_name(response)
    global_py_code = get_code(response)
    global_analysis = get_analysis(response)
    
@app.get("/")
async def root():
    return "server runs by : python -m uvicorn main:app --reload" 


@app.post("/doanalysis")
async def doanalysis(csvdata, request: Request):
    # print("in api : ", csvdata) 
   
    x = await request.body()
    y=await request.json()
   
    # print(" request.body() : ", (x) )
    # print(" request.json() : ", type(y) )
    
    df= pd.DataFrame(y)
    # print(y)
    cols = df.columns

    for c in cols:
        # Convert string data to numerical values, ignoring non-convertible values
        df[c] = pd.to_numeric(df[c], errors='ignore')

    
    # response = gpt_response(df)
    # name = get_name (response)
    # py_code = get_code (response)
    # analysis = get_analysis (response)
    # # plots = run_python_code (py_code)
    await perform_analysis(df)
  
    return {"name": global_name, "analysis": global_analysis}


@app.get("/display")
async def display():
    try:
        global_plots = run_python_code(global_py_code)
        return {"name": global_name, "analysis": global_analysis, "plot": global_py_code, "plotbase64": global_plots}
    except Exception as e:
        print(f"An error occurred: {e}")
        return {"name": global_name, "analysis": global_analysis, "plot": global_py_code, "plotbase64": []}






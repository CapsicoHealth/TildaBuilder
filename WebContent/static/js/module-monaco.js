"use strict";

import {  } from "/static/jslibs/sceditor/sceditor.js";

//import * as monaco from "/static/jslibs/monaco-editor/vs/editor/editor.main.js";


let monacoinit = false;
let scinit = false;
let seditor = null;
let moneditor = null;

export function InitializeMonaco(tildaJson){
    let output = "hello";
    if (output == "html"){
      openEditor();
    }
    else {
      if (output == "hello"){
//        const container = document.getElementById("editor1");
//        container.style.height = (window.innerHeight - 100) + "px";
//        require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' }});
//        window.MonacoEnvironment = { getWorkerUrl: () => proxy };
//        
//        let proxy = URL.createObjectURL(new Blob([`
//            self.MonacoEnvironment = {
//                baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
//            };
//            importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');
//        `], { type: 'text/javascript' }));
        
      
        require(["vs/editor/editor.main"], function (monaco) {
            // Register the language
            monaco.languages.register({ id: 'json-with-html' });

            // Set the language configuration
            monaco.languages.setLanguageConfiguration('json-with-html', {
              brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')'],
                ['<', '>']
              ],
              autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '<', close: '>', notIn: ['string'] }
              ]
            });

            // Set the tokens provider
            monaco.languages.setMonarchTokensProvider('json-with-html', {
              tokenizer: {
                root: [
                  [/\{\{.*?\}\}/, 'variable'], // Handle Mustache-style templates
                  [/{/, 'delimiter.curly'],
                  [/\}/, 'delimiter.curly'],
                  [/\[/, 'delimiter.square'],
                  [/\]/, 'delimiter.square'],
                  [/\(/, 'delimiter.parenthesis'],
                  [/\)/, 'delimiter.parenthesis'],
                  [/<([a-zA-Z]+\d*)(?:\s+(?:(?:[a-zA-Z]+\d*)="[^"]*")*)?>/i, 'attribute.html'], // Handle HTML tags
                  [/"[^"]+":\s*(<[\w\W]*?>[\s\S]*?<\/[\w-]+>|<[\w\W]*?>[\s\S]*?$|\d+(\.\d+)?|\[|\{)/, 'attribute.value'],
                  [/"[^"]+":/, 'attribute.name'],
                  [/true|false/, 'keyword'],
                  [/null/, 'keyword'],
                  [/-?\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],
                  [/,/, 'delimiter'],
                  [/"[^"]+"/, 'string']
                ]
              }
            });


                      
            moneditor = monaco.editor.create(container, {
                value: tildaJson, 
                // language for editor
                language: "json-with-html"
            });
            
            console.log("here")
            initializeEditor(moneditor);
            
          

        });
        monacoinit = true;
      }

    }

  }




  function openEditor(sourceHtml,startPos,endPos,position) {
    if (!scinit){
      var myTextarea = document.getElementById('editor-container');
      // var sourceHtml = 'This is an incoming <B><U>test</U></B>!!!';
      myTextarea.value = sourceHtml;
      myTextarea.style.position = 'absolute';
      myTextarea.style.width = '800px';
      myTextarea.style.height = '400px';
      myTextarea.style.display = 'block';
      
      seditor = sceditor.create(myTextarea, {
        format: 'html', // Set the editor format to HTML
        // Other configuration options go here
      });
      scinit = true;
      var editor = sceditor.instance(myTextarea);
      var saveButton = document.getElementById('save-button');
      var func = function() {
        var htmlContent = editor.val();
        console.log("Html content from editor" + htmlContent);
        // htmlContent = removeEmptyTags(htmlContent);
        if (moneditor != null){
          const edits = [{
            range: new monaco.Range(position.lineNumber, startPos + 1, position.lineNumber, endPos + 1),
            text: htmlContent,
          }];
          const model = moneditor.getModel();
          model.pushEditOperations([], edits, null);
          scinit = false;
          sceditor.instance(myTextarea).destroy();
          saveButton.removeEventListener('click', func); 
        }
      };
      saveButton.addEventListener('click', func );
      
    }

    
  }
  
  function removeEmptyTags(htmlString) {
    const pattern = /<([a-z][a-z0-9]*)\b[^>]*>([\s]*)<\/\1>/gi;
    return htmlString.replace(pattern, '');
  }
  
  function updateObject(obj, oldVal, newVal) {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        updateObject(obj[key], oldVal, newVal);
      } else if (obj[key] === oldVal) {
        obj[key] = newVal;
      }
    }
  }

  function getPathFromObject(obj, key, parentKeys = []) {
    for (const prop in obj) {
      const propValue = obj[prop];
      if (prop === key) {
        return [...parentKeys, prop].join(".");
      }
      if (typeof propValue === "object") {
        if (Array.isArray(propValue)) {
          for (let i = 0; i < propValue.length; i++) {
            const result = getPathFromObject(
              propValue[i],
              key,
              [...parentKeys, `${prop}[${i}]`]
            );
            if (result !== "") {
              return result;
            }
          }
        } else {
          const result = getPathFromObject(
            propValue,
            key,
            [...parentKeys, prop]
          );
          if (result !== "") {
            return result;
          }
        }
      }
    }
    return "";
  }



  function initializeEditor(moneditor) {
    
    
    moneditor.onMouseDown(async (e) => {
      const position = e.target.position;
      const range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
      const selectedText = moneditor.getModel().getValueInRange(range);
    
      try {
        const model = moneditor.getModel();
        const wordInfo = model.getWordUntilPosition(position);
        const key = wordInfo.word;
    
        const lineContent = model.getLineContent(position.lineNumber);
        
    
        if (lineContent.includes('"description":')){
          
          const match = /"description"\s*:\s*"([^"]*)"/.exec(lineContent);
          const startPosition = match.index + match[0].indexOf(match[1]);
          const endPosition = startPosition + match[1].length;
          const html = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: startPosition + 1, endLineNumber: position.lineNumber, endColumn: endPosition + 1 });
          console.log("HTML value: " + html);
          openEditor(html,startPosition,endPosition,position);
        }
      } catch (error) {
        console.error(error);
      }
    });
    monaco.languages.registerHoverProvider("json-with-html", {
      provideHover: function (model, position) {
        const wordInfo = model.getWordUntilPosition(position);
        const key = wordInfo.word;
    
        const jsonString = model.getValue();
        let jsonObject;
        try {
          jsonObject = JSON.parse(jsonString);
        } catch (error) {
          // If there's an error parsing the JSON, use an empty object
          // to continue searching for the path up until the error position
          if (error instanceof SyntaxError) {
            const errorPosition = error.message.match(/\d+/g)[0];
            const jsonStringBeforeError = jsonString.slice(0, errorPosition);
            jsonObject = JSON.parse(jsonStringBeforeError + "{}");
          } else {
            throw error;
          }
        }
    
        const lineContent = model.getLineContent(position.lineNumber);
        const val = lineContent.substring(lineContent.indexOf(':') + 1).trim();
        const value = val.replace(/["',]/g, '');
    
        let matches = [];
    
        function searchForObject(obj, parentPath = "", lineNumber) {
          for (const [prop, value] of Object.entries(obj)) {
            let path;
            if (Array.isArray(obj)) {
              path = parentPath ? `${parentPath}[${prop}]` : `[${prop}]`;
            } else {
              path = parentPath ? `${parentPath}.${prop}` : prop;
            }
            if (path.includes(key)) {
              matches.push({ path, value, lineNumber });
            }
            if (typeof value === "object" && value !== null) {
              searchForObject(value, path, lineNumber);
            }
          }
        }
    
        searchForObject(jsonObject, "", position.lineNumber);
    
        let matchedPaths = matches
          .filter((match) => match.value == value && match.lineNumber == position.lineNumber)
          .map((match) => match.path);
    
        if (matchedPaths.length > 0) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              wordInfo.startColumn,
              position.lineNumber,
              wordInfo.endColumn
            ),
            contents: matchedPaths.map((path) => ({ value: path })),
          };
        } else {
          return null;
        }
      },
    }); 

  }
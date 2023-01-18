"use strict";

define(["floria/superdom", "floria/collections", "floria/date", "floria/controls", "floria/textutil"], function(SuperDOM, FloriaCollections, FloriaDate, FloriaControls, FloriaText) {

var x = function FormRenderer(formDef, formLayout, formHelper, elementId)
 {
   if (formDef == null)
     SuperDOM.alertThrow("The formRenderer parameter 'formDef' is null or undefined.");
   if (formLayout == null)
     SuperDOM.alertThrow("The formRenderer parameter 'formLayout' is null or undefined.");
   if (formHelper == null)
     SuperDOM.alertThrow("The formRenderer parameter 'formHelper' is null or undefined.");
   if (elementId == null)
     SuperDOM.alertThrow("The formRenderer parameter 'elementId' is null or undefined.");
   
   this.formDef    = formDef   ;
   this.formLayout = formLayout;
   this.formHelper = formHelper;
   this.elementId  = elementId ;
   this.formData   = null;
   this.formState  = null;
   window["FLORIAFORM_"+this.elementId]=this;

   this._check = function()
    {
       if (document.getElementById(this.elementId) == null)
         SuperDOM.alertThrow("Cannot instanciate the form because the DIV '"+this.elementId+"' cannot be found in the DOM.")
       for (var i = 0; i < formDef.enums.length; ++i)
        {
          var e = formDef.enums[i];
           if (e == null)
           continue;
          var n = e.name;
          if (this.isElementTypeBasic(n) == true)
            SuperDOM.alertThrow("The form '"+formDef.name+"' defines an enum '"+n+"' using a reserved type name.");
             
          for (var j = i+1; j < formDef.enums.length; ++j)
           if (n == formDef.enums[j].name)
             SuperDOM.alertThrow("The form '"+formDef.name+"' defines a duplicate enum '"+n+"'.");
        }
       
       for (var i = 0; i < formDef.fields.length; ++i)
        {
          var f = formDef.fields[i];
          if (f == null)
           continue;
          var t = this.getElementType(f);
          var n = f.name;
          if (t == null)
            SuperDOM.alertThrow("The form '"+formDef.name+"' defines a field '"+n+"' of type '"+f.type+"' which is invalid.");
          for (var j = i+1; j < formDef.fields.length; ++j)
           if (n == formDef.fields[j].name)
             SuperDOM.alertThrow("The form '"+formDef.name+"' defines a duplicate field '"+n+"'.");
        }
      
       for (var i = 0; i < formLayout.length; ++i)
        {
          var f = formLayout[i];
          if (f == null)
            continue;
          if (f.name == "Submit")
            SuperDOM.alertThrow("The name 'Submit' is reserved. A layout cannot be named as such.");
          for (var j = i+1; j < formLayout.length; ++j)
           if (f.name == formLayout[j].name)
             SuperDOM.alertThrow("The layout '"+f.name+"' is defined more than once.");
          if (f.sameLayoutAs != null)
            {
              if (f.layoutTransfered != true) // i.e., == null || == false
               {
                 if (f.layout != null)
                   SuperDOM.alertThrow("The layout '"+f.name+"' defines both a layout and a sameLayoutAs: only one can be defined.");
                 for (var j = 0; j < i; ++j)
                  if (formLayout[j].name == f.sameLayoutAs)
                   {
                     f.layout = formLayout[j].layout;
                     if (f.layout == null)
                       SuperDOM.alertThrow("The layout '"+f.name+"' is defining a sameLayoutAs to layout '"+f.sameLayoutAs+"' which doesn't define its own layout explicitly.");
                     f.layoutTransfered = true;
                   }
               }
            }
          else if (f.layout == null)
            SuperDOM.alertThrow("The layout '"+f.name+"' is not defining a layout nor a sameLayoutAs: one must be defined.");
        }
    }

   this.start = function(formData, formState)
    {
      this.formData     = formData  != null ? formData : { };
      this.formState    = formState != null ? formState: { stack:[0], current: 0 };
      this.formState.current=0;
      if (this.formDef.migrate != null)
       this.formDef.migrate(this.formData, this.formState);
      this.render();
    };
   this.render = function()
    {
      this.formHelper.cleanup();

      document.getElementById(this.elementId).classList.remove("FormPrinted");
      if (this.getCurrentState() == -1)
       {
         var Str ='<DIV id="'+this.elementId+'_HEADER" class="formHeader">'+this.renderHeader(null)+'</DIV>\n'
                 +'<DIV id="'+this.elementId+'_BODY" class="formBody">\n'
                 +   '<BR><BR>The form has been completed<BR><BR>'
                 +'</DIV>'
                 ;
         SuperDOM.setInnerHTML(this.elementId, Str);
         FloriaControls.Dropdown.set(this.elementId+"_NAV", 0);         
         return;
       }
      
      var l = this.getCurrentLayout();

      var Str ='<DIV id="'+this.elementId+'_HEADER" class="formHeader">'+this.renderHeader(l)+'</DIV>\n'
              +'<DIV id="'+this.elementId+'_BODY" class="formBody">\n'
              + '<DIV class="columnx">\n'
              +  '<FORM id="'+this.elementId+'_F" onSubmit="return false;">\n'
              +   '<DIV class="tileLayout">\n'
              ;
      for (var i = 0; i < l.layout.length; ++i)
       {
         var r = l.layout[i];
         Str+='<DIV class="tileLayoutRow">\n';
         for (var j = 0; j < r.length; ++j)
          {
            var c = r[j];
            Str+='<DIV class="tileLayoutCell2 w'+r.length+'">';
            if (typeof c == "string" || c instanceof String)
             Str+=this.renderElement(this.getFormElement(c));
            else
             Str+=this.renderElementGroup(c);
            Str+='</DIV>\n';
          }
         Str+='</DIV>\n';
       }
      Str+='</DIV></FORM><BR clear="all"><BR><BR><BR></DIV></DIV>\n'
          +'<DIV id="'+this.elementId+'_FOOTER" class="formFooter">\n'
          + '<TABLE class="formBanner" border="0px" cellspacing="0px" cellpadding="0px" width="100%"><TR><TD align="right" width="25%">';
      if (this.formState.current > 0)
       {
         var prevLayout = this.formLayout[this.formState.stack[this.formState.current-1]];
         Str+='<BUTTON onClick="FLORIAFORM_'+this.elementId+'.back()">Back&nbsp;&nbsp;-&nbsp;&nbsp;'+prevLayout.name+'</BUTTON>';
       }
      Str+='&nbsp;&nbsp;&nbsp;&nbsp;</TD><TD align="left" width="25%">&nbsp;&nbsp;&nbsp;&nbsp;';
      if (l.next == null)
       Str+='<BUTTON onClick="FLORIAFORM_'+this.elementId+'.submit();">Submit</BUTTON>';
      else if (this.formState.current != this.formState.stack.length-1)
       {
         var nextLayout = this.formState.stack[this.formState.current+1];
         var layoutName = nextLayout==-1 ? "Submit" : (nextLayout == null || nextLayout>=this.formLayout.length) ? this.formLayout[0].name : this.formLayout[nextLayout].name;
         Str+='<BUTTON onClick="FLORIAFORM_'+this.elementId+'.'+(nextLayout==-1?"submit()":"next("+nextLayout+")")+'">Next&nbsp;&nbsp;-&nbsp;&nbsp;'+layoutName+'</BUTTON>';
       }
      Str+='</TD><TD align="center" width="50%">&nbsp;';
      if (l.next != null && l.next.length != 0)
       {
         var nextLayout = this.formState.stack[this.formState.current+1];
         var first = true;
         for (var i = 0; i < l.next.length; ++i)
          {
            var n = l.next[i];
            var f = n == "Submit" ? -1 : this.formLayout.indexOfSE(n, "name", "Cannot locate layout section '"+n+"'.");
            if (f != nextLayout)
             {
               if (first == true)
                {
                  first = false;
                  Str+='<SPAN></SPAN><B>'+(nextLayout==null?"Next":"Other (reroute the form) next ")+' options: </B>';
                }
               Str+='&nbsp;&nbsp;&nbsp;<BUTTON onClick="FLORIAFORM_'+this.elementId+'.'+(f==null || f==-1 ?'submit()':'next('+f+')')+';">'+n+'</BUTTON>&nbsp;&nbsp;&nbsp;';
             }
          }
       }
      Str+='</TD></TR></TABLE></DIV>';
      SuperDOM.setInnerHTML(this.elementId, Str);
      if (this.formHelper.onRenderSuccess)
       this.formHelper.onRenderSuccess();
    };
   
   this.renderHeader = function(l)
    {
      var Str='<DIV class="formBanner">'
             +'<SPAN>'+(this.formData.Information != null && FloriaText.TextUtil.isNullOrEmpty(this.formData.Information.ptName) == false ? this.formData.Information.ptName+' - ' : '')
                      +(l==null?"Completed":l.name)+'</SPAN>'
             +'<SPAN>'+this.formDef.name+' (version '+this.formDef.version+')</SPAN><SPAN>'
             ;
      var Steps = [[0,""]];
      var currentIndex = -1;
      for (var i = 0; i < this.formState.stack.length; ++i)
       {
         var index = this.formState.stack[i];
         if (index == -1)
          continue;
         var step = this.formLayout[index];
         if (l != null && step.name == l.name)
          currentIndex = index;
         Steps.push([index, step.name]);
       }
      Str+=FloriaControls.Dropdown.gen(null, this.elementId+"_NAV", Steps, false, "FLORIAFORM_"+this.elementId+".jump(Dropdown.get('"+this.elementId+"_NAV'));", currentIndex);

      Str+='</SPAN>'
          +'</DIV>';
      return Str;
    };

   this.jump = function(stateIndex)
    {
      this.process(true);
      this.formState.current = stateIndex;
      this.render();
    };
   this.next = function(state)
    {
      this.process();
      if (this.formState.current == this.formState.stack.length-1) // adding a new state
       {
         this.formState.stack.push(state);
         ++this.formState.current;
       }
      else if (state == this.formState.stack[this.formState.current+1]) // moving forward already existing next state
       {
         ++this.formState.current;
       }
      else // rerouting to a next state different from pre-existing one
       {
         while (this.formState.stack.length > this.formState.current+1)
          this.formState.stack.pop();
         this.formState.stack.push(state);
         ++this.formState.current;
       }
      this.render();
    };
   this.back = function()
    {
      this.process(true);
      --this.formState.current;
      this.render();
    };
   this.submit = function()
    {
      this.process();
      this.formState.stack.push(-1);
      ++this.formState.current;
      this.render();
      this.formHelper.submit(this.formData, this.formState);
    };
//   this.save = function()
//    {
//      this.process(true);
//      this.formHelper.save();
//    };   
   this.getFormElement = function(name)
    {
      return this.formDef.fields.getSE(name, "name", "The field '"+name+"' canot be found in form '"+this.formDef.name+"'.");
    };

   this.getCurrentLayout = function()
    {
      return this.formLayout[this.getCurrentState()];
    };
   this.getCurrentState = function()
    {
      return this.formState.stack[this.formState.current];
    };
    
   this.isElementTypeBasic=function(type)
    {
      return type=="text" || type=="paragraph" || type=="datetime" || type=="date" || type=="datetimeFuture" || type=="dateFuture" || type=="time" || type=="int" || type=="number" || type=="checkbox" || type=="password" || type=="email" || type=="tel" || type=="url" || type=="rating"
    };
   this.getElementType = function(e)
    {
      if (this.isElementTypeBasic(e.type) == true)
       return e.type;
      return this.formDef.enums.getSE(e.type, "name", "Canot locate enum '"+e.type+"' in form '"+this.formDef.name+"'.")
    };

  this.renderElementGroup = function(g)
    {
      var Str='';
      if (g.label != null)
        Str += '<BR><fieldset><legend class="FormSectionHeader">'+g.label+'</legend>';
      if (g.fields.length == 1)
        {
          var f = g.fields[0];
          var e = this.getFormElement(f[1]);
          if (e.questions != null)
           Str+=this.renderQuestions(e, f[0]);
          else
           Str += this.renderElement(e, f[0]);
        }
      else if (g.fields.length > 1)
        {
          Str += '<TABLE border="0" class="tableLayout doubleSpace" width="99%">';
          var wideQuestions = false;
          for (var x = 0; x < g.fields.length; ++x)
           if (g.fields[x][0].length > 80)
            wideQuestions = true;
          for (var x = 0; x < g.fields.length; ++x)
            {
              var f = g.fields[x];
              var e = this.getFormElement(f[1]);
              if (e.questions != null)
               Str+=this.renderQuestions(e, f[0]);
              else
               {
                 var t = this.getElementType(e);
                 if (wideQuestions == true)
                  Str += '<TR valign="top""><TD style="white-space: normal;"><BR><B>' + f[0] + '</B><BR>' + this.renderInput(e.name, t, e.multi, null, f[2] == true) + '</TD></TR>\n';
                 else
                  Str += '<TR valign="top"><TD class="fieldName">' + f[0] + '</TD><TD align="left">' + this.renderInput(e.name, t, e.multi, null, f[2] == true) + '</TD></TR>\n';
               }
            }
          Str += '</TABLE>\n';
        }
      else 
        Str+='&nbsp;';
      if (g.label != null)
        Str += '</fieldset>\n';
      return Str;
    };

  this.renderElement = function(e, label)
    {
      var t = this.getElementType(e);
      return '<TABLE border="0" class="tableLayout doubleSpace" width="99%">'
            +  '<TR valign="top"><TD class="fieldName">'+(label==null?'&nbsp;':label)+ '</TD>'
            +                   '<TD>' + this.renderInput(e.name, t, e.multi)+'</TD>'
            +  '</TR>'
            +'</TABLE>';
    };

   this.renderQuestions = function(e, label)
    {
      var t = this.getElementType(e);
      var Str = '<SPAN class="FormSectionHeader"><BR>' + label + '</SPAN>'
              + '<TABLE class="tableLayout doubleSpace" border="0">'
              + '<TR><TD>&nbsp;</TD>' + FloriaControls.Radio.header(this.makeOptions(t.values), '<TD align="center">', '</TD>'); + '</TR>';
      
      for (var i = 0; i < e.questions.length; ++i)
        {
          var q = e.questions[i];
          Str += '<TR valign="top"><TD class="fieldName">' + q.label + '</TD>' + this.renderInput(q.name, t, e.multi, true) + '</TR>\n'
        }
      return Str + '</TABLE>\n';
    };

   this.renderInput = function(name, type, multi, group, forceMultiLine)
    {
      var l = this.getCurrentLayout();
      var d = this.formData[l.name];
      if (this.isElementTypeBasic(type) == true)
       {
         var v = d == null || d[name] == null ? '' : d[name];
         if (type=="date" || type=="datetime" || type=="dateFuture" || type=="datetimeFuture")
          return this.formHelper.doDateField(name, type, v);

         return type=="paragraph" ? '<TEXTAREA rows="10" name="'+name+'" style="width:99%;">'+(v==null?'':v)+'</TEXTAREA>'
              : type=="int"       ? '<INPUT type="number" min="0" step="1" name="'+name+'" value="'+(v==null?'':v.printHtmlAttrValue())+'">'
              : type=="number"    ? '<INPUT type="number" min="0" step="0.1" name="'+name+'" value="'+(v==null?'':v.printHtmlAttrValue())+'">'
              : type=="checkbox"  ? '<INPUT type="checkbox" name="'+name+'" value="1" '+(v=="1"?"checked":"")+'>'
              : type=="rating"    ? Rating.gen(null, name, "from lowest to highest", 10, null, v)
                                  : '<INPUT type="'+type+'" name="'+name+'" style="width:99%;" value="'+(v==null?'':v.printHtmlAttrValue())+'">'
                                  ;
       }
      var v = d == null || d[name] == null ? [] : d[name];
      var a = this.makeOptions(type.values);
      var totalWidth = 0;
      for (var i = 0; i < a.length; ++i)
       totalWidth+=a[i][1].length;
      var beforeSeparator = forceMultiLine == true || totalWidth > 120 ? '<BR>' : '';
      var endSeparator = forceMultiLine == true || totalWidth > 120 ? '<BR>' : '';
      
      var edgeFunc = function(i, before) { return before==true ? (group==true?'<TD align="center">':(i==0?'':beforeSeparator)) : group==true?'</TD>':endSeparator;}
      return  multi =="ranking"? FloriaControls.Ranking.gen(null, name, a, null, v)
            : multi == true  ? FloriaControls.Checkbox.gen(null, name, a, edgeFunc, null, v, group)
                             : FloriaControls.Radio   .gen(null, name, a, edgeFunc, null, v, null, group);
    };

   this.makeOptions = function(values)
    {
      var a = [];
      for (var i = 0; i < values.length; ++i)
        {
          var v = values[i];
          a.push([ v.value, v.label, v.label ]);
      }
      return a;
    }
   
   this.process=function(noValidation)
    {
      if (this.getCurrentState() == -1)
       return;
      var l = this.getCurrentLayout();
      var d = this.formData[l.name];
      if (d == null)
       d = this.formData[l.name] = { };
      var form = document.getElementById(this.elementId+'_F');
      var errors = [];
      for (var i = 0; i < l.layout.length > 0; ++i)
        {
          var layout = l.layout[i];
          for (var j = 0; j < layout.length; ++j)
            {
              var g = layout[j];
              for (var x = 0; x < g.fields.length; ++x)
               {
                  var f = g.fields[x];
                  var e = this.getFormElement(f[1]);
                  if (e.questions != null)
                   for (var q = 0; q < e.questions.length; ++q)
                    {
                      var question = e.questions[q];
                      this.processElement(form, question.name, question.label, "question", e, d, noValidation, errors)
                    }
                  else
                   this.processElement(form, e.name, f[0], "field", e, d, noValidation, errors)
               }
            }
        }
//      this.formHelper.submit(this.formData, null);
      
      if (errors.length!= 0)
       {
         var Str = errors.length+' error'+(errors.length==1?' was':'s were')+' found:\n';
         for (var i = 0; i < errors.length; ++i)
          Str+='    - '+errors[i]+'\n';
         SuperDOM.alertThrow(Str);
       }
      
    };
   
   this.processElement=function(form, name, label, what, formElement, d, noValidation, errors)
    {
      var t = this.getElementType(formElement);
      if (formElement.multi == true)
        {
          if (t.values != null)
           {
              var answers = [];
              for (var y = 0; y < t.values.length; ++y)
                {
                  var v = t.values[y];
                  var elem = SuperDOM.getElement(form[name+v.value], "System error: cannot find form field '"+name+v.value+"'.");
                  if (y == 0)
                   elem.parentNode.parentNode.parentNode.classList.remove("ErrorMessage");
                  if (elem.value == 1)
                   answers.push(v.value);
              }
              if (noValidation != true && formElement.mandatory == true && answers.length == 0)
               {
                 var parentNode = SuperDOM.getElement(form[name+v.value], "Cannot find form field '"+name+t.values[0].value+"'.").parentNode.parentNode.parentNode;
                 parentNode.classList.add("ErrorMessage");
                 errors.push("The mandatory "+what+" '"+label+"' must have at least one option checked");
               }
              return d[name] = answers;
           }
        }
      else
        {
          var elem = SuperDOM.getElement(form[name], "System error: cannot find form field '"+name+"'.");
          elem.parentNode.parentNode.classList.remove("ErrorMessage");
          var v = t=="checkbox" ? (elem.checked==true?elem.value:"") : elem.value;
          if (noValidation != true && formElement.mandatory == true && FloriaText.TextUtil.isNullOrEmpty(v) == true)
           {
             elem.parentNode.parentNode.classList.add("ErrorMessage");
             errors.push("The mandatory "+what+" '"+label+"' is empty!");
           }
          return d[name] = v;
        }
    };

   this._check();

 };

 return x;
});

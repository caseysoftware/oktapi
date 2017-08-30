/*
TemplateControl is used with ajax-form and datatable, to help persist and create inputs from a template

Template is in the form of
<label><input,select,etc name="key"/> </label> <label...

In order for this to work, name must be specified.

 */
saasure.Behavior.TemplateControl = function(){
    var self = this;
    var templateRoot;

    var instances={};

    var inputSelector="input,select,textarea";

    function init(templateRootArg){
        templateRoot=templateRootArg;

    }

   function getInstance(formName,qualifier,defaultValues,initFunc,fieldInitFunc,arg){
       var key=formName+":"+qualifier;
        if (instances[key] ==undefined){
            instances[key]=createInstance(formName,qualifier,defaultValues,fieldInitFunc,arg);
            if (initFunc){
                initFunc(instances[key]);
            }
        }
       return instances[key];
   }

    function createInstance(formName,qualifier,defaultValues,fieldInitFunc,arg){
        var clonedTemplateRoot= templateRoot.clone();

        var inputs=clonedTemplateRoot.find(inputSelector);
        
        for (var i=0;i<inputs.length;i++){
            var el=inputs[i];
            var rawName=el.name;
            if (rawName == null || rawName.length==0){
                return;
            }

            var elm=$(el);


            if (fieldInitFunc && fieldInitFunc(elm)){
                elm.parent().detach();
                return;
            }

            var name=qualifier+rawName;
            var id=formName+"."+name;

            el.name=name;
            el.id=id;

             
            var label=elm.parent();
            label[0].id=id+".label";/*
            label[0].setAttribute("for",name);
*/
             var defaultValue=defaultValues?defaultValues[rawName]:null;
             if (defaultValue){
                 if (el.nodeName.toLowerCase()=="input" && el.type=="checkbox"){
                     elm.prop("checked",defaultValue);
                 }else if (el.nodeName.toLowerCase()=="select"){
                     elm.val(defaultValue);
                 }else{
                    el.value=defaultValue;
                 }
             }

             if (arg){
                 if (arg.disabled){
                     elm.prop("disabled",true);
                 }
             }
          };

        return clonedTemplateRoot;
    }

    /*
     * Public functions
     */
    this.init=init;
    this.getInstance=getInstance;
};

saasure.Behavior.FormTemplateControl = function(){

    var self=this;
    var templateControl=new saasure.Behavior.TemplateControl();
    var inputElmMap={};
    var qualifierFunc;
    var formName;
    var inputSelector="input,select,textarea";

    function init(formNameArg,templateRootArg,qualifierFuncArg){
        templateControl.init(templateRootArg);
        qualifierFunc=qualifierFuncArg;
        formName=formNameArg;
    }

    function getInstance(id,defaultValues,initFunc,fieldInitFunc,arg){
        var qualifier=qualifierFunc(id);
        var result=$(templateControl.getInstance(formName,qualifier,defaultValues,initFunc,fieldInitFunc,arg));
        inputElmMap[id]=result;
        return result;
    }

    function toFlatJson(id,row,keyFunc,includeDisabled){
        var elms=inputElmMap[id].find(inputSelector);
        var clonedElms=elms;

        if (includeDisabled){
            //jquery's serializeArray doesn't serialize disabled controls and they don't offer an option to do so...
            clonedElms=elms.clone(); //also, clone doesn't copy selected value... http://bugs.jquery.com/ticket/8340
            $.each(clonedElms,function(idx,elm){
                var name=elm.name;
                if (name == null || name.length==0){
                    return;
                }

                $(elm).removeAttr("disabled");
                var id=elm.id;
                var val=elms.filter("#"+$.escapeId(id)).val();
                $(elm).val(val);
            });
        }
        var serialized=clonedElms.serializeArray();
        addInputData(id,row,keyFunc,serialized);
        return serialized;
    }

    function addInputData(id,row,keyFunc,entries){
        $.each(entries,function(idx,entry){
            var key=keyFunc(id,entry.name);
            if (row[key]) {
                if (row[key].push==undefined){
                    row[key]=[row[key]];
                }
                row[key].push(entry.value);
            }else{
                row[key]=entry.value;
            }
        });
    }

    this.init=init;
    this.getInstance=getInstance;
    this.toFlatJson=toFlatJson;

    this.toFlatJson.RemoveFormQualifierFunc=function(id,val){
        var qualifier=qualifierFunc(id);
        return val.substring(val.indexOf(qualifier)+qualifier.length);
    }

};
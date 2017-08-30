var RemoveColumn=function(){
    var lookup={};
    var toRemove={};
    var instanceId;
    this.init=function(instanceIdArg){
        instanceId=instanceIdArg;
    };
    this.toFlatJson=function(key,row){
        var remove=toRemove[key]?true:false;

        row.remove=remove;
    };

    this.formatter=function(obj, tr, td, index){
        var key=obj.user.id;
        var elm=lookup[key];
        if (!elm) {
            elm=$("<div class='add-remove-toggle-wrap'><a id='"+instanceId+"-"+obj.user.id+"-remove' class='add-remove-toggle icon icon-16 remove-16' title='Remove this assignment'></a></div>");
            elm.click(function(){
                var text;
                if (toRemove[key]){
                    delete toRemove[key];
                    elm.find(".add-remove-toggle").removeClass("add-16").addClass("remove-16").attr("title", "Remove this assignment").next(".remove-explain").hide().parents("tr").removeClass("removed").addClass("added");
                }else{
                    toRemove[key]=true;
                    elm.find(".add-remove-toggle").removeClass("remove-16").addClass("add-16").attr("title",  "Include this assignment").next(".remove-explain").show().parents("tr").removeClass("added").addClass("removed");
                }
            });
            elm.append("<span class='remove-explain infobox infobox-compact infobox-error error-text rounded-btm-right-4' style='display:none;'>"+obj.user.fullName+" removed</span>");
            lookup[key]=elm;
        }
        $(td).html("");
        $(td).addClass("check-col").append(elm);
    };

    this.headerCallback=function(nHead, aasData, iStart, iEnd, aiDisplay){
        var th=$(nHead.getElementsByTagName('th')[0]);
        var elm=$("<div class='add-remove-toggle-all-wrap'><a class='add-remove-all-toggle icon icon-16 remove-16' title='Remove all remaining assignments'></a></div>");
        elm.click(function(){
            var elmToggle = elm.find(".add-remove-all-toggle");
            if (elmToggle.hasClass("remove-16")){
                elmToggle.removeClass("remove-16").addClass("add-16").attr("title", "Include all assignments").parents("table.data-grid").find(".remove-16").removeClass("remove-16").addClass("add-16").click();
            }else{
                elmToggle.removeClass("add-16").addClass("remove-16").attr("title", "Remove all remaining assignments").parents("table.data-grid").find(".add-16").removeClass("add-16").addClass("remove-16").click();
            }
        });
        th.addClass("check-col-hdr").html("");
        th.append(elm);
    };



    function formatRowToggleControl(){

    }
};

var AppInstanceEntry=function(){
    var self=this;
    var instance;
    var dtable;
    var dtableOpt;
    var rootElm;

    var defaultUserData; //{userid:{userName:"a@a.com" ... } ... }

    var personalTemplateControl=new saasure.Behavior.FormTemplateControl();
    var groupTemplateControl=new saasure.Behavior.FormTemplateControl();

    var bulkId="bulkControl";
    var readonlyMode=false;

    var removeColumn=new RemoveColumn();

    var inited=false;

    var settings;

    function tableDrawComplete(){
        if (dtable && dtable.fnGetData().length) {
            AjaxForm.initFormControl("bulk",rootElm);
        }
    }

    function formatUserEntry(obj, tr, td, index){
        var templateControls=personalTemplateControl.getInstance(obj.user.id,defaultUserData[obj.user.id],function(root){
            //init function
            var prefilledData =getPrefilledData(obj.user.id);
            if (!prefilledData) return;

            if (prefilledData.failed) {
                var errorMsg=$("<p class='api-error infobox infobox-compact infobox-error'><span class='icon error-16'></span>"+prefilledData.errorText+"</p>");
                root.prepend(errorMsg);
            }
        },null,null);

        td.innerHTML="";

        for (var i=0;i<templateControls.length;i++){
            td.appendChild(templateControls[i]);
        }
    }

    function getOpt(){
        /* Apply custom classes to table headers */
        $.fn.dataTableExt.oJUIClasses.sSortAsc = "sorted_asc";
        $.fn.dataTableExt.oJUIClasses.sSortDesc = "sorted_desc";

        var rawOpt={
            clientSide:true,
            fnHeaderCallback: removeColumn.headerCallback,
            bPaginate:false,
            sPaginationType	: 'full_numbers',
            iDisplayLength	: 50,
            //"aaSorting": [[ 2, 'asc' ]],
            aaSorting:[],
            aoColumns: [
                { sName: "remove", bVisible: true, bSortable: false, sClass: "remove-column"},
                { sName: "user.id", bVisible: false },
                { sName: "user.fullName", sTitle: "Person", sWidth: "35%", bSortable: true},
                { sName: "user.entry", sTitle: "User specific fields", sWidth: "65%"}
            ],
            fnDrawCallback: function() {
                tableDrawComplete();
            },
            bJQueryUI	 : true,
            bAutoWidth: false,
            aFormatters: {
                "remove" : removeColumn.formatter,
                "user.entry" : formatUserEntry
            }
        };

        if (!readonlyMode){
            rawOpt.aoColumns.shift(); //remove first element
            delete rawOpt.aFormatters.remove;
            delete rawOpt.fnHeaderCallback;
        }

        return (new saasure.DataTables()).serverSide(rawOpt);
    }

    this.init=function(instanceArg,settingsArg){
        settings=settingsArg;

        if (inited) {
            return;
        }else{
            inited=true;
        }

        if (settings.appUserData) {
            readonlyMode=true;
        }
        instance=instanceArg;
        removeColumn.init(instance.id);

        var opt=getOpt();
        dtableOpt=opt;

        rootElm=$("#edit-"+instance.id);

        var personalTemplateElm=$("#personal-template-"+instance.id);
        var groupTemplateElm=$("#group-template-"+instance.id);

        var cachedString="assignments["+instance.id+"][";
        personalTemplateControl.init("bulk",personalTemplateElm,function(id){
            return cachedString+id+"].";
        });
        groupTemplateControl.init("bulk",groupTemplateElm,function(id){
            return cachedString+id+"].";
        });

        var bulkDefaults;
        //grab the first appUserData that is from this instance, they should be all the same
        if (settings.appUserData) {
            for (var key in settings.appUserData){
                var val=settings.appUserData[key];
                var search=instance.id+".";
                if (key.substring(0,search.length)===search){
                    bulkDefaults=val.fields;
                    break;
                }
            }
        }
        var bulkControl = groupTemplateControl.getInstance(bulkId,bulkDefaults,null,null,null);
        $("#bulk-control-"+instance.id).append(bulkControl);
        var bulkInfo=$("#bulk-control-info-"+instance.id);

        if (!groupTemplateElm.find("label").length) {
            // no group properties exist
            bulkInfo.fastShow(false);
        } else {
            // at least one group property exists
            bulkInfo.fastShow();
        }

        var datatableWidget = new saasure.Widget.Datatable();
        dtable = datatableWidget.create($("#table-"+instance.id), opt,$("#datatable-search-box-"+instance.id));
    };

    function convertToAaData(users){
        var result=[];
        for (var userId in users){
            var data=users[userId];
            var row;

            if (settings.appUserData) {
                var prefilledData = getPrefilledData(userId);
                if (prefilledData && prefilledData.failed ) {
                    //in review mode, we only show errored users
                }else{
                    continue;
                }
            }

            row=["",data.user.id,data.user.fullName,""];
            if (!readonlyMode){
                row.shift();//remove first element
            }

            result.push(row);
        };
        return result;
    }

    function getPrefilledData(userId,userDefaults){
        if (settings.appUserData){
            return settings.appUserData[instance.id+"."+userId];
        }else if (userDefaults){
            var data=userDefaults[instance.id][userId];

            var result={fields:data};
            if (data.userName){
                result.userName=data.userName;
            }

            return result;
        }
    }

    function buildDefaultUserData(users,excludeUserName,userDefaults){
        var result={};
        for (var userId in users){
            var data=users[userId];
            var row=excludeUserName?{}:{userName:data.user.login};

            var prefilledData=getPrefilledData(userId,userDefaults);
            if (prefilledData){
                if (prefilledData.userName != undefined) {
                    row.userName=prefilledData.userName;
                }

                for (var fieldName in prefilledData.fields){
                    var val=prefilledData.fields[fieldName];
                    row[fieldName]=val;
                };
            }

            result[userId]=row;
        };
        return result;
    }

    this.load=function(users,excludeUserName,userDefaults){
        dtable.fnClearTable(false);

        defaultUserData=buildDefaultUserData(users,excludeUserName,userDefaults);

        var aaData=convertToAaData(users);
        dtable.fnAddData(aaData);
        return aaData.length;

    };
    this.show=function(){
        rootElm.fastShow();
    };
    this.hide=function(){
        rootElm.fastShow(false);
    };

    function copyData(from,to){
        for (var key in from){
            to[key]=from[key];
        }
    }

    this.getEntries=function(){
        var result={};
        var datas=dtable.fnGetData();
        var includeDisabled=settings.appUserData?true:false; //expensive so true when it's really needed
        var templateRowData={};
        groupTemplateControl.toFlatJson(bulkId,templateRowData, groupTemplateControl.toFlatJson.RemoveFormQualifierFunc,includeDisabled);

        $.each(datas,function(idx,data){
            var obj=saasure.DataTables.buildObject(dtableOpt.aoColumns,data);

            var appName=settings.instances[instance.id].name;

            var row={appName:appName,userId:obj.user.id,instanceId:instance.id,userAllowedToEditUserName:true};

            copyData(templateRowData,row);
            personalTemplateControl.toFlatJson(obj.user.id,row, personalTemplateControl.toFlatJson.RemoveFormQualifierFunc,includeDisabled); //these would override bulk, none right now

            removeColumn.toFlatJson(obj.user.id,row);

            result[obj.user.id]=row;
        });
        return result;
    };
};
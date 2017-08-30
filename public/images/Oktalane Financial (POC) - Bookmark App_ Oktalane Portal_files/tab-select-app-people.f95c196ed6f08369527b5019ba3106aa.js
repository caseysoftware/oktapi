var BaseTable=function(){
    var self=this;
    var checkboxTable = new saasure.Widget.CheckboxTable();


    this.init=function(container, countElm, dtableOpt, idColumn,checkedObj,totalElm){
        checkboxTable.options.idColumn=idColumn;
        checkboxTable.options.trSelect=true;
        checkboxTable.options.events.checkChanged = function(widget, eventName, param){
            countElm.text(param.checkCount);

            saasure.util.fireEvent(self, "checkChanged", param);
        };
        checkboxTable.options.totalElm = totalElm;

        checkboxTable.initTableOpt(dtableOpt);

        if (checkedObj) {
            checkboxTable.initChecked(checkedObj);
        }
    };

    this.getSelected=checkboxTable.getChecked;
    this.initChecked=checkboxTable.initChecked;
    this.options={events:{checkChanged:null}};
};

var PeopleTable=function(){
    BaseTable.apply(this);

    var self=this;
    var baseInit = this.init;
    var settings;

    function getInitChecked(){
        if (!settings.appUserData) return null;

        var result={};
        $.each(settings.appUserData, function(idx,data){
            result[data.userId]={user:{id:data.userId,fullName:data.fullName}};
        });
        return result;
    }

    function fullnameFormatter(obj, tr, td, index){
        td.innerHTML="<div class='details'><p class='name'>"+saasure.util.escapeHtml(obj.user.fullName)+"</p><p class='explain-text'>"+saasure.util.escapeHtml(obj.user.login)+"</p></div>";
    }

    this.init=function(container, countElm, settingsArg, selectAllElm){
        settings=settingsArg;
        var userList = new saasure.Widget.UserList();
        userList.options.statusTemplate ="${status.statusLabel}";
        userList.options.columns["user.email"].visible=false;

        var opt = userList.initTableOpt();
        opt.urlParam = function(){
            return {userStatusFilter:["PENDING","ACTIVE"]};
        };

        var fullNameColumn = opt.getAoColumn("user.fullName");
        var statusLabelColumn = opt.getAoColumn("status.statusLabel");

        fullNameColumn.sTitle = "<p>Person & Username</p>";
        fullNameColumn.sClass = "double-row-hdr";
        fullNameColumn.sWidth="61%";
        statusLabelColumn.sWidth="39%";
        statusLabelColumn.sTitle = "<p>Status</p>";
        opt.getAoColumn("user.login").bVisible=false;
        opt.aFormatters["user.fullName"]=fullnameFormatter;

        var totalElm = $(selectAllElm).find(".count");
        baseInit(container,countElm, opt, "user.id",getInitChecked(), totalElm);

        opt.searchByGroup = true;
        opt.sDom='<"H"lr>t<"F"ip>';

        dtable = $(container).dataTable(opt);

        var userSearch = new saasure.Widget.UserSearch("bulk-assign");
        userSearch.init(dtable, opt);

        function updateInfo(json){
            $("#bulk-assign-select-all-people .count").text(json.iTotalDisplayRecords).stop(false, true).effect("highlight", {}, 1000);
        }

        saasure.util.chainListener(opt,"updateInfo",updateInfo);

    };
};

var AppInstanceTable=function(){
    BaseTable.apply(this);

    var self=this;
    var baseInit = this.init;
    var settings;

    function getInitChecked(){
        var result={};
        if (settings.selectedInstanceId) {
            var id=settings.selectedInstanceId;
            result[id]={instance:settings.instances[id]};
            return result;
        }

        if (!settings.appUserData) return null;


        $.each(settings.appUserData, function(idx,data){
            result[data.instanceId]={instance:settings.instances[data.instanceId]};
        });
        return result;
    }

    function getAAData(){
        var result=[];

        var instances = settings.instances;
/*
        if (settings.selectedInstanceId) {
            var id=settings.selectedInstanceId;
            instances ={};
            instances[id]=settings.instances[id];
        }
*/
        for(var key in instances){
            var instance=instances[key];
            result.push([instance.id,instance.displayName,instance.instanceName,instance.logo,instance.signOn]);
        };

        return result;
    }

    function displaynameFormatter(obj, tr, td, index){
        td.innerHTML = "<div class='app-icon-mini'><img class='" +settings.instances[obj.instance.id].name+ "' alt='" +obj.instance.displayName+ " logo' src='"+obj.instance.logo+"' /></div>" +
                "<div class='details'>" +
                    "<p class='name hide'>" +obj.instance.displayName+ "</p>" +
                    "<p class='app-instance-name'>" +obj.instance.instanceName+ "</p>" +
                "</div>";
    }

    function signonFormatter(obj, tr, td, index){
        td.innerHTML="<span class='explain-text'>" +obj.instance.signOn+ "</span>";
    }

    function getOpt(){
        /* Apply custom classes to table headers */
        $.fn.dataTableExt.oJUIClasses.sSortAsc = "sorted_asc";
        $.fn.dataTableExt.oJUIClasses.sSortDesc = "sorted_desc";

        return (new saasure.DataTables()).serverSide({
            aaData:getAAData(),
            clientSide: true,
            sPaginationType : 'full_numbers',
            iDisplayLength : 100,
            bLengthChange: false,
            bInfo: false,
            aaSorting: [[ 1, 'asc' ]],
            //aaSorting: [],
            aoColumns: [
                { sName: "instance.id", bVisible: false },
                { sName: "instance.displayName", bSortable: true, sTitle: "<p>Application & Label</p>", sClass: "double-row-hdr", sWidth : "75%"},
                { sName: "instance.instanceName", sTitle: "instanceName", bVisible: false},
                { sName: "instance.logo", sTitle: "logo", bVisible: false},
                { sName: "instance.signOn", sTitle: "<p>Sign-on</p>", sWidth : "25%"}
            ],
            bJQueryUI	 : true,
            bAutoWidth: false,
            aFormatters: {
                "instance.displayName" : displaynameFormatter,
                "instance.signOn" : signonFormatter
            }
       })
    }


    this.init=function(container,countElm, settingsArg){
        settings=settingsArg;
        var opt = getOpt();

        baseInit(container,countElm, opt, "instance.id",getInitChecked());

        var datatableWidget = new saasure.Widget.Datatable();
        var datatable = datatableWidget.create(container, opt, $("#app-search-container"));
     };
};

var AppPeopleTab=function(){
    var appList;
    var peopleTable;
    var tab;
    var tabName="tab-app-people";
    var step=new saasure.Behavior.Wizard.TabStep(tabName, save);

    var settings;
    var options;

    this.getStep=function(){
        return step;
    };

    function getSelectionLimitErrorHtml(){
        var peopleSelectionCount=peopleTable.getSelected(true);
         var selectionCount = appList.getSelected(true) * peopleSelectionCount;

        if (peopleSelectionCount>settings.selectionCountLimit) {
            extra="You can remove <strong>1</strong> app and <strong>"+settings.selectionCountLimit+"</strong> users to get under the limit.";
        }else{
            var fewerAppCount =  Math.ceil((selectionCount - settings.selectionCountLimit)/peopleSelectionCount);
            extra="You can remove <strong>"+fewerAppCount+"</strong> apps to get under the limit.";
        }

        return "<h3>"+"You have <strong>" +selectionCount+ "</strong> assignments, but only <strong>"+settings.selectionCountLimit+"</strong> or fewer assignments can be made at a time. "+extra+"</h3>";
    }

    function save(doneCallback,context){
        var errorHtml="";


        var selectionCount = appList.getSelected(true) * peopleTable.getSelected(true);
        var hasValidSelection =false;

        if (options.mustHaveValidSelection){
            if (selectionCount == 0) {
                errorHtml="<h3>Select at least 1 application and 1 person before clicking Next</h3>";
            }else if (selectionCount > settings.selectionCountLimit) {
                errorHtml=getSelectionLimitErrorHtml();
            }else{
                hasValidSelection=true;
            }
        }else{
            hasValidSelection=true;
        }

        doneCallback(hasValidSelection,errorHtml);
    }

    function checkChanged(widget, eventName, param){
        checkLimit(param.checkCount);
    }

    function checkLimit(checkCount){
        var selectionCount = appList.getSelected(true) * peopleTable.getSelected(true);
        if (selectionCount>settings.selectionCountLimit){
            tab.markError(tabName,true,getSelectionLimitErrorHtml());
                $("#people-table,#app-table").addClass("error");/*.qtip({
                   content: 'Too many',
                   position: {
                      target: "mouse",
                      adjust:{
                        x:-50,y:-50
                    }
                   },
                   hide:"fixed"

                });*/
        }else{
            tab.markError(tabName,false);
                $("#people-table,#app-table").removeClass("error").qtip("destroy");
        }
    }
    this.init=function(tabArg,settingsArg,optionsArg){
        settings=settingsArg;
        tab=tabArg;
        options=optionsArg;
        appList=new AppInstanceTable();
        peopleTable=new PeopleTable();

        appList.init($("#app-table"),$("#app-count"),settings);
        peopleTable.init($("#people-table"),$("#people-count"),settings,$("#people-search-count"));

        appList.options.events.checkChanged=checkChanged;
        peopleTable.options.events.checkChanged=checkChanged;
/*
        $("#save-app-assignments-btn").live('click', submit);

        $("input.confirm-app-assignments-btn").live('click', function() {
            $("#total-apps-modal").text(appList.getSelected().length);
            $("#total-people-modal").text(peopleTable.getSelected().length);
            $("#confirm-app-assignments-modal").modal({
                minWidth: 560
            });
        });

        $("input#cancel-app-assignments-btn").live('click', function() {
            $.modal.close();
        });*/
    };
    this.getSelection=function(){
        return {instances:appList.getSelected("hash"),users:peopleTable.getSelected("hash")};
    };
};

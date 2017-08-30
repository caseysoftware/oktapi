var StatusList=function(){
    var container;

    var collapseList=new saasure.Widget.CollapseList();

    function createUI(selectedInstances,selectedUsers){
        var data=[{title:$.template(null,"Applications (${list.length})"),list:[]},
            {title:$.template(null,"People (${list.length})"),list:[]}];

        var instanceList=data[0].list;
        for (var key in selectedInstances){
            var val=selectedInstances[key];
            instanceList.push({disp:val.instance.displayName});
        };

        var userList=data[1].list;
        for(var key in selectedUsers){
            var val=selectedUsers[key];
            userList.push({disp:val.user.fullName});
        };

        collapseList.create(container,data);
    }

    this.load=function(selectedInstances,selectedUsers){

        createUI(selectedInstances,selectedUsers);
    };

    this.init=function(containerArg){
        container=containerArg;
    };
};

var StatusSummary=function(){
    var self=this;
    var peopleCountElm;
    var appCountElm;
    var errorCountElm;
    var moreInfoCountElm;

    var settings;
    var options;


    function setStatus(elm, count, skipHideShow){

        elm.children(".x-count").text(count);

        var div=elm.closest("div");

        if (count==1){
                elm.find(".x-single").fastShow();
                elm.find(".x-plural").fastShow(false);
        }else{
                elm.find(".x-single").fastShow(false);
                elm.find(".x-plural").fastShow();
        }

        if (!skipHideShow) {
            if (count==0){
                div.fastShow(false);
            }else{
                div.fastShow();
            }
        }
    }

     this.style=function(selectedInstances,selectedUsers,appUserData){
        var appCount = Object.keys(selectedInstances).length;
        var moreInfoCount=0;
        var dontNeedInfoCount=0;

        var errorCount=self.getErrorCount(appUserData);

        if (!appUserData || errorCount == 0) {
            if (!appUserData) {
                for(var key in selectedInstances){
                    var val=selectedInstances[key];
                    if (!settings.instances[val.instance.id].hide){
                        moreInfoCount++;
                    }
                }
            }
            dontNeedInfoCount=appCount - moreInfoCount;
        }
        setStatus(moreInfoCountElm, moreInfoCount);

        setStatus(appCountElm, dontNeedInfoCount);
        setStatus(peopleCountElm,Object.keys(selectedUsers).length, true);



        setStatus(errorCountElm, errorCount);

        //central code for conditional styling of this page

        var showInSingleApp=appCount==1;

         if (showInSingleApp) {
            var disp=settings.instances[Object.keys(selectedInstances)[0]].displayName;
            
            $("#appCount > .x-single,#need-more-info-count > .x-single:first").fastShow(!showInSingleApp);
            $("#appCount > .x-count").rawText(disp);
            $("#need-more-info-count > .x-count").html(disp+ " needs");

         }




        if (moreInfoCount == 0 && errorCount ==0){
              $("#topConfirmBar,.app-assignment-wrap").hide();
        } else {
            $(".app-assignment-wrap").show();
        }

        if (appUserData) {
            //tab.setTabVisible("tab-app-people",false);
            $("#bulkAssignTabContainer .x-prev").hide();

            if (errorCount==0){
                $("#bulkAssignTabContainer .x-cancel").hide();
                $("#bulkAssignTabContainer .x-done").val("OK");
                $("#review-message").text("Your application assignments completed successfully");
                $("#assignment-success .x-present-tense").fastShow(false);
                $("#assignment-success .x-past-tense").fastShow();
            }else{
                $("#bulkAssignTabContainer .x-done").val("Retry");
                $("#review-message").text("Review your assignments before retrying");
            }
        }else{
            if (options.navigation) {
                $("#bulkAssignTabContainer .x-done").val("Confirm Assignments").removeClass("button-wide");
            }
        }
    };

    this.init=function(settingsArg,optionsArg){
        settings=settingsArg;
        options=optionsArg;
        peopleCountElm=$("#peopleCount");
        appCountElm=$("#appCount");
        errorCountElm=$("#status-summary");
        moreInfoCountElm=$("#need-more-info-count");
    };

    this.getErrorCount=function(appUserData){
        if (!appUserData) return 0;

        var errorCount=0;
        for(var key in appUserData){
            var val=appUserData[key];
            if (val.errorText) {
                errorCount++;
                }
        }
        return errorCount;
    };
};

var FinalTab=function(){
    var entries={}; // hasthable of instanceId to AppInstanceEntry
    var tabName="tab-final";

    var selectedInstances;

    var statusList=new StatusList();
    var statusSummary=new StatusSummary();

    var step=new saasure.Behavior.Wizard.TabStep(tabName, save);

    var settings;

    this.getStep=function(){
        return step;
    };

    function save(doneCallback,context){
        doneCallback(true);
    }

    this.init=function(appPeopleTabArg,settingsArg, selectedInstances,options){
        settings=settingsArg;
        
        for(var id in selectedInstances){
            var instance=settings.instances[id];
            if (!instance.id){
                instance.id = id;
            }

            var entry=entries[id];
            if (!entry){
                entry=new AppInstanceEntry();
                entries[id]=entry;
            }
            entry.init(instance,settings);

        }

        statusList.init($("#status-list"));
        statusSummary.init(settings,options);
    };

    this.load=function(selectedInstancesArg,selectedUsers,userDefaults){
        selectedInstances=selectedInstancesArg;

        statusList.load(selectedInstances,selectedUsers);

        var shownCount=0;

        for(var key in settings.instances){
            var instance=settings.instances[key];
            var id=instance.id;
            var entry=entries[id];

            var loadedCount =0;
            if (selectedInstances[id]){
                //don't populate username if we are hiding it (eg: swa where user set username and password)
                var excludeUserName=settings.instances[id].hide;
                loadedCount=entry.load(selectedUsers,excludeUserName,userDefaults);
            }
            if (selectedInstances[id] && !settings.instances[id].hide && loadedCount >0){
                entry.show();
                shownCount++;
            }else{
                if (entry) { //non selected entry may not be initiated
                    entry.hide();
                }
            }
        }

        if (shownCount==0){
            $("#enterInfoText").fastShow(false);
        }else{
            $("#enterInfoText").fastShow();
        }
    };

    this.style=function(selectedInstancesArg,selectedUsers){
        statusSummary.style(selectedInstancesArg,selectedUsers,settings.appUserData);
    };

    this.getEntries=function(){
        var result={};
        $.each(selectedInstances,function(key,instanceData){
            var id=key;
            var row=entries[id].getEntries();
            result[id]=row;
        });
        return result;
    };

    this.getErrorCount=function(){
        return statusSummary.getErrorCount(settings.appUserData);
    };
};

var BulkAssignPageController=function(lazyLoading){
    var self=this;
    var tab;
    var appPeopleTab;
    var finalTab;
    var settings;


    function defaultOnSuccessFunc(){
        window.location = "/admin/apps/active";
    }

    function done(callback){

        function fireSuccess(){
            if (typeof callback =="function"){
                callback();
            }
            saasure.util.fireEvent(self,"onSuccess",null);
            $("#tab-content").removeClass("confirm-assignments");
        }

        if (settings.appUserData && finalTab.getErrorCount()==0) {
            saasure.ajax.clearBulk(settings.groupId,function(){
                fireSuccess();
            });
            return;
        } else{

            $("#bulk-assignment-in-progress-modal").modal({
                close: false,
                minWidth: 460
            });

            var entries=finalTab.getEntries();

            var data={assignments:entries};
            if (settings.groupId){
                data.groupId=settings.groupId;
            }

            AjaxForm.submit("bulk",{ajaxType:"POST",data:data, callback:function(success){

                if (success){
                    $.modal.close();
                    fireSuccess();
                } else{
                    $.modal.close();
                    //ajax form will display the error so do nothing here
                }
            }});
        }

    }
    function beforeShowAppPeopleTab(tabWidget,arg) {
        $.scrollTo("#header");
        arg.show();
    }

    function beforeShowFinalTab(tabWidget,arg){
        var selection=appPeopleTab.getSelection();

        function processLoading(userDefaults){

          if (lazyLoading) {
            $("#template-root").load("/admin/app/bulk-assign-load", { instanceIds: Object.keys(selection.instances) },
              function () {
                AjaxForm.bind_events();
                step2(userDefaults);
              });
          } else {
            step2(userDefaults);
          }
        }

        function step2(userDefaults){
          finalTab.init(appPeopleTab, bulkAssignSettings, selection.instances,self.options);
          AjaxForm.clear_errors("bulk"); //we have only 1 ajax form for all app, we might have an error for one app, user remove that app, but the error div is still there, this is a work around for that problem

          var showNormal = Object.keys(selection.users).length!=0;
          $("#reviewNone").fastShow(!showNormal);
          $("#reviewNormal").fastShow(showNormal);

          finalTab.load(selection.instances,selection.users,userDefaults);
          finalTab.style(selection.instances,selection.users);
          $.scrollTo("#header");
          arg.show();

        }

        if (!settings.appUserData) {
            $.postJson({
                url:"/admin/app/bulk-assign-default",
                data:{instanceIds:Object.keys(selection.instances),userIds:Object.keys(selection.users)},
                success:processLoading
            });
        } else{
            window.setTimeout(processLoading,50);
        }
    }

    function defaultCancelFunc(){
        window.location.href = "/admin/apps/active";
    }

    this.doAssign=function(callback){
        done(callback);
    }

    this.gotoTab=function(tabName){
        tab.selectTab(tabName);
    };
    this.getSelectedTabName=function(){
        return tab.getSelectedTabName();
    };

    this.init=function(){
        settings=bulkAssignSettings;

        var tabWizard=new saasure.Widget.TabWizard();
        tabWizard.options.events.done=done;
        tab=new saasure.Widget.Tab();

        appPeopleTab=new AppPeopleTab();
        appPeopleTab.init(tab,settings, self.options);

        finalTab=new FinalTab();



        tab.options.persistInUrl=false;
        tab.options.tabs["tab-final"]={beforeShow:beforeShowFinalTab, afterLoad:self.options.events.tabFinalAfterLoad};
        tab.options.tabs["tab-app-people"]={beforeShow:beforeShowAppPeopleTab,afterLoad: self.options.events.tabAppPeopleAfterLoad};
        tab.options.animate=false; //this takes a lot of cpu time when page is complex
        
        var tabCreateOpt={};
        if (settings.appUserData) {
            tabCreateOpt.selectedTabName="tab-final";
        }


        tab.create("#bulk-assign-tabs","#bulkAssignTabContainer", tabCreateOpt);


        var steps=[appPeopleTab.getStep(),finalTab.getStep()];
        tabWizard.setTab(tab, steps, !self.options.navigation);

          
        if (!self.options.navigation || settings.appUserData){
            $("#bulk-assign-tabs").hide();
        }

        if (self.options.navigation) {
            $(".x-cancel").die().live("click",function(){
                var cancelMessage;

                if (settings.appUserData) {
                    //var selection=appPeopleTab.getSelection();
                    //finalTab.style(selection.instances,selection.users);

                    cancelMessage=finalTab.getErrorCount()==0?"":"<h3>Are you sure you want to cancel?</h3><p>No action will be taken.</p>";
                }else{
                    cancelMessage="<h3>Are you sure you want to cancel?</h3><p>Any unsaved changes will be lost.</p>";
                }



                var dialog = {
                        minWidth: 400,
                        title: "Unsaved Changes",
                        message: cancelMessage,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        confirm: function(){
                             saasure.util.fireEvent(self,"onCancel",null);
                        }
                    };
                ModalDialog.confirm(dialog);
            });
        }

        $(".toggle-control").die().live("click", function(e) {
            e.preventDefault();
            var control = $(this);
            var section = control.parents(".toggle-wrap").find(".toggle-section");
            if (control.hasClass("collapse-gray")) {
                control.removeClass("collapse-gray").addClass("expand-l-gray");
                section.stop().css("visibility", "hidden").slideUp(400, "easeInOutQuad");
            } else {
                control.removeClass("expand-l-gray").addClass("collapse-gray");
                section.stop().slideDown(400, "easeInOutQuad", function() {
                    section.css("visibility", "visible");
                });
            }
        });

        $(".toggle-control-all").die().live("click", function(e) {
            e.preventDefault();
            var control = $(this);
            var sectionControls = $(".toggle-control");
            var sections = $(".toggle-section");
            if (control.hasClass("collapse-gray")) {
                control.removeClass("collapse-gray").addClass("expand-l-gray").find(".text").text("Expand all");
                sectionControls.removeClass("collapse-gray").addClass("expand-l-gray")
                sections.stop().css("visibility", "hidden").slideUp(200, "easeInOutQuad");
            } else {
                control.removeClass("expand-l-gray").addClass("collapse-gray").find(".text").text("Collapse all");
                sectionControls.removeClass("expand-l-gray").addClass("collapse-gray")
                sections.stop().slideDown(200, "easeInOutQuad", function() {
                    sections.css("visibility", "visible");
                });
            }
        });        

    };
    this.options={
        mustHaveValidSelection:true,
        navigation:true,
        events:{
            onCancel:defaultCancelFunc,
            onSuccess:defaultOnSuccessFunc,
            tabFinalAfterLoad:null,
            tabAppPeopleAfterLoad:null
        }
    };

};


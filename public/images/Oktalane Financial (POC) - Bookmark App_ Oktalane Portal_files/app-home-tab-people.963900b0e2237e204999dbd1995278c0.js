var BulkAssignSection=function(lazyLoading){

    var bulkAssignController;

    var loading=false;
    var dtable;
    var statusController;
    var showing;

    function showBulkAssign(show){
        showing=show;
        if (show==undefined)show=true;

        $("#tabs > ul").slideToggle(500, "easeInOutQuad", function(){
            if (!show) $("#tab-content").removeClass("bulk-assign-app-home");
            $("#mainPeopleSection").fastShow(!show);
            $("#assignSection").fastShow(show);
            if (show) {
                $(".app-logo-edit").fadeOut(600);
                $("#app-deactivate").hide(600);
            } else {
                $(".app-logo-edit").fadeIn(600);
                $("#app-deactivate").show(600);
            }
        });
        
        $("#app-settings>.icon-list-16 a").click(function(e){
            e.preventDefault();
            return false;
        });
        
    }

    function onCancel(){
        showBulkAssign(false);
    }

    function onSuccess(){
        dtable.fnDraw();
        showBulkAssign(false);

        statusController.refresh(5000);
    }

    function loadPage(url){
                loading=true;
                saasure.util.getPages([{url:url,callback:function(html){
                    $("#assignSection").empty(); //we are not doing proper uninit, this is a hack to free up as much as we can
                    $("#assignSection").html(html);
                    $("#tab-content").addClass("bulk-assign-app-home");
                    bulkAssignController=new BulkAssignPageController(lazyLoading);
                    bulkAssignController.options.events.onCancel=onCancel;
                    bulkAssignController.options.events.onSuccess=onSuccess;
                    bulkAssignController.options.events.tabAppPeopleAfterLoad=function(){
                        $("#tab-content").removeClass("confirm-assignments").addClass("select-assignments");
                    };
                    bulkAssignController.options.events.tabFinalAfterLoad=function(){
                        $("#tab-content").removeClass("select-assignments").addClass("confirm-assignments");
                    };
                    bulkAssignController.init();

                    AjaxForm.bind_events();

                    loading=false;

                    showBulkAssign();
                }}]);
    }

    this.hide=function(){
        if(!showing)return;
        
        showBulkAssign(false);
        $("#tab-content").removeClass("confirm-assignments").addClass("select-assignments");
    };
    this.init=function(dtableArg){
        dtable=dtableArg;

        var statusElm=$("#bulkAssignStatus");
        statusController=new BulkAssignStatusController();
        statusController.init(statusElm, instanceId);

        statusElm.find(".x-bulk-status-link").live("click",function(evt){
            evt.preventDefault();
            loadPage(evt.target.href+"&inline=true");
            
        });

        $("#bulk-assign").click(function(evt){
            evt.preventDefault();
            if($(this).hasClass("disabled-control")) {
                return;
            }

            
            if (loading) return;

            //if (!bulkAssignController){
                loadPage("/admin/app/bulk-assign?inline=true&instanceId="+instanceId);

                return;
            //}

            //showBulkAssign();

        });
    }
};

var PeopleTab=function(lazyLoading){
    var self=this;
    var bulkAssignSupport;
    var dtable;
    var bulkSection;

    this.update=function(arg){
        if (arg && arg.importEnable != undefined){
            if (arg.importEnable){
                $(".x-import-enable").show();
            }else{
                $(".x-import-enable").hide();
            }
        }
    };



    this.init=function(tab, bulkAssignSupportArg){
        bulkAssignSupport=bulkAssignSupportArg;
        
        tab.options.tabs["tab-people"]={
            onHide:function(tabWidget,arg){
                if (bulkSection){
                    bulkSection.hide();
                }
            },
            beforeShow:function(tabWidget,arg){
                self.update();
                arg.show();
                dtable.fnDraw(); //reload the people list when we switch to people tab again
        }};

        var userList = new saasure.Widget.UserList();
        userList.options.columns["user.email"].visible=false;
        userList.options.statusTemplate ="{{= status.statusLabel}}";
        
        var opt = userList.initTableOpt();

        opt.urlParam = function(){
            return {instanceId:instanceId};
        };

        dtable=$('#assignedPeopleTable').dataTable(opt);

        if (bulkAssignSupport){
            bulkSection=new BulkAssignSection(lazyLoading);
            bulkSection.init(dtable);
        }


        $("#refreshAssigned").click(function(){
            dtable.fnDraw();
        });

        $("#importUserButton").click(function(){
            if($("#importUserButton").hasClass("disabled-control")) {
                return;
            }
            tab.selectTab("tab-import");
        });
    };

    $("#app-activate").live('click', function(e) {
        $("#importUserButton,#bulk-assign").removeClass("disabled-control");
        $("#importUserButtonTitle").attr("title", "Import users");
    });
    $("#app-deactivate").live('click', function(e) {
        $("#importUserButton,#bulk-assign").addClass("disabled-control");
        $("#importUserButtonTitle").attr("title", "Sorry, user import is not available while the application is disabled");
    });
};
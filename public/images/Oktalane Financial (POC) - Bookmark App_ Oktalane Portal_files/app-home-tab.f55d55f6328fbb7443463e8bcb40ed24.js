var SingleLinkLogoSection=function(){
    var linkData;
    var container;
    var uploadTargetFrame;

    var uploadButton;
    var fileButton;
    var img;

    this.show=function(linkDataArg,imgArg){
        linkData=linkDataArg;
        img=imgArg;
        fileButton.clear();
        container.find("input[name='linkId']").val(linkData.id);
        $("#selectedLogoDisplay")[0].src=img[0].src;
        container.show();
    };


    function onUploadDone(widget,eventName,arg){
        if (AjaxForm.check_and_render_errors("logoForm", arg.json)){
            return; //error displayed
        }

        updateCustomImage(arg.json);
    };

    function updateCustomImage(json){
        if (!json.url) return;

        $("#selectedLogoDisplay")[0].src=json.url;
        img[0].src=json.url;
        $("#app-logo-img").removeAttr("width").removeAttr("height");

        $("#app-logo-img")[0].src=json.appLogoUrl;
    }

    this.init=function(containerArg,uploadTargetFrameArg){
        container=containerArg;
        uploadTargetFrame=uploadTargetFrameArg;

    };

    this.attach=function(){
        var uploadElm=container.find("input:submit");

        uploadButton=new saasure.Widget.UploadButton();
        uploadButton.options.events.onUploadDone=onUploadDone;
        uploadButton.init(uploadElm,uploadTargetFrame);

        fileButton=new saasure.Widget.FileButton();
        fileButton.init(container.find("input[type=file]"));

        $(container.find(".x-reset-logo")).click(function(e){
            e.preventDefault();
            fileButton.clear();

            uploadElm[0].disabled=true;
            $.postJson({
                url: "/admin/app/"+appName+"/instance/"+instanceId+"/reset-link-logo?linkId="+linkData.id,
                dataType:"json",
                success: function(json) {
                    uploadElm[0].disabled=false;
                    updateCustomImage(json);
                },
                error: function(error) {
                    var parsedError = error.responseText.substring('while(1){};'.length);
                    var errorObj = JSON.parse(parsedError);
                    AjaxForm.check_and_render_errors("logoForm", errorObj);
            }
            },true);
        })
    }
};

var AppLinkLogoController=function(){
    var self=this;

    var container;
    var editElm;
    var section;
    var appLinkData;

    var uploadTargetFrame;

    var selectionWidget;

    function switchTo(idx){
        section.show(appLinkData[idx],$("#imageFlowDiv img:eq("+idx+")"));
    }

    function attach(){
        var imgSelection=$("#imageFlowDiv").children();
         imgSelection.each(function(idx,elm){
            $(this).click(function(){
                if (uploadTargetFrame.isUploading()) return;

                switchTo(idx);
            })
        });

        section.attach();

        selectionWidget=new saasure.Widget.Selection();
        selectionWidget.init(imgSelection);
        selectionWidget.select($(imgSelection[0]));

        $("#closeEditLinkLogo").click(function(){
             $.modal.close();
        });
    }


    this.init=function(containerArg,editElmArg,appLinkDataArg){
        appLinkData=appLinkDataArg;
        container=containerArg;
        editElm=editElmArg;

        container.find("form").prepend(AjaxForm.generateErrorDivHtml("logoForm"));

        uploadTargetFrame=new saasure.Widget.UploadTargetFrame();
        uploadTargetFrame.init();


        section=new SingleLinkLogoSection();
        section.init(container.find(".x-link-section"),uploadTargetFrame);


        editElm.show();
        editElm.click(function(e){
            e.preventDefault();
            container.find("form").each(function(idx,elm){
                this.reset();
            });



            attach(); //modal() does funny things with the dom, so we need to attach every time

            switchTo(0);
            $("#editLinkSection").modal({minWidth:535, persist:true});
        });
    }
};

var AppHomeController = function(lazyLoading) {
    this.init = function(options) {
      var tab = window.tab = new saasure.Widget.Tab();
      var userImportController = new UserImportPage();
      var notifyTabLoaded = function () {
          options.tabLoadedCallback && options.tabLoadedCallback();
      }
      var notifyGroupsLoaded = function () {
        //for OKTA-71872, we could revert the change after UD_ENABLED_APP_ASSIGNMENT_UI is GAed.
          $('#tabs li:has(a[href="#tab-groups"])').trigger('groupsTabLoaded');
      }
      window.userImportController = userImportController;
      tab.options.tabs["tab-import"] = {afterLoad: function () {
        userImportController.init();
      }};
      tab.options.tabs["tab-general"] = {afterLoad: notifyTabLoaded};
      tab.options.tabs["tab-user-management"] = {afterLoad: notifyTabLoaded};
      tab.options.tabs["tab-groups"] = {afterLoad: notifyGroupsLoaded};
      tab.options.tabs["tab-signon"] = {afterLoad: notifyTabLoaded};

      tab.create("#tabs", "#tab-content");

      var appLinkLogoController = new AppLinkLogoController();
      appLinkLogoController.init($("#editLinkSection"), $("#editAppLinkLogo"), appLinkData);

      updateTags();

      /* Settings icons open respective tab */
      $("#swa,#advanced-sso").live('click', function (e) {
        e.preventDefault();
        tab.selectTab("tab-signon");
      });

      $("#import-users,#password-sync,#user-provisioning,#user-deactivation").live('click', function (e) {
        e.preventDefault();
        tab.selectTab("tab-user-management");
      });

      function doUpdateTags(tags) {
        for (i = 0; i < tags.length; i++) {
          var tag = tags[i];
          var id = $("#" + tag.image);
          if (tag.active) {
            id.closest('li').addClass('active');
            id.attr('title', tag.displayName + " is enabled");
          } else {
            id.closest('li').removeClass('active');
            id.attr('title', tag.displayName + " is disabled");
          }
        }
        /* apply qtips */
        $(".app-setting-indicator[title]").qtip({
          style: {
            name: 'dark',
            tip: true,
            width: {min: 200},
            'text-align': 'center'
          },
          position: {
            corner: {target: 'topMiddle', tooltip: 'bottomMiddle'},
            adjust: {x: 0, y: -8}
          },
          hide: {fixed: true}
        });
      }

      function updateTags() {
        $.ajaxSafeJson({
          type: "GET",
          url: getTagsURI,
          success: function (res) {
            doUpdateTags(res.tags);
          }
        });
      }

      AjaxForm.register("ssoSettings", {
        beforeEdit: function () {
          if ($("#ssoSettings\\.read_only input:radio:visible:checked").size() > 0) {
            var optionType = $("#ssoSettings\\.read_only input:radio:visible:checked").attr("id").split(".").pop();
            saasure.appHome.onSignOnModeSelected(optionType);
          }

          var autofill = $("#ssoSettings\\.autofill");
          if (autofill.val() && autofill.val().indexOf("custom.suffix") != -1) {
            $("#userSuffix-section").removeClass("hide")
          }

          if (autofill.val() && autofill.val().indexOf("global.assign.userName.customExpression") != -1) {
            $("#customRule-section").removeClass("hide");
            $("#customRule-section-link").removeClass("hide");
          }

        },
        beforeReadOnly: function (arg) {
          if (!arg.saved) return;
          //basically copy edit to read only
          if ($("#ssoSettings\\.edit\\.form input:radio:visible:checked").size() > 0) {
            var optionType = $("#ssoSettings\\.edit\\.form input:radio:visible:checked").attr("id").split(".").pop();
            saasure.appHome.onSignOnModeSelected(optionType, "#ssoSettings\\.read_only");
          }
        },
        onSaved: function (arg) {
          updateTags();
        }

      });


      AjaxForm.register("settings", {
        beforeEdit: function () {
          $("#settings\\.read_only .app-link-checkbox").each(function () {
            var input = $("#settings\\." + $(this).val());
            saasure.appHome.enableAppLink($(this).prop("checked"), input);
          });
        },
        beforeReadOnly: function (arg) {
          if (!arg.saved) return;
          //basically copy edit to read only
          $("#settings\\.edit .app-link-checkbox").each(function () {
            var input = $("#settings\\.read_only\\.link\\." + $(this).val());
            saasure.appHome.enableAppLink($(this).prop("checked"), input);
          });
        },
        onSaved: function (arg) {
          $("#app-instance-name").html(arg.resp.settings.label);
          updateTags();
        }
      });

      AjaxForm.register("userMgmtSettings", {
        beforeEdit: function () {
          var importMapping = $("#userMgmtSettings\\.read_only\\.fieldMappingRules");
          if (importMapping.val() && importMapping.val().indexOf("global.import.login.customExpression") != -1) {
            $("#customImportRule-section").removeClass("hide");
          }
        },
        beforeReadOnly: function (arg) {
          tab.markError("tab-user-management", false);
        },
        onSaved:function(arg){
          tab.setEnabledTabs(["tab-import"],arg.resp.settings.enabled);
          updateTags();
        }
      });

      saasure.done("done", $("body"));
    };
};

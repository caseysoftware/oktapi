var EVENT_OAUTH_CLIENT_APP_DEACTIVATED = 'application.lifecycle.deactivate',
  EVENT_OAUTH_CLIENT_APP_ACTIVATED = 'application.lifecycle.activate',
  EVENT_OAUTH_CLIENT_APP_DELETED = 'application.lifecycle.delete';

var orgId = this.okta.settings.orgId;

saasure.appHome = {

    getAddOanMetrics: function() {
        if (!this.__addOanMetrics) {
            this.__addOanMetrics = _.clone(OktaMetrics.initialize({
                component: 'Applications',
                name: 'Add OAN App'
            }));
        }
        return this.__addOanMetrics; 
    },

    getOAuth2Metrics: function() {
        if (!this.__oAuth2Metrics) {
            this.__oAuth2Metrics = _.clone(OktaMetrics.initialize({
                component: 'OAuth2',
                name: 'Client'
            }));
        }
        return this.__oAuth2Metrics;
    },

    goToAppList: function(appName) {
        window.location.href = appName === 'omm_wifi' ? '/admin/devices#wifi' : '/admin/apps/active';
    },

    toggleSignOnModeExplainText: function(type) {

        var text = $("#" + type + "-explain").html();
        var disp=$("#sign-on-mode-explain");

        if (!disp.is(":visible")){
            $(disp).html(text);
            return;
        }
        $(disp).fadeOut(400, function() {
            $(disp).html(text);
            $(disp).fadeIn(400);
        });

    },

    toggleSamlConfig: function(signOnMode) {
      var signOnModeOff;

      var toggleOn = "#ssoSettings\\." + signOnMode + "\\.wrap input";
      if (signOnMode == "SAML_2_0") {
        signOnModeOff = "SAML_1_1";
      } else {
        signOnModeOff = "SAML_2_0";
      }
      var toggleOff = "#ssoSettings\\." + signOnModeOff + "\\.wrap input";

      $(toggleOff).each(function() {
        $(this).prop("disabled", true);
      });

      $(toggleOn).each(function() {
        $(this).prop("disabled", false);
      });

    },

    toggleEditCredentials: function(type, formSelector) {
        var toShowSelector = formSelector + " ." + type + "-edit-credentials";
        var toShow=$(toShowSelector);
        var toHide=$(formSelector + " .edit-credentials").not(toShowSelector);

        if (!toHide.parent().is(":visible")){
            toHide.hide();
            toShow.show();
            return;
        }
        toHide.slideUp(400, function() {
            toShow.slideDown(400);
        });
    },

    toggleCredentialsDetails: function(signOnMode) {
        var credentialsDetails = $('#ssoSettings\\.read_only form .credentials-details');
        var credentialsDetailsEdit = $('#ssoSettings\\.edit\\.form .credentials-details');
        if (signOnMode === 'MOBILE_NO_SIGNON') {
            credentialsDetails.hide();
            credentialsDetailsEdit.hide();
        } else {
            credentialsDetails.show();
            credentialsDetailsEdit.show();
        }
    },

    toggleSignOnPolicy: function(signOnMode) {
        var signOnPolicy = $('#policy-container');
        if (signOnMode === 'MOBILE_NO_SIGNON') {
            signOnPolicy.hide();
        } else {
            signOnPolicy.show();
        }
    },

    toggleApplicationUsername: function(signOnMode) {
        var applicationUsername = $('.sidebar-application-username');
        if (signOnMode === 'MOBILE_NO_SIGNON') {
            applicationUsername.hide();
        } else {
            applicationUsername.show();
        }
    },

    enableAppLink : function(enabled, el) {
        if (enabled) {
            $(el).parents("li.app-link-wrap").addClass("selection-confirmed");
        } else {
            $(el).parents("li.app-link-wrap").removeClass("selection-confirmed");
        }
    },

    toggleRevealPassword: function (disable, isChecked) {
        $('.reveal-password-active input').prop("checked", isChecked).prop("disabled", disable);
        $('.reveal-password-active').toggleClass("disabled", disable);
    },

    toggleNoSignOnConfig: function (signOnMode) {
        saasure.appHome.toggleCredentialsDetails(signOnMode);
        saasure.appHome.toggleSignOnPolicy(signOnMode);
        saasure.appHome.toggleApplicationUsername(signOnMode);
    },

    onSignOnModeSelected: function(signOnMode, formSelector) {
        var swaSignOnModes = ["SECURE_PASSWORD_STORE", "BROWSER_PLUGIN", "BASIC_AUTH", "AUTO_LOGIN"];
        var revealPassword = $('.reveal-password');
        var syncOktaPassword = $('.reveal-password-push-passwords');

        if (!formSelector) formSelector ="#ssoSettings\\.edit\\.form";

        saasure.appHome.toggleEditCredentials(signOnMode, formSelector);
        saasure.appHome.toggleSignOnModeExplainText(signOnMode);
        saasure.appHome.toggleSamlConfig(signOnMode);
        saasure.appHome.toggleNoSignOnConfig(signOnMode);

        if (revealPassword.length > 0) {
            $('.reveal-password').hide();
            if (syncOktaPassword.length > 0) {
                saasure.appHome.toggleRevealPassword(true, false);
                $('.reveal-password-push-passwords').show();
            } else if (signOnMode == "SAML_2_0" || signOnMode == "SAML_1_1") {
                saasure.appHome.toggleRevealPassword(true, false);
                $('.reveal-password-saml').show();
            } else if ($.inArray(signOnMode, swaSignOnModes) >= 0) {
                saasure.appHome.onSignOnModeOptionSelected($("input[id^='ssoSettings." + signOnMode + "'].signon-mode-option:checked"), formSelector);
            } else {
                saasure.appHome.toggleRevealPassword(true, false);
            }
        }

        var helpInstruction=$(formSelector + " .instructions-" + signOnMode);
        $(formSelector + ' .helpInstructionWrap').not(".instructions-" + signOnMode).hide();
        if (helpInstruction.size() > 0) {
            helpInstruction.show();
        }
    },

    onSignOnModeOptionSelected: function(signOnModeOption, formSelector) {
        var revealPassword = $('.reveal-password'),
            signOnModeId = signOnModeOption.attr('id');
        var adminSetsCredentials = $('.admin-sets-credentials');

        if (!formSelector) formSelector = "#ssoSettings\\.edit\\.form";

        if (revealPassword.length > 0) {
            $('.reveal-password').hide();
            if (signOnModeId && signOnModeId.indexOf('admin-sets-credentials') > -1) {
                saasure.appHome.toggleRevealPassword(true, false);
                $('.reveal-password-admin-sets-credentials').show();
            } else if (signOnModeId && signOnModeId.indexOf('shared-credentials') > -1) {
                saasure.appHome.toggleRevealPassword(true, false);
                $('.reveal-password-shared').show();
            } else if (signOnModeId && signOnModeId.indexOf('external-sync') > -1) {
                saasure.appHome.toggleRevealPassword(true, false);
                $('.reveal-password-sync').show();
            } else {
                var readOnlyInput = $("#ssoSettings\\.read_only\\.revealPassword");
                var isChecked = readOnlyInput.length ? readOnlyInput.is(":checked") : true;
                saasure.appHome.toggleRevealPassword(false, isChecked);
            }
        }

        if (adminSetsCredentials.length > 0) {
            if (signOnModeId && signOnModeId.indexOf('admin-sets-credentials') > -1) {
                $('.admin-sets-credentials').show();
            } else {
                $('.admin-sets-credentials').hide();
            }
        }

        // This next line is horrible.
        var signOnModeOptionWrap = signOnModeOption.parents(".checkbox-wrap");
        signOnModeOptionWrap.siblings().children("dl").hide();
        signOnModeOptionWrap.children().show();
    },

    onTestSSOSettings: function() {
        var formFields = Utils.cloneFormFields("#settings\\.edit\\.form");
        $("#config-fields").html("");
        $(formFields).each(function() {
            $(this).appendTo($("#config-fields"));
        });
        $("#test-credentials-username").val("");
        $("#test-credentials-password").val("");
        $("#test-credentials-save").addClass('ui-state-disabled').prop("disabled", true);

        $("#test-credentials-dialog").modal({
                                                escClose: true,
                                                overlayClose:true,
                                                minHeight:275,
                                                minWidth: 460
                                            });
    },

    getAppChangeStatusUrl: function(elem, action) {
        return "/admin/app/" + $(elem).attr("x-app-name") + "/" + action + "/" + $(elem).attr("x-app-instance");
    },

    initConfirmDeactivateModal: function() {
        var confirmDeactivateModalSelector = "#confirm-deactivate-instance";
        var confirmDeactivateUrl = null;
        var self = this;

        ModalDialog.registerModalDialog(confirmDeactivateModalSelector, {
            confirm: function(e) {
                $.ajaxSafeJson({
                    url: confirmDeactivateUrl,
                    type: "POST",
                    success: function() {
                        var oAuth2Metrics = self.getOAuth2Metrics();
                        if (e.getAttribute('x-app-name') === 'oidc_client') {
                            var clientId = null;
                            $.ajaxSafeJson({
                                url: '/api/v1/internal/apps/' + e.getAttribute('x-app-instance') + '/settings/clientcreds',
                                type: "GET",
                                success: function (response) {
                                    clientId = response.client_id;
                                },
                                complete: function () {
                                    var propertiesToTrack = {orgId: orgId, clientId: clientId};
                                    oAuth2Metrics.track(EVENT_OAUTH_CLIENT_APP_DEACTIVATED, propertiesToTrack);
                                }
                            });
                        }
                        $(".activate-app-link").parent().show();
                        $(".deactivate-app-link").parent().hide();
                        $(".delete-app-link").parent().show();
                        $(".app-instance-status").text("Inactive");
                    }
                });
            },
            minWidth: 500
        });

        $(".deactivate-app-link").live('click', function(e) {
            var me = $(this);
            e.preventDefault();
            $("#confirm-deactivate-instance-instanceid").html(me.attr("x-app-instance"));
            $("#confirm-deactivate-instance-name").html(me.attr("x-app-instance-name"));
            confirmDeactivateUrl = saasure.appHome.getAppChangeStatusUrl(me, "deactivate");
            $.ajaxSafeJson({
                url: saasure.appHome.getAppChangeStatusUrl(me, "deactivate_info"),
                type: "GET",
                success: function(response) {
                    var msg = "";
                    if (response.userCount > 0) {
                        if (response.userManagementEnabled) {
                            msg = $("#confirm-deactivate-instance-warning-msg-users-um").html();
                        } else {
                            msg = $("#confirm-deactivate-instance-warning-msg-users").html();
                        }
                        msg = _.template(msg,
                            {name: me.attr("x-app-instance-name"), count: response.userCount},
                            {escape: /\{\{(.+?)\}\}/g});
                    } else {
                        if (response.userManagementEnabled) {
                            msg = $("#confirm-deactivate-instance-warning-msg-um").html();
                        } else {
                            $("#confirm-deactivate-instance-warning").hide();
                        }
                    }
                    if (msg != "") {
                        $("#confirm-deactivate-instance-warning").show();
                        $("#confirm-deactivate-instance-warning-text").html(msg);
                    }
                }
            });
            ModalDialog.openModal(e, confirmDeactivateModalSelector);
        });
    },

    initConfirmDeleteModal: function() {
        var confirmDeleteModalSelector = "#confirm-delete-instance";
        var confirmDeleteUrl = null;
        var self = this;

        ModalDialog.registerModalDialog(confirmDeleteModalSelector, {
            confirm: function(e) {
                if (e.getAttribute('x-app-name') === 'oidc_client') {
                    var clientId = null;
                    $.ajaxSafeJson({
                        url: '/api/v1/internal/apps/' + e.getAttribute('x-app-instance') + '/settings/clientcreds',
                        type: "GET",
                        success: function (response) {
                            clientId = response.client_id;
                        },
                        complete: function () {
                            var oAuth2Metrics = self.getOAuth2Metrics();
                            $.ajaxSafeJson({
                                url: confirmDeleteUrl,
                                type: "POST",
                                success: function() {
                                    var propertiesToTrack = {orgId: orgId, clientId: clientId};
                                    oAuth2Metrics.track(EVENT_OAUTH_CLIENT_APP_DELETED, propertiesToTrack).then(function () {
                                        $(".activate-app-link").parent().show();
                                        $(".deactivate-app-link").parent().show();
                                        $(".delete-app-link").parent().hide();
                                        $(".app-instance-status").text("Deleted");
                                        saasure.appHome.goToAppList(appName);
                                    });
                                }
                            });
                        }
                    });
                } else {
                    $.ajaxSafeJson({
                        url: confirmDeleteUrl,
                        type: "POST",
                        success: function() {
                            $(".activate-app-link").parent().show();
                            $(".deactivate-app-link").parent().show();
                            $(".delete-app-link").parent().hide();
                            $(".app-instance-status").text("Deleted");
                            saasure.appHome.goToAppList(appName);
                        }
                    });
                }
            },
            minWidth: 500
        });

        $(".delete-app-link").live('click', function(e) {
            var me = $(this);
            e.preventDefault();
            $("#confirm-delete-instance-instanceid").html(me.attr("x-app-instance"));
            $("#confirm-delete-instance-name").html(me.attr("x-app-instance-name"));
            confirmDeleteUrl = saasure.appHome.getAppChangeStatusUrl(me, "delete");
            ModalDialog.openModal(e, confirmDeleteModalSelector);
        });
    },

    togglePasswordCycleOption: function() {
      var checked = $('label.sync-password-option input:radio:checked');
      var option = checked.attr('id');
      if (option == 'userMgmtSettings.syncUniquePassword') {
        $('.password-cycle-option').show();
      } else if (option == 'userMgmtSettings.syncOktaPassword') {
        $('.password-cycle-option').hide();
        $('#userMgmtSettings\\.cycleSyncedPassword').prop('checked', false);
      }
    }
};

$(function() {

    $('input.button').attachMouseEvents();

    $("a.feature-link").live('click', function() {
        $(this).parents('tr').next('tr').show();
    });

    $("a.hide-feature-descr").live('click', function() {
        $(this).parents('tr').hide();
    });

    $("a.hide-feature-note").live('click', function() {
        $(this).parents('.feature-note').hide();
    });

    $(".test-sso").live('click', function() {
        saasure.appHome.onTestSSOSettings();
    });

    $("#test-credentials-save").live('click', function() {
        $("#test-credentials-form").submit();
        $.modal.close();
    });

    $("#test-credentials-password,#test-credentials-username").bind("keyup", function() {
        var button = $('#test-credentials-save');
        var password = $("#test-credentials-password").val();
        var username = $("#test-credentials-username").val();
        if (password.length == 0 || username.length == 0) {
            button.addClass('ui-state-disabled').prop("disabled", true);
        } else {
            button.removeClass('ui-state-disabled').removeAttr("disabled");
        }
    });

    $("#test-credentials-cancel").live('click', function() {
        $.modal.close();
    });

    saasure.appHome.initConfirmDeactivateModal();

    saasure.appHome.initConfirmDeleteModal();

    $(".activate-app-link").live('click', function(e) {
        var me = $(this);
        var url = saasure.appHome.getAppChangeStatusUrl(me, "activate");
        e.preventDefault();
        $.ajaxSafeJson({
            url:url,
            type: "POST",
            success: function(response) {
                var oAuth2Metrics = saasure.appHome.getOAuth2Metrics();
                if (response.status == "success") {
                    if ($(me).attr('x-app-name') === 'oidc_client') {
                        var clientId = null;
                        $.ajaxSafeJson({
                            url: '/api/v1/internal/apps/' + $(me).attr('x-app-instance') + '/settings/clientcreds',
                            type: "GET",
                            success: function (response) {
                               clientId = response.client_id;
                            },
                            complete: function () {
                               var propertiesToTrack = {orgId: orgId, clientId: clientId};
                               oAuth2Metrics.track(EVENT_OAUTH_CLIENT_APP_ACTIVATED, propertiesToTrack);
                            }
                        });
                    }
                    $(".activate-app-link").parent().hide();
                    $(".deactivate-app-link").parent().show();
                    $(".delete-app-link").parent().hide();
                    $(".app-instance-status").text("Active");
                } else {
                    if (response.failureMessage) {
                        $("#app-activate-error-message").empty().append(response.failureMessage);
                    }
                    $("#app-activate-error").show();
                }
            }
        });
    });

    var dropDown=new saasure.Widget.DropDown();
    dropDown.options={
        showCheckSign: false,
        events:{
            onSelected:null
        }
    };
    dropDown.create();

    $(".explain-toggle").live('click', function(e) {
        e.preventDefault();
        var toggler = $(this);
        if (toggler.next(".explain-text").hasClass("hide")) {
            toggler.next(".explain-text").removeClass("hide");
        } else {
            toggler.next(".explain-text").addClass("hide");
        }
    });

    /**
     * SETTINGS TAB
     */


    $("label.signon-mode-option input:radio").live('click', function() {
        var optionType = $(this).attr("id").split(".").pop();
        saasure.appHome.onSignOnModeSelected(optionType, null);
    });

    $("input.signon-mode-option[name=option]").live('click', function() {
        saasure.appHome.onSignOnModeOptionSelected($(this));
    });

    $("#ssoSettings\\.cancel_link").live('click', function() {
        var selectedSignOnMode = $("input[id^='ssoSettings\\.read_only\\.mode\\.']:checked");
        if (selectedSignOnMode.length) {
            $("input#ssoSettings\\.mode\\." + selectedSignOnMode.val()).prop("checked", true);
        }
        var selectedSignOnModeOption = $("input[id^='ssoSettings\\.read_only\\.'][name='option-readonly']:checked");
        if (selectedSignOnModeOption.length) {
            $("#ssoSettings\\.edit\\.form input[value='" + selectedSignOnModeOption.val() + "']").prop("checked", true);
        }
    });

    /**
     * GENERAL TAB
     */
    $('.app-link-checkbox').live('click', function() {
        if ($(this).attr("readonly")) return false;

        var linkName = $(this).val();
        saasure.appHome.enableAppLink($(this).prop("checked"), this);
    });

    $(".app-link-image").live('click', function(e) {
        e.preventDefault();
        var linkName = $(this).attr("x-link");
        if (!linkName) return;

        var linkCheckbox = $("#settings\\.link\\." + linkName);
        if (linkCheckbox.prop("disabled") || linkCheckbox.attr("readonly")) {
            return;
        }

        linkCheckbox.prop("checked", !linkCheckbox.prop("checked"));
        saasure.appHome.enableAppLink(linkCheckbox.prop("checked"), this);
    });

});

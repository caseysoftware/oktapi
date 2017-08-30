saasure.AdminAppSignOnRuleListController = function() {
    var self = this;
    var appid;

    function init(appInstanceId) {
        // Registers a AdminAppSignOnRuleModal on the #app-sign-on-rule-modal-container
        var dialog = new saasure.AdminAppSignOnRuleModal(refreshList);
        appid = appInstanceId;
        // Registering add rule link
        $("#add-rule-button").die("click").live("click", function() {
            dialog.addRuleDialog(appInstanceId);
        });

        // Register edit buttons
        $(".edit-rule-button").each(function(index, element) {
            var ruleId = element.id.substring("edit-rule-button-".length);
            $("#edit-rule-button-" + ruleId).die("click").live("click", function () {
                dialog.editRuleDialog(ruleId);
            });
        });

        $(".delete-rule-button").each(function(index, element) {
            var ruleId = element.id.substring("delete-rule-button-".length);
            $("#delete-rule-button-" + ruleId).die("click");
        });

        ModalDialog.launchModalOnClick("a.delete-rule-button", '#confirm-delete-rule', {
            "show": onShowDeleteRuleDialog,
            "confirm": deleteRule,
            "killClickEvents": true });

        $(".move-rule-up-button").each(function(index, element) {
            var ruleId = element.id.substring("move-rule-up-button-".length);
            var elem = $("#move-rule-up-button-" + ruleId);
            elem.die("click");
            if (!elem.is(".disabled-link")) {
                elem.live("click", moveRule);
            }
        });

        $(".move-rule-down-button").each(function(index, element) {
            var ruleId = element.id.substring("move-rule-down-button-".length);
            var elem = $("#move-rule-down-button-" + ruleId);
            elem.die("click");
            if (!elem.is(".disabled-link")) {
                elem.live("click", moveRule);
            }
        });
    }

    function moveRule(move_event) {

        var button      = $($(move_event.target).parent("a"));
        var xsrfToken   = button.siblings("input[name='_xsrfToken']").val();
        var ruleid      = button.siblings("input[name='ruleid']").val();
        var newrank     = button.siblings("input[name='newrank']").val();
        var form_action = button.parent().attr("action");

        $.ajaxSafeJson({
            type:     "POST",
            url:     form_action,
            data:   { _xsrfToken: xsrfToken, ruleId: ruleid, newRank: newrank },
            success: refreshList
        });
        return false;

    }

    function onShowDeleteRuleDialog(button) {
        var name = $("#rule-name-" + $(button).parent("a").attr("id").substring("delete-rule-button-".length)).text();
        // .text escapes the value
        $(".dialog-rule-name").text(name);
    }

    function refreshList() {
        $.ajax("/admin/app/instance/" + appid + "/app-sign-on-policy-list", {success: refreshCallback});
    }

    function refreshCallback(res) {
        $("#policy-list-container").html(res);
        init(appid);
    }

    function deleteRule(delete_button) {
        var button      = $($(delete_button).parent("a"));
        var xsrfToken   = button.siblings("input[name='_xsrfToken']").val();
        var ruleid      = button.siblings("input[name='ruleid']").val();
        var form_action = button.parent().attr("action");

        $.ajaxSafeJson({
            type:     "POST",
            url:     form_action,
            data:   { _xsrfToken: xsrfToken, ruleId: ruleid },
            success: refreshList
        });
        return false;
    }

    this.init = init;

    return this;
};

saasure.AdminAppSignOnRuleModal = function (ruleChangedCallback) {
    var self = this,
        groupsApiUrl = '/api/v1/groups',
        zonesApiUrl = '/api/v1/org/zones',
        gasKeyNames = {
            'name': 'name',
            'id': 'id',
            'description': 'description',
            'usersCount': 'usersCount',
            'appsCount': 'appsCount',
            'groupPushMappingsCount': 'groupPushMappingsCount',
            'smallIconUrl': 'smallIconUrl',
            'mediumIconUrl': 'mediumIconUrl'
        },
        FORM_ID = "appsignonrule",
        WEB_AND_MODERN_AUTH_CLIENT_ID = "appsignonrule-selected-clientapplication_web-and-modern-auth",
        MODERN_AUTH_CLIENT_ID = "appsignonrule-selected-clientapplication_modern-auth",
        WEB_CLIENT_ID = "appsignonrule-selected-clientapplication_web",
        ACTIVE_SYNC_CLIENT_ID = "appsignonrule-selected-clientapplication_active-sync",
        IOS_PLATFORM_ID = "appsignonrule-selected-platform_ios",
        ANDROID_PLATFORM_ID = "appsignonrule-selected-platform_android",
        OTHER_MOBILE_PLATFORM_ID = "appsignonrule-selected-platform_mobile_other",
        WINDOWS_PLATFORM_ID = "appsignonrule-selected-platform_windows",
        OSX_PLATFORM_ID = "appsignonrule-selected-platform_osx",
        OTHER_DESKTOP_ID = "appsignonrule-selected-platform_desktop_other",
        deviceTrustFlagOn,
        deviceTrustDOM,
        deviceTrustNotEnabledText = _.template('<p>"Trusted" and "Not trusted" are available only after ' +
            'configuring <a href="/admin/access/device-trust" target="blank">Device Trust</a></p>', {});

    function loadDialogContent() {
        deviceTrustFlagOn =  (isOMMDeviceTrustIOSEnabled || isThirdPartyDeviceTrustIOSEnabled || isOMMDeviceTrustAndroidEnabled ||
            isThirdPartyDeviceTrustAndroidEnabled || isThirdPartyDeviceTrustWindowsEnabled || isThirdPartyDeviceTrustMACEnabled);
        AjaxForm.edit_mode(FORM_ID);
        AjaxForm.bind_events();
        $("#submit-button").die("click").live('click', (function() {
            setIds();
            if ($("#appsignonrule\\.gatewayIpAddresses").length) {
                $("#appsignonrule\\.gatewayIpAddresses").val($("#appsignonrule\\.gatewayIpAddresses").val().replace(/[^\d\.,\-\s]/gm,""));
            }
            if ($('#zones-container').length) {
                var allZonesSelected = $('#allZones').prop("checked");
                var zoneIds = allZonesSelected ? ['ALL_ZONES'] : zonesAutosuggest.getSelectedValues();
                if ($('#appsignonrule-location-in-zone').prop("checked")) {
                    $("#appsignonrule\\.includedZoneIdString").val(zoneIds.join(','));
                    $("#appsignonrule\\.excludedZoneIdString").val('');
                } else if ($('#appsignonrule-location-not-in-zone').prop("checked")) {
                    $("#appsignonrule\\.includedZoneIdString").val('');
                    $("#appsignonrule\\.excludedZoneIdString").val(zoneIds.join(','));
                } else {
                    $("#appsignonrule\\.includedZoneIdString").val('');
                    $("#appsignonrule\\.excludedZoneIdString").val('');
                }
            }
            if (isClientValid()) {
              AjaxForm.submit(FORM_ID);
              return true;
            }
        }));

        // Form setup
        createGroupsAutoSuggest();
        createUsersAutoSuggest();
        if ($("#zones-selector").length) {
            createZonesAutoSuggest();
        }

        /* apply qtips */
        $("#ip-address-tooltip").qtip({
            style: {
                name: 'dark',
                tip: true,
                width: {min: 200}
            },
            position: {
                corner: {target: 'topMiddle', tooltip: 'bottomMiddle'},
                adjust: {x: 0, y: -5}
            },
            hide: {fixed: true}
        });

        $("#ip-address-tooltip").live('click', function(e){
            // We want link interaction behavior, but we don't want it to refresh the page if they click it
            e.preventDefault();
        });

        $("#appsignonrule-all-users").die("click").live('click', showUserAndGroups);
        $("#appsignonrule-has-users-and-groups").die("click").live('click', showUserAndGroups);
        $("#appsignonrule\\.hasExcluded").die("click").live('click', showExcludedUserAndGroups);
        $("#appsignonrule-action-select").die("change").live('change', showAllowOptionsDiv);
        $("#appsignonrule-action-reauth").die("click").live('click', showReauthSettingsDiv);
        $("#appsignonrule-action-second-factor").die("click").live('click', showMultifactorDiv);
        $("#clientIPWrapper").die("click").click( function() {
            var clientIP = $("#clientIP").text();
            var ipAddressesField = $("#appsignonrule\\.gatewayIpAddresses").last();
            ipAddressesField.val(ipAddressesField.val() + "\n" + clientIP);
        });

        if ($('.gateway-ip-container').length) {
            $("#appsignonrule-location-anywhere").die("click").live('click', showGatewayIPDiv);
            $("#appsignonrule-location-on-network").die("click").live('click', showGatewayIPDiv);
            $("#appsignonrule-location-off-network").die("click").live('click', showGatewayIPDiv);
        }
        if ($("#zones-container").length) {
            $("#appsignonrule-location-any-zone").die("click").live('click', showZonesDiv);
            $("#appsignonrule-location-in-zone").die("click").live('click', showZonesDiv);
            $("#appsignonrule-location-not-in-zone").die("click").live('click', showZonesDiv);
            $('#allZones').die("click").live('click', showZonesSelector);
        }
        
        if (isClientFilterEnabled && !isO365AppSignonClientFilterEnabled) {
          $("#appsignonrule-client-any").die("click").live("click", enableSelectedClientsCheckboxes).live("click", enableMultifactor);
          $("#appsignonrule-client-selected").die("click").live("click", enableSelectedClientsCheckboxes);
          $("#selected-clients-container").undelegate().delegate("input:checkbox", "click", enableMultifactor);
        } else {
          if (isO365App && isO365AppSignonClientFilterEnabled && !isO365ModernAuthDistinctionFilterEnabled) {
            $("#" + WEB_AND_MODERN_AUTH_CLIENT_ID).die("click").live("click", function() {
              enableMultifactor();
              if (deviceTrustFlagOn) {
                toggleDeviceTrust();
              }
            });
            $("#" + ACTIVE_SYNC_CLIENT_ID).die("click").live("click", function() {
              enableMultifactor();
              if (deviceTrustFlagOn) {
                toggleDeviceTrust();
              }
            });
          }
          if (isO365App && isO365ModernAuthDistinctionFilterEnabled) {
            $("#" + MODERN_AUTH_CLIENT_ID).die("click").live("click", function () {
                enableMultifactor();
                if (deviceTrustFlagOn) {
                    toggleDeviceTrust();
                }
            });
            $("#" + WEB_CLIENT_ID).die("click").live("click", function () {
                enableMultifactor();
                if (deviceTrustFlagOn) {
                    toggleDeviceTrust();
                }
            });
            $("#" + ACTIVE_SYNC_CLIENT_ID).die("click").live("click", function() {
                enableMultifactor();
                if (deviceTrustFlagOn) {
                    toggleDeviceTrust();
                }
            });
          }
          if (deviceTrustFlagOn) {
            $("#" + IOS_PLATFORM_ID).die("click").live("click", toggleDeviceTrust);
            $("#" + ANDROID_PLATFORM_ID).die("click").live("click", toggleDeviceTrust);
            $("#" + OTHER_MOBILE_PLATFORM_ID).die("click").live("click", toggleDeviceTrust);
            $("#" + WINDOWS_PLATFORM_ID).die("click").live("click", toggleDeviceTrust);
            $("#" + OSX_PLATFORM_ID).die("click").live("click", toggleDeviceTrust);
            $("#" + OTHER_DESKTOP_ID).die("click").live("click", toggleDeviceTrust);
          }
        }

        // Modal setup

        $("#app-sign-on-rule-dialog").modal({
            minWidth: 800,
            closeClass: "button_no",
            onClose: function() {
                ruleChangedCallback();
                $.modal.close();
            }
        });

        setInitialValues();
    }

    function addRuleDialog(instanceId) {
        $("#app-sign-on-rule-modal-content").load(
            "/admin/policy/app-sign-on-rule/instance/" + instanceId,
            loadDialogContent);
    }

    function editRuleDialog(ruleId) {
        $("#app-sign-on-rule-modal-content").load(
            "/admin/policy/app-sign-on-rule/" + ruleId,
            loadDialogContent);
    }

    /**
     * flatten one group's json
     */
    function flattenOneGroupJson(itemObj) {
        var newData = {};
        // jquery.autosuggest lib will highlight the matching letters by wrapping <em></em> around
        // before it does that, escape html
        // the rest will be escaped in template, see function formatList and selectionAdded
        newData[gasKeyNames.name] = saasure.util.escapeHtml(itemObj.profile.name);
        newData[gasKeyNames.id] = itemObj.id;
        newData[gasKeyNames.description] = itemObj.profile.description;
        newData[gasKeyNames.usersCount] = itemObj._embedded.stats.usersCount;
        newData[gasKeyNames.appsCount] = itemObj._embedded.stats.appsCount;
        newData[gasKeyNames.groupPushMappingsCount] = itemObj._embedded.stats.groupPushMappingsCount;
        newData[gasKeyNames.sourceAppName] = itemObj._embedded.app ? itemObj._embedded.app.label : undefined;

        var logoLinks = itemObj._links.logo;
        // TODO-20857:
        // when response with the link is ready, retrieve logo href from oneItemData
        newData[gasKeyNames.smallIconUrl] = _.findWhere(logoLinks, {name: 'medium'}).href;
        newData[gasKeyNames.mediumIconUrl] = _.findWhere(logoLinks, {name: 'medium'}).href;
        return newData;
    }

    /**
     * Initialize the autoSuggest widget
     * OKTA-20857
     * Disambiugate group picker
     */
    function createGroupsAutoSuggest() {
        var groupName = gasKeyNames.name,
            idName = gasKeyNames.id,
            gasOptions = $.extend({}, {
                startText: 'Type group to add...',
                selectedItemProp: groupName,
                selectedValuesProp: idName,
                searchObjProps: groupName,
                retrieveLimit: 20,
                extraParams:"&expand=stats,app",
                retrieveComplete:function(apiResponseData){
                    return _.map(apiResponseData, function (oneGroupJson) {
                        return flattenOneGroupJson(oneGroupJson);
                    });
                },
                formatList: function (oneItemData, formatted) {
                    // jquery.autosuggest lib has highlighted the matching letters in selectedItemProp by wrapping <em></em> around
                    // the original groupName has been escaped, see function flattenOneGroupJson
                    // escape the rest in template, also see function selectionAdded
                    formatted.html(_.template('<div class="clearfix" style="white-space: normal;">\
                                    <span class="link-button link-button-small">Add</span>\
                                    <div class="group-medium-app-logo-wrapper"><img class="app-logo" src="<%- ' + gasKeyNames.mediumIconUrl + '%>"/></div>\
                                    <div class="group-desc">\
                                    <h3 class="group-desc-header"><%= ' + groupName + '%></h3>\
                                    <% if (' + gasKeyNames.sourceAppName + ') { %><span class="group-desc-info"><%- ' + gasKeyNames.sourceAppName + '%> &#183; </span><% } %>\
                                    <span class="group-desc-info"><%- ' + gasKeyNames.description + '%></span>\
                                    <ul class="group-desc-stats">\
                                    <li class="icon-16"><span class="icon person-16-gray"></span><%- ' + gasKeyNames.usersCount + '%></li>\
                                    <li class="icon-16"><span class="icon app-16-gray"></span><%- ' + gasKeyNames.appsCount + '%></li>\
                                    <% if (' + gasKeyNames.groupPushMappingsCount + '> 0) { %><li class="icon-16"><span class="icon inactive-sync-16"></span><%- ' + gasKeyNames.groupPushMappingsCount + '%> apps</li><% } %>\
                                    </ul>\
                                    </div>\
                                    </div>', oneItemData));
                    return formatted;
                },
                selectionAdded: function (selectedItem, oneItemData) {
                    // TODO-20857: remove image resizing when response with the link is ready
                    selectedItem.prepend(_.template('<span class="group-small-app-logo-wrapper"><img style="width:16px; height:16px;" class="logo" src="<%- ' + gasKeyNames.smallIconUrl + '%>"/></span>', oneItemData));
                }
        });

        var gasContainer = $('#group-autosuggest');
        groupsAutosuggest = new saasure.Widget.AutoSuggest();
        groupsAutosuggest.create(gasContainer, groupsApiUrl, gasOptions);

        var excludedGasContainer = $("#excluded-group-autosuggest");
        excludedGroupsAutosuggest = new saasure.Widget.AutoSuggest();
        excludedGroupsAutosuggest.create(excludedGasContainer, groupsApiUrl, gasOptions);
    }
    /**
     * Initialize the autoSuggest widget
     */
    function createUsersAutoSuggest() {
        var usersAutosuggestOptions = {startText: "Type user to add..."};

        var usersAutosuggestContainer = $("#user-autocomplete");
        usersAutosuggest = new saasure.Widget.AutoSuggest();
        usersAutosuggest.create(usersAutosuggestContainer, "/admin/users/as", usersAutosuggestOptions);

        var excludedUsersAutosuggestContainer = $("#excluded-user-autocomplete");
        excludedUsersAutosuggest = new saasure.Widget.AutoSuggest();
        excludedUsersAutosuggest.create(excludedUsersAutosuggestContainer, "/admin/users/as", usersAutosuggestOptions);
    }

    function createZonesAutoSuggest() {
        var zonesAutosuggestOptions = {
            startText: "Type zone to add...",
            selectedItemProp: "name",
            selectedValuesProp: "id",
            searchObjProps: "name",
            retrieveComplete:function(apiResponseData){
                return _.map(apiResponseData, function (zoneJson) {
                    var newData = {};
                    newData["name"] = saasure.util.escapeHtml(zoneJson.name);
                    newData["id"] = zoneJson.id;
                    return newData;
                });
            }
        };

        var zonesAutosuggestContainer = $("#zone-autocomplete");
        zonesAutosuggest = new saasure.Widget.AutoSuggest();
        zonesAutosuggest.create(zonesAutosuggestContainer, zonesApiUrl, zonesAutosuggestOptions);
    }

    function fillAutosuggest(ids, widget) {
        _.each(ids, function(id) {
            if (id) {
                var name = names[id];
                var selection = {};
                selection["k"] = name;
                selection["v"] = id;
                widget.addInitialSelection(selection, id);
            }
        });
    }

    function fillZonesAutosuggest(ids, widget) {
        $.getSafeJson(zonesApiUrl + '?limit=' + ids.length + '&filter=id eq "' + _.values(ids).join('" or id eq "') + '"', function (data) {
            _.each(ids, function(id) {
                var tmpZone = _.findWhere(data, {id: id});
                if (id && tmpZone) {
                    var name = names[id] = _.escape(tmpZone.name);
                    var selection = {};
                    selection["name"] = name;
                    selection["id"] = id;
                    widget.addInitialSelection(selection, id);
                }
            });
        });
    }

    function fillGroupsAutoSuggest(ids, widget) {
        $.getSafeJson(groupsApiUrl + '?filter=id eq "' + _.keys(names).join('" or id eq "') + '"&expand=stats', function (data) {
            _.each(ids, function(id) {
                if (id) {
                    var tempGroup = _.findWhere(data, {id: id});
                    if (tempGroup) {
                        widget.addInitialSelection(flattenOneGroupJson(tempGroup), id);
                        delete data[tempGroup];
                    }
                }
            });
        });
    }

    function showUserAndGroups() {
        if ($("#appsignonrule-has-users-and-groups").prop("checked")) {
            $("#appsignonrule-user-and-groups").show();
        } else {
            $("#appsignonrule-user-and-groups").hide();
        }
    }

    function showExcludedUserAndGroups() {
        if ($("#appsignonrule\\.hasExcluded").prop("checked")) {
            $("#appsignonrule-excluded-user-and-groups").show();
        } else {
            $("#appsignonrule-excluded-user-and-groups").hide();
        }
    }

    function showAllowOptionsDiv() {
        if ($("#appsignonrule-action-select option:selected").val() == 'ALLOW') {
            $("#appsignonrule-action-allow-options").show();
        } else {
            $("#appsignonrule-action-allow-options").hide();
        }

        showReauthSettingsDiv();
        showMultifactorDiv();
    }

    function showReauthSettingsDiv() {
        if ($("#appsignonrule-action-reauth").is(":checked")) {
            $("#appsignonrule-action-reauth-settings").show();
        } else {
            $("#appsignonrule-action-reauth-settings").hide();
        }
    }

    function showMultifactorDiv() {
        if ($("#appsignonrule-action-second-factor").is(":checked")) {
            if (isRadiusApp) {
                // RADIUS apps don't need to see the factor lifetime options
                // and by default the value is "Every Sign On"
                $("#appsignonrule-multifactor-container").hide();
                if (this.form) {
                    this.form.factorLifetime.value = "ZERO";
                }
            } else {
                $("#appsignonrule-multifactor-container").show();
            }
        } else {
            $("#appsignonrule-multifactor-container").hide();
        }
    }

    function showGatewayIPDiv() {
        if ($("#appsignonrule-location-on-network").is(":checked") ||
            $("#appsignonrule-location-off-network").is(":checked")) {
            $(".gateway-ip-container").show();
        } else {
            $(".gateway-ip-container").hide();
        }
    }

    function enableSelectedClientsCheckboxes() {
        if ($("#appsignonrule-client-any").is(":checked")) {
            $("#selected-clients-container").find("input:checkbox").prop("disabled", "disabled").parent().addClass("text-light");
            $("#selected-clients-container").find("input:checkbox").prop("checked", "true");
        } else {
            $("#selected-clients-container").find("input:checkbox").removeAttr("disabled").parent().removeClass("text-light");
        }
    }

    // This is being done for the rules that had been created before the Platform FF was turned on. 
    // Now, when the FF is turned on, there are no platforms selected for Mobile. 
    // We have handled this in the backend code but we still need to select the platforms on the UI so the customers understand that by default, both the platforms are selected.
    function selectAllPlatformsWhenFeatureFlagIsTurnedOnForExistingRules() {
        var $mobileClientCheckbox = $('input[id="appsignonrule-selected-client-mobile"]');
        var $mobileIosPlatformCheckbox = $('input[id="appsignonrule-selected-platform-mobile-mobile_ios"]');
        var $mobileOthersPlatformCheckbox = $('input[id="appsignonrule-selected-platform-mobile-mobile_other"]');

        if ((_features.indexOf('CLIENT_ACCESS_POLICY_MOBILE_PLATFORM_GRANULARITY') !== -1)
            && $mobileClientCheckbox.prop('checked')
            && !$mobileIosPlatformCheckbox.prop('checked')
            && !$mobileOthersPlatformCheckbox.prop('checked')) {

            $mobileIosPlatformCheckbox.prop('checked', true);
            $mobileOthersPlatformCheckbox.prop('checked', true);
        }
    }

    function enableMultifactor() {
        if ($("#second-factor-enabled-container, #client-container").length === 2) {
            if (isO365App && isO365AppSignonClientFilterEnabled && !isO365ModernAuthDistinctionFilterEnabled) {
                if ($("#" + WEB_AND_MODERN_AUTH_CLIENT_ID).is(":checked") &&
                    !$("#" + ACTIVE_SYNC_CLIENT_ID).is(":checked")) {
                    $("#appsignonrule-mfa-action-unavailable").hide();
                    $("#appsignonrule-action-second-factor").removeAttr("disabled").parent().removeClass("text-light");
                } else {
                    $("#appsignonrule-mfa-action-unavailable").show();
                    $("#appsignonrule-action-second-factor").prop("disabled", "disabled").removeAttr("checked").parent().addClass("text-light");
                }
            } else if (isO365App && isO365ModernAuthDistinctionFilterEnabled) {
                if (($("#" + WEB_CLIENT_ID).is(":checked") ||
                    $("#" + MODERN_AUTH_CLIENT_ID).is(":checked")) &&
                    !$("#" + ACTIVE_SYNC_CLIENT_ID).is(":checked")) {
                    $("#appsignonrule-mfa-action-unavailable").hide();
                    $("#appsignonrule-action-second-factor").removeAttr("disabled").parent().removeClass("text-light");
                } else {
                    $("#appsignonrule-mfa-action-unavailable").show();
                    $("#appsignonrule-action-second-factor").prop("disabled", "disabled").removeAttr("checked").parent().addClass("text-light");
                }
            } else if (!isOtherAppSignonClientFilterEnabled) {
                if ($("#appsignonrule-selected-client-web").is(":checked") &&
                    !$("#appsignonrule-client-any, #appsignonrule-selected-client-desktop, #appsignonrule-selected-client-mobile").is(":checked")) {
                    $("#appsignonrule-mfa-action-unavailable").hide();
                    $("#appsignonrule-action-second-factor").removeAttr("disabled").parent().removeClass("text-light");
                } else {
                    $("#appsignonrule-mfa-action-unavailable").show();
                    $("#appsignonrule-action-second-factor").prop("disabled", "disabled").removeAttr("checked").parent().addClass("text-light");
                }
            }
            showMultifactorDiv();
        }
    }

    // Set device Trust text expalining why the UI is not enabled. 
    function setDeviceTrustText() {
      var enabledPlatforms = []; 
      if (deviceTrustMobileConfigured && (isOMMDeviceTrustIOSEnabled || isThirdPartyDeviceTrustIOSEnabled)) {
        enabledPlatforms.push('IOS');
      } 

      if (deviceTrustMobileConfigured && (isOMMDeviceTrustAndroidEnabled || isThirdPartyDeviceTrustAndroidEnabled)) {
        enabledPlatforms.push('Android');
      }

      if (deviceTrustDesktopConfigured && isThirdPartyDeviceTrustWindowsEnabled) {
        enabledPlatforms.push('Windows');
      }

      if (deviceTrustDesktopConfigured && isThirdPartyDeviceTrustMACEnabled) {
        enabledPlatforms.push('Mac');
      }

      var displayText = enabledPlatforms.join(', ') + '.';
      if (enabledPlatforms.length > 1) {
        displayText = displayText.replace(/,(?=[^,]*$)/, ' and');
      }

      var baseText = isO365App ? '"Trusted" and "Not trusted" are only available for Web Browser or Modern Auth clients on ' :
          '"Trusted" and "Not trusted" are available only for ';
      deviceTrustDOM.append(_.template(baseText + displayText, {}));
    }

    function toggleDeviceTrust() {
      deviceTrustDOM = $('#device-trust-explain-text');
      deviceTrustDOM.empty();
      var iOSIsSelected = $("#" + IOS_PLATFORM_ID).is(":checked");
      var androidIsSelected = $("#" + ANDROID_PLATFORM_ID).is(":checked");
      var otherMobileIsSelected = $("#" + OTHER_MOBILE_PLATFORM_ID).is(":checked");
      var windowsIsSelected = $("#" + WINDOWS_PLATFORM_ID).is(":checked");
      var macOSIsSelected = $("#" + OSX_PLATFORM_ID).is(":checked");
      var otherDesktopIsSelected = $("#" + OTHER_DESKTOP_ID).is(":checked");
      // For O365 clients
      var exchangeActiveSyncIsSelected = $('#' + ACTIVE_SYNC_CLIENT_ID).is(":checked");
      var webModernAuthClientIsSelected = $('#' + WEB_AND_MODERN_AUTH_CLIENT_ID).is(":checked");

      if(isO365ModernAuthDistinctionFilterEnabled) {
        var webIsSelected = $('#' + WEB_CLIENT_ID).is(":checked");
        var modernAuthIsSelected = $('#' + MODERN_AUTH_CLIENT_ID).is(":checked");
      }
      var enable = true;

      if (!deviceTrustDesktopConfigured && !deviceTrustMobileConfigured) {
        deviceTrustDOM.append(deviceTrustNotEnabledText);
        doToggleDeviceTrust(false);
        return;
      } else if (((otherMobileIsSelected || iOSIsSelected || androidIsSelected) && !deviceTrustMobileConfigured) ||
          ((otherDesktopIsSelected || windowsIsSelected || macOSIsSelected) && !deviceTrustDesktopConfigured)) {
        // Set text and return if platform device is selected but deviceTrust for the platform is not enabled.
        deviceTrustDOM.append(deviceTrustNotEnabledText);
        doToggleDeviceTrust(false);
        return;
      } else if (!(iOSIsSelected || androidIsSelected || otherMobileIsSelected || windowsIsSelected ||
          macOSIsSelected || otherDesktopIsSelected)) {
        // disable device trust when none of the platform is selected
        doToggleDeviceTrust(false);
        return;
      } else if (isO365App && !(isO365ModernAuthDistinctionFilterEnabled) && (exchangeActiveSyncIsSelected || !webModernAuthClientIsSelected)) {
        // disable device trust when app is O365 and exchange active sync is selected
        // or web and modern auth client is not selected.
        enable = false;
      } else if (isO365App && isO365ModernAuthDistinctionFilterEnabled && (exchangeActiveSyncIsSelected || (!webIsSelected && !modernAuthIsSelected))) {
          // disable device trust when app is O365 and exchange active sync is selected
          // or web is not selected or modern auth client is not selected.
        enable = false;
      } else if (otherMobileIsSelected || otherDesktopIsSelected) {
        // disable device trust when
        // "Other mobile" and/or "Other desktop" is selected
        enable = false;
      } else if (iOSIsSelected && !(isOMMDeviceTrustIOSEnabled || isThirdPartyDeviceTrustIOSEnabled)) {
        // disable device trust when
        // iOS is selected and
        // the org does not have one of the following two flags enabled: OMM_DEVICE_TRUST_IOS_DEVICE or THIRD_PARTY_DEVICE_TRUST_IOS_DEVICE
        enable = false;
      } else if (androidIsSelected && !(isOMMDeviceTrustAndroidEnabled || isThirdPartyDeviceTrustAndroidEnabled)) {
        // disable device trust when
        // Android is selected and
        // the org does not have one of the following two flags enabled: OMM_DEVICE_TRUST_ANDROID_DEVICE or THIRD_PARTY_DEVICE_TRUST_ANDROID_DEVICE
        enable = false;
      } else if (windowsIsSelected && !isThirdPartyDeviceTrustWindowsEnabled) {
        // disable device trust when
        // Windows is selected but the org does not have THIRD_PARTY_DEVICE_TRUST_WINDOWS enabled
        enable = false;
      } else if (macOSIsSelected && !isThirdPartyDeviceTrustMACEnabled) {
        // disable device trust when
        // macOS is selected but the org does not have THIRD_PARTY_DEVICE_TRUST_MAC enabled
        enable = false;
      }

      doToggleDeviceTrust(enable);
      // If not enabled show the reason why it is not enabled.
      if (!enable) {
        setDeviceTrustText();
      }
    }

    function doToggleDeviceTrust(enable) {
      var anyDevicedOption = $("#appsignonrule-device-any");
      var trustedDeviceOption = $("#appsignonrule-device-trusted");
      var notTrustedDeviceOption = $("#appsignonrule-device-not_trusted");
      if (enable) {
        enableInput(trustedDeviceOption);
        enableInput(notTrustedDeviceOption);
      } else {
        anyDevicedOption.prop("checked", "checked");
        disableInput(trustedDeviceOption);
        disableInput(notTrustedDeviceOption);
      }
    }

    function isClientValid() {
        var errors = [];
      if ((isO365AppSignonClientFilterEnabled && isO365App) || (isOtherAppSignonClientFilterEnabled && !isO365App)) {
        if (!(
          $("#" + IOS_PLATFORM_ID).is(":checked") ||
          $("#" + ANDROID_PLATFORM_ID).is(":checked") ||
          $("#" + OTHER_MOBILE_PLATFORM_ID).is(":checked") ||
          $("#" + WINDOWS_PLATFORM_ID).is(":checked") ||
          $("#" + OSX_PLATFORM_ID).is(":checked") ||
          $("#" + OTHER_DESKTOP_ID).is(":checked"))) {
            errors.push("An user's platform is required for policy rule");
        }
      }
      if (isO365App && isO365AppSignonClientFilterEnabled && !isO365ModernAuthDistinctionFilterEnabled) {
        if (!($("#" + WEB_AND_MODERN_AUTH_CLIENT_ID).is(":checked") ||
              $("#" + ACTIVE_SYNC_CLIENT_ID).is(":checked"))) {
          errors.push("An user's client is required for policy rule");
        }
      }
      if (isO365App && isO365ModernAuthDistinctionFilterEnabled) {
          if (!($("#" + WEB_CLIENT_ID).is(":checked") ||
                  $("#" + MODERN_AUTH_CLIENT_ID).is(":checked") ||
                  $("#" + ACTIVE_SYNC_CLIENT_ID).is(":checked"))) {
            errors.push("An user's client is required for policy rule");
          }
      }
      if (errors.length > 0) {
        AjaxForm.render_errors(FORM_ID, errors);
        return false;
      }
      return true;
    }

    function enableInput(jqueryObj) {
      jqueryObj && jqueryObj.removeAttr("disabled").parent().removeClass("text-light");
    }

    function disableInput(jqueryObj) {
      jqueryObj && jqueryObj.prop("disabled", "disabled").removeAttr("checked").parent().addClass("text-light");
    }

    function showZonesDiv() {
        if ($("#appsignonrule-location-in-zone").is(":checked") ||
            $("#appsignonrule-location-not-in-zone").is(":checked")) {
            $("#zones-container").show();
        } else {
            $("#zones-container").hide();
        }
    }

    function showZonesSelector() {
        if ($("#allZones").is(":checked")) {
            $("#zones-selector").hide();
        } else {
            $("#zones-selector").show();
        }
    }

    function setZonesInitialValues(zoneIds) {
        if (zoneIds.indexOf('ALL_ZONES') >= 0) {
            $('#allZones').prop("checked", true);
        } else {
            var selectedIds = zoneIds.split(",");
            fillZonesAutosuggest(selectedIds, zonesAutosuggest);
        }
    }

    function setInitialValues() {
        var selectedIds =  $("#appsignonrule\\.includedGroupIdString").val().split(",");
        fillGroupsAutoSuggest(selectedIds, groupsAutosuggest);
        selectedIds =  $("#appsignonrule\\.includedUserIdString").val().split(",");
        fillAutosuggest(selectedIds, usersAutosuggest);
        selectedIds =  $("#appsignonrule\\.excludedGroupIdString").val().split(",");
        fillGroupsAutoSuggest(selectedIds, excludedGroupsAutosuggest);
        selectedIds =  $("#appsignonrule\\.excludedUserIdString").val().split(",");
        fillAutosuggest(selectedIds, excludedUsersAutosuggest);

        var includedIds =  $("#appsignonrule\\.includedZoneIdString").val();
        var excludedIds =  $("#appsignonrule\\.excludedZoneIdString").val();
        if (includedIds) {
            $("#appsignonrule-location-in-zone").prop("checked", true);
            setZonesInitialValues(includedIds);
        } else if (excludedIds) {
            $("#appsignonrule-location-not-in-zone").prop("checked", true);
            setZonesInitialValues(excludedIds);
        }

        showUserAndGroups();
        showExcludedUserAndGroups();
        showAllowOptionsDiv();
        if ($('.gateway-ip-container').length) {
            showGatewayIPDiv();
        }
        if ($("#zones-container").length) {
            showZonesDiv();
            showZonesSelector();
        }
        enableSelectedClientsCheckboxes();
        selectAllPlatformsWhenFeatureFlagIsTurnedOnForExistingRules();
        if (deviceTrustFlagOn) {
          toggleDeviceTrust();
        }
        enableMultifactor();
    }

    /**
     * Include the selected groupIds in the form data to be submitted
     */
    function setIds() {
        $("#appsignonrule\\.includedGroupIdString").val(groupsAutosuggest.getSelectedValues().join(','));
        $("#appsignonrule\\.includedUserIdString").val(usersAutosuggest.getSelectedValues().join(','));
        $("#appsignonrule\\.excludedGroupIdString").val(excludedGroupsAutosuggest.getSelectedValues().join(','));
        $("#appsignonrule\\.excludedUserIdString").val(excludedUsersAutosuggest.getSelectedValues().join(','));
    }

    // Public functions
    this.addRuleDialog = addRuleDialog;
    this.editRuleDialog = editRuleDialog;

    return this;
};

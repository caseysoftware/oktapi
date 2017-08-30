var AutofillSection = function(app, instanceId) {
    $("#ssoSettings\\.autofill").liveUnique('change', function() {

        var selectBoxValue = $(this).val();
        var suffixLabel = $("#userSuffix-section p.explain-text");
        var customRuleSection = $("#customRule-section");
        var customRuleLink = $("#customRule-section-link");
        var suffixSection = $("#userSuffix-section");

        // set the suffix text field label appropriately
        if (selectBoxValue.indexOf("global.assign.userName.custom-default.custom.suffix") != -1) {
            suffixLabel.html("Custom Default");
        } else if (selectBoxValue.indexOf("global.assign.userName.custom.suffix.login-prefix") != -1) {
            suffixLabel.html("Configurable Prefix");
        } else {
            suffixLabel.html("Configurable Suffix");
        }


        // show the suffix text field if needed, hide otherwise
        if (selectBoxValue.indexOf("custom.suffix") != -1) {
            suffixSection.removeClass('hide');
        } else {
            suffixSection.addClass('hide');
        }

        //TODO: Change to what the name of the rule is actually going to be
        if(selectBoxValue.indexOf("global.assign.userName.customExpression") != -1) {
            customRuleSection.removeClass('hide');
            customRuleLink.removeClass('hide');
        } else {
            customRuleSection.addClass('hide');
            customRuleLink.addClass('hide');
        }
    });
};

var SelfServiceWarning = function() {
  toggleSelfServiceWarning();

  $("#ssoSettings\\.autofill").liveUnique('change', function () {
    toggleSelfServiceWarning()
  });

  $("input[name='option']").change(function () {
    toggleSelfServiceWarning();
  });

  function toggleSelfServiceWarning() {
    if ($("#ssoSettings\\.autofill").val() && $("#ssoSettings\\.autofill").val().indexOf("global.assign.userName.none") != -1
      && ($("input[name='option']:checked").val() == 'EDIT_PASSWORD_ONLY' ||
        $("input[name='option']:checked").val() == 'EXTERNAL_PASSWORD_SYNC' ||
        $("input[name='option']:checked").val() == 'ADMIN_SETS_CREDENTIALS')) {
      $("#self-service-disabled").show();
    } else {
      $("#self-service-disabled").hide();
    }
  }
}

var SsoTab = function () {

  // when iframe loads, pass the certId to the settings
  $("#ssoSettingsCert").load(function () {
    var contents = $("#ssoSettingsCert").contents();
    var certId = contents.find("input[id='samlCertificateId']").val();
    $("input[name=samlCertificateId]").val(certId);
  });

};

var SloSection = function () {
  $("#ssoSettingsSignatureCert").load(function () {
    var contents = $("#ssoSettingsSignatureCert").contents();
    var certId = contents.find("input[id='samlSPSignatureCertificateId']").val();
    $("input[name=samlSPSignatureCertificateId]").val(certId);
  });
  $("input[name='enableSlo']").change(function (e) {
    updateEditableSloFields(e.target.checked);
  });
  $("#ssoSettings\\.button\\.submit").click(function (e) {
    var sloEnabled = $("input[name='enableSlo']").is(':checked');
    updateEditableSloFields(sloEnabled);
    updateViewOnlySloFields(sloEnabled);
  });
  $("#ssoSettings\\.button\\.cancel").click(function (e) {
    var sloEnabled = $("#enableSloViewOnly").is(':checked');
    updateEditableSloFields(sloEnabled);
    updateViewOnlySloFields(sloEnabled);
  });
  $("#ssoSettings\\.cancel_link").click(function (e) {
    var sloEnabled = $("#enableSloViewOnly").is(':checked');
    updateEditableSloFields(sloEnabled);
    updateViewOnlySloFields(sloEnabled);
  });

  function updateEditableSloFields(isChecked) {
    if (isChecked) {
      $("input[name='enableSlo']").prop('checked','checked');
      $("#enableSloPlaceholder").prop('disabled','disabled');
      $("#ssoSettingsSignatureCert").show();
    } else {
      $("input[name='enableSlo']").removeAttr('checked');
      $("#enableSloPlaceholder").removeAttr('disabled');
      $("#ssoSettingsSignatureCert").hide();
    }
  };

  function updateViewOnlySloFields(isChecked) {
    if (isChecked) {
      $("#enableSloViewOnly").prop('checked','checked');
      $("#enableSloSignatureText").show();
      $("#enableSloSignatureValue").show();
    } else {
      $("#enableSloViewOnly").removeAttr('checked');
      $("#enableSloSignatureText").hide();
      $("#enableSloSignatureValue").hide();
    }
  };
    
  if ($("#enableSloViewOnly").is(':checked')) {
    $("#enableSloSignatureText").show();
    $("#enableSloSignatureValue").show();
  } else {
    $("#enableSloSignatureText").hide();
    $("#enableSloSignatureValue").hide();
  }
};

var O365SSOSection = function () {
    $("#ssoSettings\\.button\\.submit").click(function (e) {
        if ($("#O365SSOWSFedAuto").is(':checked')) {
            $("#adminUsernameLabelViewOnly").show();
            $("#adminUsernameValueViewOnly").show();
            $("#adminPasswordLabelViewOnly").show();
            $("#adminPasswordValueViewOnly").show();
        } else {
            $("#adminUsernameLabelViewOnly").hide();
            $("#adminUsernameValueViewOnly").hide();
            $("#adminPasswordLabelViewOnly").hide();
            $("#adminPasswordValueViewOnly").hide();
        }
    });
};
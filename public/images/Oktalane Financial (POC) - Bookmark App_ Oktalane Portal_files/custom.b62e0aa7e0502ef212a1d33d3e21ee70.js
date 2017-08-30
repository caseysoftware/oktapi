var AdvancedSettingsBehavior=function(sandboxOnly){
    this.init=function(){
        function toggleSandboxLoginURL(show) {
            if (show) {
                $(".x-settings-properties").removeClass("hide");
            } else {
                $(".x-settings-properties").addClass("hide");
            }
        }

        function toggleModeSpecificFields(mode) {
            var el=$("#settings\\.instanceType");
            var instanceType = el.is("select")? el.val():el.text().trim().toUpperCase();

            toggleSandboxLoginURL(mode == "SAML_2_0" && (!sandboxOnly || instanceType == "SANDBOX"));
        }

        var selector = "#ssoSettings\\.edit\\.form .show-instructions-onload input:radio:checked";

        var optionType = $(selector).val();
        toggleModeSpecificFields(optionType);

        $("label.signon-mode-option").live('click', function(){
            var optionType = $(this).find("input").val();
            toggleModeSpecificFields(optionType);
        });
    };

};


$(function(){
    var appName=window.appName;
    if (!appName) appName = settings.appName;

    if (appName == "salesforce") {
        var advancedSettingsBehavior = new AdvancedSettingsBehavior(false);
        advancedSettingsBehavior.init();
    } else if (appName == "jobscience"){
        var sandBoxBehavior = new AdvancedSettingsBehavior(true);
        sandBoxBehavior.init();
    }
});
var OktaAppInstanceGeneralTab = function () {
    var _skipFormSubmissionsChecks = false;
    var _currentlySupportsCustomUserManagement = false;

    this.init = function (currentlySupportsCustomUserManagement) {
        _currentlySupportsCustomUserManagement = currentlySupportsCustomUserManagement;

        $('#remove-um-submit').live('click', function () {
            submitFormWithReloadAfterSuccess();
        });
        $('#remove-um-cancel').live('click', function () {
            $.modal.close();
        });
    }

    this.onSettingsFormSubmit = function () {
        if (_skipFormSubmissionsChecks) {
            _skipFormSubmissionsChecks = false;
            return true;
        }
        //always reset this back to false
        _skipFormSubmissionsChecks = false;

        var oppUmCheckbox = $("#settings\\.customUserManagementSupport");
        if (oppUmCheckbox.length > 0) {
            var currentlyChecked = oppUmCheckbox.prop("checked");
            if (_currentlySupportsCustomUserManagement != currentlyChecked) {
                //when the user has changed the value for customUserManagementSupport we need to make sure the page is
                //refreshed after the form is submitted.
                if (!currentlyChecked) {
                    //when they want to remove custom UM, prompt them first.
                    var dlg = $("#remove-um-dialog");
                    dlg.modal({
                        escClose: true,
                        overlayClose: true,
                        minHeight: 400,
                        minWidth: 500,
                        persist: true
                    });
                } else {
                    submitFormWithReloadAfterSuccess();
                }
                return false;
            }
        }

        return true;
    }

    this.onSettingsFormSubmitSuccess = function () {
        $.modal.close();
    }

    this.onSettingsFormSubmitFailure = function () {
        $.modal.close();
    }

    function submitFormWithReloadAfterSuccess() {
        _skipFormSubmissionsChecks = true;
        AjaxForm.submit("settings", {reloadOnSubmit: true});
    }
};
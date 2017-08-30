/**
 * FieldMappingRule Validator widget
 * Provides a standard method for taking in / validating FMRs through a modal in the UI
 *
 * Usage:
 * - Create a wrapper div and include the custom-fmr-modal.jsp inside it
 * - Create a new FMRValidator widget
 * - Call init, pass in the values needed to locate elements
 * - The widget will take care of all behaviors inside the modal
 */
saasure.Widget.FMRValidator = function() {

    /**
     * Initializes bindings for the buttons on the modal
     * @param app - The name of the app to validate against
     * @param instanceId - The id of the AppInstance to validate against
     * @param modalElementId - The id of the div wrapping the modal
     * @param openElementId - The id of the element that will open the modal when clicked
     * @param customRuleElementId - The id of the element where the custom rule should be written to
     * @param ruleType - The type of rule to validate (IMPORT or ASSIGN)
     */
    this.init = function(app, instanceId, modalElementId, openElementId, customRuleElementId, ruleType) {

        // Bind the validation button to the validate endpoint
        $("#" + modalElementId + " .custom-rule-preview").die().live('click', function(e) {
            e.preventDefault();
            var data = {
                customRule: $("#" + modalElementId + " .preview-expression").val(),
                type: ruleType
            };
            $.postJson({
                url:"/admin/app/" + app + "/instance/" + instanceId + "/fmr/validate",
                data: data,
                success: function(result) {
                    var valueBox = $("#" + modalElementId + " .rule-preview-value");
                    if (result.error == null) {
                        if (result.result != "") {
                            valueBox.text(result.result);
                        } else {
                            valueBox.text("Valid Expression!");
                        }
                        valueBox.animate(saasure.fxColors.successPulse, 200).animate(saasure.fxColors.white, 1000);
                        valueBox.removeClass("error");
                        valueBox.addClass("success");
                    } else {
                        valueBox.text(result.error);
                        valueBox.animate(saasure.fxColors.errorPulse, 200).animate(saasure.fxColors.error, 1000);
                        valueBox.removeClass("success");
                        valueBox.addClass("error");
                    }
                }
            });
        });

        // Bind the population of the custom expression back into the base form element
        $("#" + modalElementId + " .custom-rule-use").die().live('click', function(e) {
            e.preventDefault();
            $("#" + customRuleElementId).val($("#" + modalElementId + " .preview-expression").val());
            $.modal.close();
        });

        // Bind the close modal behavior
        $("#"+ modalElementId + " .custom-rule-close").die().live('click', function(e) {
            e.preventDefault();
            $.modal.close();
        });

        // Bind the open modal behavior to the openElementId
        $("#" + openElementId).die().live('click', function(e) {
            e.preventDefault();
            $("#" + modalElementId).modal({
                onShow: null,
                escClose: true,
                overlayClose:true,
                minWidth: 680
            });
        });

        // Show / Hide the appropriate example sections
        if (ruleType == "IMPORT") {
            $("#" + modalElementId + " .import-rule-examples").show();
            $("#" + modalElementId + " .assign-rule-examples").hide();
        } else {
            $("#" + modalElementId + " .import-rule-examples").hide();
            $("#" + modalElementId + " .assign-rule-examples").show();
        }
    };

    return this;

};
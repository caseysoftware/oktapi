var GroupLib = function() {
    var self=this;

    function createAssignmentsByElm(instanceForm) {

        /*
        TODO dcolligan use this instead and modify controller
        var instanceForm = $("#" + instanceId + "\\.edit\\.form");
        return instanceForm.serializeArray();
        */

        var assignments = {};
        var instancePropertyKey;
        var instancePropertyValue;
        var j;

        // select boxes
        var selectBoxes = instanceForm.find('.prop-dropdown');
        for (j = 0; j < selectBoxes.length; j++) {
            var instanceProperty = selectBoxes[j];
            var split = instanceProperty.id.split(".");
            instancePropertyKey = split[1];
            var addendum = instanceProperty.id.split(".")[2];
            if (addendum) {
                instancePropertyKey += "." + addendum;
            }
            var instancePropertyValueElmId = "#" + instanceProperty.id.
                    split(".").join("\\.").
                    split("[").join("\\[").
                    split("]").join("\\]");

            instancePropertyValue = getSelectedDropdownValue(instancePropertyValueElmId);
            assignments[instancePropertyKey] = instancePropertyValue;
        }

        // checkboxes
        var checkBoxes = instanceForm.find('.prop-boolean');
        for (j = 0; j < checkBoxes.length; j++) {
            var checkBox = checkBoxes[j];
            instancePropertyKey = checkBox.name;
            if (instancePropertyKey.length) {
                if (checkBox.checked) {
                    instancePropertyValue = 'true';
                } else {
                    instancePropertyValue = 'false';
                }
                assignments[instancePropertyKey] = instancePropertyValue;
             }
        }

        // reference list
        var referenceListContainers = instanceForm.find(".prop-reference-list").parent();
        for (j = 0; j < referenceListContainers.length; j++) {
            var referenceListContainer = referenceListContainers[j];
            instancePropertyKey = referenceListContainer.id.split('.')[1];
            var checkboxValues = $(referenceListContainer).find('input.select-checkbox');
            var values = new Array();
            for (var k = 0; k < checkboxValues.length; k++) {
                var checkboxValue = checkboxValues[k];
                if (checkboxValue.checked) {
                    values.push(checkboxValue.value);
                }
            }
            instancePropertyValue = values;
            assignments[instancePropertyKey] = instancePropertyValue;
        }

        // string sets
        var stringSetContainers = instanceForm.find('.prop-string-set').parent();
        for (j = 0; j < stringSetContainers.length; j++) {
            var stringSetContainer = stringSetContainers[j];
            instancePropertyKey = stringSetContainer.id.split('.')[1];
            var checkboxValues = $(stringSetContainer).find('input.select-checkbox');
            var values = new Array();
            for (var k = 0; k < checkboxValues.length; k++) {
                var checkboxValue = checkboxValues[k];
                if (checkboxValue.checked) {
                    values.push(checkboxValue.value);
                }
            }
            instancePropertyValue = values;
            assignments[instancePropertyKey] = instancePropertyValue;
        }

        // strings
        var stringContainers = instanceForm.find('.prop-string');
        for (j = 0; j < stringContainers.length; j++) {
            var stringContainer = stringContainers[j];
            instancePropertyKey = stringContainer.id.split('.')[1];
            instancePropertyValue = $(stringContainer).val();
            assignments[instancePropertyKey] = instancePropertyValue;
        }

        // AD OU
        var targetOUContainers = instanceForm.find('.text-targetOU');
        for (j = 0; j < targetOUContainers.length; j++) {
            var targetOUContainer = targetOUContainers[j];
            instancePropertyKey = targetOUContainer.id.split('.')[1];
            instancePropertyValue = $(targetOUContainer).val();
            assignments[instancePropertyKey] = instancePropertyValue;
        }

        return assignments;
    }

    function createAssignments(instanceId) {
        var instanceForm = $("#" + instanceId + "\\.edit\\.form");
        return createAssignmentsByElm(instanceForm);
    }

    // IE doesn't seem to set the selected="selected" attr if is not explicitly
    // set, unlike other browsers which implicitly set it on the first value
    function getSelectedDropdownValue(dropdownElmId) {
        var selected = $(dropdownElmId).children().filter(":selected");
        if (selected.length) {
            return selected.val();
        } else {
            return $($(dropdownElmId).children()[0]).val();
        }
    }

    this.createAssignments = createAssignments;
    this.createAssignmentsByElm = createAssignmentsByElm;
}
/**
 * I really am not sure how to name this or where to put it right now, but I need to reuse behavior - it seems right to abstract it
 *
 * It attaches a div to a radio button selection, such that if the radio is selected, the div is shown, and if it is not, the div is hidden.
 * It works with ajax forms - it expects to be able to set read only versions of the radios and divs.
 * The radio buttons will automatically respond to user input after initialization.
 */
saasure.Widget.radiodiv = function(editRadio, readOnlyRadio, editRadioOther, readOnlyRadioOther, divEdit, divReadOnly, formId){
    function updateFromEdit() {
        // onSaved handler: Udate the read-only section from the edit section
        readOnlyRadio.prop("checked", editRadio.is(":checked"));
        readOnlyRadioOther.prop("checked", !editRadio.is(":checked"));

        toggleBothDivs();
    }

    function updateFromReadOnly() {
        // onCancel handler: Udate the edit section from the read-only section
        editRadio.prop("checked", readOnlyRadio.is(":checked"));
        editRadioOther.prop("checked", !readOnlyRadio.is(":checked"));

        toggleBothDivs();
    }

    function toggleBothDivs() {
        if (editRadio.is(":checked")) {
            divEdit.show();
            divReadOnly.show();
        } else {
            divEdit.hide();
            divReadOnly.hide();
        }
    }

    function toggleEditDivs() {
        if (editRadio.is(":checked")) {
            divEdit.show();
        } else {
            divEdit.hide();
        }
    }

    function init() {
        updateFromEdit();
        editRadio.live('click', function() {
            toggleEditDivs();
        });
        editRadioOther.live('click', function() {
            toggleEditDivs();
        });
        AjaxForm.register(formId, {onSaved: updateFromEdit, onCancel: updateFromReadOnly});
    }

    this.updateFromEdit = updateFromEdit;
    init();
}
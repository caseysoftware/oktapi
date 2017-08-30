var progress;

saasure.applications.importUsers = {
    closeDialog : function(callback){
      $("#import-in-progress-dialog").fadeOut('fast', function(){
           $("#app-import-results .widget-mask").fadeOut('fast', callback);
        });
    }
}

function startCSVImport(jobId) {
    var csvController = new UserImportPage();
    csvController.startCSVImport(jobId);
}

var UserImportPage = function(){
	var confirm_selected = {};
	var confirm_count = 0;
	var dataTable;

	function formatItemId(obj, tr, td, index) {
		$(tr).attr("id", "item-"+obj.id);
		if (obj.conflict) {
			$(tr).addClass("conflict");
		}
	}

	function formatImportedUser(obj, tr, td, index) {
		var exactCount = Number(obj.user.exactMatchCount);
		var partialCount = Number(obj.user.partialMatchCount);
		if (obj.ignored) {
			$(tr).addClass("row-ignored");
			$(td).addClass("app-imported-user ignored");
		} else if (exactCount && partialCount) {
			$(tr).addClass("row-exact-match row-fuzzy-match");
			$(td).addClass("app-imported-user match-exact-fuzzy");
		} else if (exactCount) {
			$(tr).addClass("row-exact-match");
			$(td).addClass("app-imported-user match-exact");
		} else if (partialCount) {
			$(tr).addClass("row-fuzzy-match");
			$(td).addClass("app-imported-user match-fuzzy");
		} else {
			$(tr).addClass("row-no-match");
			$(td).addClass("app-imported-user match-none");
		}
		obj.user.ignored = obj.ignored;
		$.tmpl("userTemplate", obj.user).appendTo($(td).html(""));
	}

	function makeActionId(obj, action) {
		if (action.action != 'ASSIGN') {
			return "option-"+action.action.toLowerCase()+"-"+obj.id;
		} else if (action.matchType == 'NONE') {
			return "option-assign-"+obj.id;
		} else {
			return "option-match-"+obj.id;
		}
	}

	function formatActions(obj, tr, td, index) {
		$(td).addClass("okta");
		$.tmpl("actionTemplate", obj).appendTo($(td).html(""));
		var selectedDiv = $(tr).find("div.option-selected");
		var optionList = $(tr).find("ul.options-wrap");
		for (var i=0; i<obj.actions.length; i++) {
			var action = obj.actions[i];
			var actionId = makeActionId(obj, action);
			action.conflict = false;
			action.itemId = obj.id;
            if ($("#canAssignUsers").length) {
			    optionList.append('<li id="'+actionId+'" class="option"></li>');
            } else {
                optionList.append('<li id="'+actionId+'" class="option" disabled="true"></li>')
            }
			var li = optionList.find('li').last();
			$.tmpl("actionChoiceTemplate", action).appendTo(li);
			if (action.current) {
				action.conflict = obj.conflict;
				action.conflictMessage = obj.conflictMessage;
				$.tmpl("actionChoiceTemplate", action).appendTo(selectedDiv);
				li.addClass('current-option-selected')
			}
		}
	}

	function formatChecked(obj, tr, td, index) {
		$(td).addClass("check-col");
        if (!$("#canAssignUsers").length) {
            $(td).html('<input type="checkbox" class="confirm-checkbox" disabled="true">');
        } else {
            if (obj.ignored) {
                $(td).html('<input type="checkbox" class="confirm-checkbox disable-in-read-only disable-in-safe-mode">');
            } else {
                $(td).html('<input type="checkbox" class="confirm-checkbox disable-in-read-only disable-in-safe-mode" id="confirm-' + obj.id + '">');
            }
        }
		var checkbox = $(td).find("input.confirm-checkbox");
		if (obj.conflict) {
			checkbox.prop("disabled", "disabled");
			clearConfirm(obj.id, tr, checkbox);
			updateConfirmButtons();
		}
		if (confirm_selected[obj.id]) {
			checkbox.prop('checked', true);
			$(tr).addClass('cb-selected');
		}
	}

	function initTable() {
		$.fn.dataTableExt.oJUIClasses.sStripOdd = "match-item";
		$.fn.dataTableExt.oJUIClasses.sStripEven = "match-item";

		dataTable = $('#unassigned-users-table').oktaDataTable(
			(new saasure.DataTables()).serverSide({
				"sPaginationType"	: 'full_numbers',
				"iDisplayLength"	: 10,
				"aoColumns"		: [
				           		   { "sName": "id", "bVisible": false },
				           		   { "sName": "conflict", "bVisible": false },
				           		   { "sName": "conflictMessage", "bVisible": false },
				           		   { "sName": "ignored", "bVisible": false },
				           		   { "sName": "user", "bSortable": false, "sWidth": "415px"},
				           		   { "sName": "actions", "bSortable": false, "sWidth": "415px" },
				           		   { "sName": "checked", "bSortable": false, "sWidth": "20px" }
				           		  ],
                "sDom": '<"fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix"f>r<"fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix top-bar"pli>t<"fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix bottom-bar"pli><"clear">',
				"bJQueryUI"	 : true,
				"bAutoWidth": false,
				"sAjaxSource": "/admin/app/" + appName + "/instance/" + instanceId + "/users/unassigned",
				"aFormatters": {
					"id" : formatItemId,
					"user" : formatImportedUser,
					"actions" : formatActions,
					"checked" : formatChecked
				},

				"fnGetParams" : function() {
					var matchTypes = [];
					$('#toggle-button-bar-unassigned a.button-down span.match-type').each(function() {
						matchTypes.push($(this).text());
					});
					var ignoredIncluded = "false";
					if ($('#show-ignored.button-down').length > 0) {
						ignoredIncluded = "true";
					}
					return {
						matchTypes: matchTypes,
						ignoredIncluded : ignoredIncluded
					};
				},

				"fnDrawCallback": function() {
					$("td.okta").each(function() { setAutocomplete(this); });
					$('.data-grid').addClass('data-complete');
					var allChecked = true;
					updateAllChecked();
                    setToolTips();
				}
			})
		);
		dataTable.fnSetFilteringDelay(250);


	}

	function updateConflicts(conflicts, cleared, itemId) {
		var conflict = false;
		for (var conflictId in conflicts) {
			if (itemId && conflictId == itemId) {
				conflict = true;
			}
			var $tr = $("#item-"+conflictId+":visible");
				var msg = conflicts[conflictId];
				$tr.find("div.option-selected .conflict").html(msg).show();
				$tr.addClass("conflict");

				var $checkbox = $tr.find("input.confirm-checkbox");
				$checkbox.prop('disabled', 'disabled');
				clearConfirm(conflictId, $tr, $checkbox);
		}
		for (var i=0; i<cleared.length; i++) {
			var clearedId = cleared[i];
			var $tr = $("#item-"+clearedId);
			$tr.removeClass("conflict");
			$tr.find("input.confirm-checkbox").removeAttr('disabled');
			$tr.find("div.option-selected .conflict").hide();
		}
		if (itemId && !conflict) {
			setConfirm(itemId);
		}
		updateConfirmButtons();
	}

	function updateAction(itemId, action, assignedId, manualAssignUser) {
		$("#item-"+itemId).addClass("updating");
    	$.ajaxSafeJson({
    		type: "POST",
    		url: "/admin/app/"+appName+"/instance/"+instanceId+"/users/"+itemId+"/action",
    		data: {
    			_xsrfToken: $("#_xsrfToken").text(),
    			action: action,
    			assignedId: assignedId,
	    		manualAssignUser: manualAssignUser
    		},
    		success: function(response) {
    			updateConflicts(response.conflicts, response.cleared, itemId);
    			$("#item-"+itemId).removeClass("updating");
    		}
    	});
    }

	function setAutocomplete(obj) {
		var itemId = getItemId(obj);
		var $selectedOption = $(obj).find("div.option-selected");
	    var action = $selectedOption.find(".assign-action").text();
		var $input = $selectedOption.find("input.assign-override-input");
	    $input.oktaUserAuto({ resultCallback : function(event, data, formatted, user) {
	    	if(user) {
	    		$input.val(user.first+" "+user.last);
	    		$selectedOption.find("li.okta-login").text(user.login);
	    		$selectedOption.find("li.okta-email").text(user.email);
	    		$input.blur();
	    		$selectedOption.find(".assign-user-id").text(user.id);
	    		updateAction(itemId, action, user.id, true);
	    	}
	    }});
	    $input.focus(function(e) {
	    	$(e.target).val("");
	    });
	    var originalName = $input.val();
	    $input.focusout(function(e) {
	    	if (!$(e.target).val()) {
	    		$(e.target).val(originalName);
	    	}
	    });
	    return $input;
	}

	function getItemId(element) {
		if ($(element).first()[0].nodeName.toLowerCase() != "tr") {
			element = $(element).parents("tr.match-item");
		}
		return element.attr("id").substr("item-".length);
	}

	function setProgress(value) {
		$('.progress-bar').attr('value', value);
		$('.progress-value').html(value + '%');
	}

	function clearConfirm(itemId, tr, checkbox) {
		if (!itemId) {
			if (!tr) {
				tr = $(checkbox).parents('tr.match-item');
			}
			itemId = getItemId(tr);
		}
		if (!tr) {
			tr = $("#item-"+itemId+":visible");
		}
		if (!checkbox) {
			checkbox = $(tr).find('input.confirm-checkbox');
		}
		$(tr).removeClass('cb-selected');
		$(checkbox).removeAttr('checked');
		if (confirm_selected[itemId]) {
			delete confirm_selected[itemId];
			confirm_count -= 1;
		}
	}

	function setConfirm(itemId, tr, checkbox) {
		if (!itemId) {
			if (!tr) {
				tr = $(checkbox).parents('tr.match-item');
			}
			itemId = getItemId(tr);
		}
		if (!tr) {
			tr = $("#item-"+itemId+":visible");
		}
		if (!checkbox) {
			checkbox = $(tr).find('input.confirm-checkbox');
		}
		if (!$(checkbox).prop('disabled')) {
			$(tr).addClass('cb-selected');
			$(checkbox).prop('checked', true);
			if (!confirm_selected[itemId]) {
				confirm_count += 1;
			}
			var action = $(tr).find("div.option-selected span.assign-action").text();
			confirm_selected[itemId] = action;
		}
	}

	function updateAllChecked() {
		if ($('input.confirm-checkbox').not(':checked').length > 0) {
			$('input.confirm-all-checkbox').prop('checked', false);
		} else {
			$('input.confirm-all-checkbox').prop('checked', true);
		}
	}

    function setToolTips(){
        $(".has-tool-tip[title]").qtip({
            style: {
                name: 'dark',
                tip: true,
                width: {min: 100}
            },
            position: {
                corner: {target: 'topMiddle', tooltip: 'bottomMiddle'},
                adjust: {x: 0, y: -6}
            },
            hide: {fixed: true},
            show: { delay: 600 }
        });
    }

	function updateConfirmButtons() {

        /*
        var buttons = $("input.confirm-unassigned");
		buttons.val("Confirm Assignments ("+confirm_count+")");
		if (confirm_count > 0) {
			buttons.removeAttr("disabled");
			buttons.removeClass("disabled-control");
		} else {
			buttons.prop("disabled", true);
			buttons.addClass("disabled-control");
		}
         */

        var buttons = $("a.confirm-unassigned");
        buttons.find(".count-button-counter").text(confirm_count);
        if (confirm_count > 0) {
            buttons.removeClass("disabled-button");
        } else {
            buttons.addClass("disabled-button");
        }
	}

    function startImport(fullImport) {
        $("#user-import-progress-message").show();
        $("#user-import-complete-message").hide();
        $("#user-import-complete-confirm").hide();
        $("#user-import-complete-error").hide();
        $("#app-import-results .widget-mask").fadeIn('300', function(){
            $("#app-import-results #import-in-progress-dialog").fadeIn('fast', function() {
                $.ajaxSafeJson({
                    type: "POST",
                    url: "/admin/user/import/"+appName+"/"+instanceId+"/start",
                    data: {
                        _xsrfToken: $("#_xsrfToken").text(),
                        fullImport: fullImport
                    },
                    success: function(resp) {
                        if (resp.hasGlobalErrors == true) {
                            $("#import-error-message").text(resp.globalerrors[0]);
                            $("#user-import-progress-message").fadeOut('fast', function(){
                                $("#user-import-complete-error").fadeIn('fast', function(){
                                    $("#user-import-complete-confirm").slideDown(400);
                                });
                            });
                            return;
                        }

                        var jobId = resp.modelMap.jobId;
                        JobManager.add_job(jobId, "", "", {
                            onSuccess: function(jobBean) {
                                setProgress(jobBean.currentStep);
															  $("#progress-text").html(jobBean.statusText);
                                JobManager.get_job(jobId, function(result) {
                                    $("#scan-count").text(result.job.usersScanned);
                                    $("#add-count").text(result.job.usersAdded);
                                    $("#update-count").text(result.job.usersUpdated);
                                    $("#unchanged-count").text(result.job.usersUnchanged);
                                    $("#remove-count").text(result.job.usersRemoved);
                                    $("#group-scan-count").text(result.job.groupsScanned);
                                    $("#group-add-count").text(result.job.groupsAdded);
                                    $("#group-update-count").text(result.job.groupsUpdated);
                                    $("#group-unchanged-count").text(result.job.groupsUnchanged);
                                    $("#group-remove-count").text(result.job.groupsRemoved);
                                    $("#group-import-counts").show();
                                    if (result.job.usersScanned > 0) {
                                        $("ul#user-import-detail").show();
                                    } else {
                                        $("ul#user-import-detail").hide();
                                    }
                                    if (result.job.groupsScanned > 0) {
                                        $("ul#group-import-detail").show();
                                    } else {
                                        $("ul#group-import-detail").hide();
                                    }
                                    $("#user-import-progress-message").fadeOut('fast', function(){
                                        $("#user-import-complete-message").fadeIn('fast', function(){
                                            $("#user-import-complete-confirm").slideDown(400, function() {
                                                $.getSafeJson("/admin/app/"+appName+"/instance/"+instanceId+"/users/counts", function(response) {
                                                    $("span.unassigned-count").text(response.unassignedCount);
                                                    $("span.assigned-count").text(response.assignedCount);
                                                });
                                            });
                                        });
                                    });
                                });
                            },
                            onFailure: function(jobBean) {
                                JobManager.get_job(jobId, function(result) {
                                    $("#import-error-message").text(result.jobState.statusText);
                                    $("#user-import-progress-message").fadeOut('fast', function(){
                                        $("#user-import-complete-error").fadeIn('fast', function(){
                                            $("#user-import-complete-confirm").slideDown(400);
                                        });
                                    });
                                });
                            },
                            onProgress: function(jobBean) {
                                setProgress(jobBean.currentStep);
                                $("#progress-text").html(jobBean.statusText);
                            }
                        });
                    }
                });
            });
        });
    }

	function startCSVImport(){
        var recordId = $("#csv-import-record-id").text();
        var jobId;
        $.ajaxSafeJson({
            type: "POST",
            data: {
                recordId: recordId,
                _xsrfToken: $("#_xsrfToken").text()
            },
            url: "/admin/user/import/"+appName+"/"+instanceId+"/csv-start",
            success: function(resp) {
                jobId = resp.jobId;

                $("#user-import-progress-message").show();
                $("#user-import-complete-message").hide();
                $("#user-import-complete-confirm").hide();
                $("#user-import-complete-error").hide();
                $("#app-import-results .widget-mask").fadeIn('300', function(){
                    $("#app-import-results #import-in-progress-dialog").fadeIn('fast', function() {
                        JobManager.add_job(jobId, "", "", {
                            onSuccess: function(jobBean) {
                                setProgress(jobBean.currentStep);
                                $("#progress-text").html(jobBean.statusText);
                                JobManager.get_job(jobId, function(result) {
                                    $("#scan-count").text(result.job.usersScanned);
                                    $("#add-count").text(result.job.usersAdded);
                                    $("#update-count").text(result.job.usersUpdated);
                                    $("#unchanged-count").text(result.job.usersUnchanged);
                                    $("#remove-count").text(result.job.usersRemoved);
                                    $("#group-import-counts").hide();
                                    if (result.job.usersScanned > 0) {
                                        $("ul#user-import-detail").show();
                                    } else {
                                        $("ul#user-import-detail").hide();
                                    }
                                    $("#user-import-progress-message").fadeOut('fast', function(){
                                        $("#user-import-complete-message").fadeIn('fast', function(){
                                            $("#user-import-complete-confirm").slideDown(400, function() {
                                                $.getSafeJson("/admin/app/"+appName+"/instance/"+instanceId+"/users/counts", function(response) {
                                                    $("span.unassigned-count").text(response.unassignedCount);
                                                    $("span.assigned-count").text(response.assignedCount);
                                                });
                                            });
                                        });
                                    });
                                });
                            },
                            onFailure: function(jobBean) {
                                JobManager.get_job(jobId, function(result) {
                                    $("#import-error-message").text(result.jobState.statusText);
                                    $("#user-import-progress-message").fadeOut('fast', function(){
                                        $("#user-import-complete-error").fadeIn('fast', function(){
                                            $("#user-import-complete-confirm").slideDown(400);
                                        });
                                    });
                                });
                            },
                            onProgress: function(jobBean) {
                                setProgress(jobBean.currentStep);
                                $("#progress-text").html(jobBean.statusText);
                            }
                        });
                    });
                });

            }
        });

	}

	function cancelCSVImport(){
	    // Do nothing, dismiss modal and do not import (cleanup any uploaded CSVs on server?)
	}
this.enableImportButton = function(recordId){
    $("#csvUploadFrame").removeClass("csv-errors").addClass("csv-parsed");
    $("#import-csv-users-btn").removeAttr("disabled").removeClass("disabled-control");
    $("#csv-import-record-id").text(recordId);
}

this.showCSVErrors = function(){
    $("#csvUploadFrame").removeClass("csv-parsed").addClass("csv-errors");
}

this.init=function(){
    confirm_selected = {};
	confirm_count = 0;

	$.template("userTemplate", $("#user-template"));
	$.template("actionTemplate", $("#action-template"));
	$.template("actionChoiceTemplate", $("#action-choice-template"));
	$.template("checkedTemplate", $("#checked-template"));
    $.template("confirmationErrorsTemplate", $("#confirmation-errors-template"));

    initTable();

    setProgress(0);

	/**
	 * Called when an option is selected from the mega drop down
	 */
	var dropDownOnSelected = function(self,eventName,param) {
        var elm = param.elm;

        /* Get the action parameters for submission */
        var itemId = getItemId(elm);
        var action = elm.find(".assign-action").text();
        var userId = elm.find(".assign-user-id").text();

        /* Copy HTML for clicked option */
        var text = elm.html();

        /* Replace previously selected option with clicked option */
        elm.parents(".options").prevAll(".option-selected").html(text);
        var $input = setAutocomplete(elm.parents('td'));
        $input.focus();


        if (action != 'ASSIGN' || userId) {
            updateAction(itemId, action, userId, false);
        }
        else if (action == 'ASSIGN') {
            var $tr = $("tr#item-" + itemId);
            $tr.removeClass("cb-selected");
            $tr.find("input.confirm-checkbox").removeAttr('checked').prop("disabled", true);
        }
	};

    var dropDown=new saasure.Widget.DropDown();
    dropDown.options={
        showCheckSign: true,
        doNotShowSelector:".assign-override-input", //do not show drop down if user click the auto-complete text input
        events:{
            onSelected:dropDownOnSelected
        }
    };
    dropDown.create();

    saasure.done("user_import_page", $("#tab-import"));

};
    $('#toggle-button-bar-unassigned a').live('click', function(e){
	    e.preventDefault();
	    var changed = false;
	    if($(this).hasClass('button-down')){
	        if (!$(this).hasClass('all') && $('#toggle-button-bar-unassigned a.match-button.button-down').length > 1) {
		        $(this).removeClass('button-down');
	            $('#toggle-button-bar-unassigned a.all').removeClass('button-down');
	            changed = true;
	        }
	    } else {
	        $(this).addClass('button-down');
	        if ($(this).hasClass('all')){
	            $('#toggle-button-bar-unassigned a.match-button').addClass('button-down');
	        } else if ($('#toggle-button-bar-unassigned a.match-button.button-down').length == 4){
	        	$('#toggle-button-bar-unassigned a.all').addClass('button-down');
	        }
	        changed = true;
	    }
	    if (changed) {
	    	$("#toggle-button-bar-unassigned").stopTime("filter-type");
	    	$("#toggle-button-bar-unassigned").oneTime(500, "filter-type", function() {
	    		dataTable.fnClearTable(1);
	    	});
	    }
	});


	$('input.confirm-checkbox').live('click', function(){
		if ( $(this).prop('checked')){
			setConfirm(null, null, this);
		} else {
			clearConfirm(null, null, this);
		}
		updateConfirmButtons();
		updateAllChecked();
	});

	$('input.confirm-all-checkbox').live('click', function() {
		var checked = $(this).prop('checked');
		$('input.confirm-checkbox').each(function() {
			if (checked) {
				setConfirm(null, null, this);
			} else {
				clearConfirm(null, null, this);
			}
		});
		updateConfirmButtons();
	});

	$('.confirm-unassigned').live('click', function(e) {
        e.preventDefault();
		if($('.confirm-unassigned').hasClass("disabled-button")){
            return;
        } else {
            var skip = 0;
            var create = 0;
            var assign = 0;
            for (var itemId in confirm_selected) {
                if (confirm_selected[itemId] == 'ASSIGN') {
                    assign += 1;
                } else if (confirm_selected[itemId] == 'CREATE') {
                    create += 1;
                } else if (confirm_selected[itemId] == 'SKIP') {
                    skip += 1;
                }
            }
            $("#confirm-create-count").text(create);
            $("#confirm-assign-count").text(assign);
            $("#confirm-skip-count").text(skip);
            $("#unassigned-confirm-modal").modal({
                escClose: false,
                overlayClose: false,
                minWidth: 600
            });
        }
	});

	$('#unassigned-confirm-cancel').live('click', function(){
		$.modal.close();
	});

    function displayConfirmationErrors(responseErrors) {
        var errorList = $("#confirm-error-list");
        for (var i = 0; i < responseErrors.length; i++) {
            var error = responseErrors[i];
            error.problemStrings = [];
            for (var prob in error.problems) {
                error.problemStrings.push(prob + ' ' + error.problems[prob]);
            }
            error.hasMultipleProblems = error.problemStrings.length > 1;

            $.tmpl("confirmationErrorsTemplate", error).appendTo(errorList);
        }
        $("#confirm-step-2").hide().next().show();
    }

	$('#unassigned-confirm-continue').live('click', function(){
		$("#confirm-step-1").hide().next().show();

 		var autoActivate = $("#auto-confirm-enabled").prop('checked');

		var confirmIds = [];
		for (var itemId in confirm_selected) {
			confirmIds.push(itemId);
		}
		var data = {
			_xsrfToken: $("#_xsrfToken").text(),
			confirmIds: confirmIds,
			enableAutoactivation : autoActivate
		};
		$.ajaxSafeJson({
			type: "post",
			url: "/admin/app/"+appName+"/instance/"+instanceId+"/users/confirm",
			traditional: true,
			data: data,
			success: function(response) {
				confirm_selected = {}
				confirm_count = 0;
				updateConfirmButtons();
				$(".unassigned-count").text(response.unassignedCount);
				$(".assigned-count").text(response.assignedCount);
				dataTable.fnClearTable(1);
				if (response.errors && response.errors.length) {
                    displayConfirmationErrors(response.errors);
				} else {
					$.modal.close();
				}

        $("#auto-confirm-enabled").attr("value", autoActivate);
        if ($("#auto-confirm-enabled").attr("value") === "true") {
          $("#auto-confirm-enabled").prop("checked", "checked");
        } else {
          $("#auto-confirm-enabled").removeAttr("checked");
        }

        $("#auto-confirmation-no-match").attr("value", autoActivate);
        if ($("#auto-confirmation-no-match").attr("value") === "true") {
          $("#auto-confirmation-no-match").prop("checked", "checked");
        } else {
          $("#auto-confirmation-no-match").removeAttr("checked");
        }

        var noMatchRuleMediated = $("#editSettings\\.importConfig\\.noMatchRuleMediated");
        if ($(noMatchRuleMediated).attr("value")) {
          var matchRule = JSON.parse($(noMatchRuleMediated).attr("value"));
          matchRule.autoActivateImportMatchUpgrade = autoActivate;
          $(noMatchRuleMediated).attr("value", JSON.stringify(matchRule));
        }

			},
            error: function(err) {
                displayConfirmationErrors([
                    {appUserName:"Unknown", action:"CONFIRM", problems:
                        {"Received": "a " + err.status.toString() + " server error. Please check your System Log for more details or try your request again."}
                    }]
                );
            }
		});
	});

	$("#unassigned-confirm-error-dismiss").live('click', function(e) {
		e.preventDefault();
		$.modal.close();
	});

	$("#app-import-user-data").live('click', function(e){
	    e.preventDefault();
        if($(this).hasClass("disabled-control")) {
            return;
        }
        startImport(true);
	});

	$("input.import-ok").live('click', function(){
		confirm_selected = {}
		confirm_count = 0;
		updateConfirmButtons();
		dataTable.fnClearTable(1);
	    saasure.applications.importUsers.closeDialog(function() {
	    	$("#user-import-complete-confirm").hide();
	        $("#user-import-complete-message").hide();
	        $("#user-import-progress-message").show();
          setProgress(0);
	    });
	});

	$(".unignore-item").live('click', function(e) {
		e.preventDefault();
		var itemId = $(this).attr('id').substr("unignore-".length);
    	$.ajaxSafeJson({
    		type: "POST",
    		url: "/admin/app/"+appName+"/instance/"+instanceId+"/users/"+itemId+"/unignore",
    		data: {
    			_xsrfToken: $("#_xsrfToken").text()
    		},
    		success: function(response) {
				$(".unassigned-count").text(response.unassignedCount);
				$(".assigned-count").text(response.assignedCount);
				updateConflicts(response.conflicts, response.cleared);
				dataTable.fnClearTable(1);
    		}
    	});
	});

    $("#app-activate").live('click', function(e) {
        $("#app-import-user-data").removeClass("disabled-control");
        $("#app-import-user-data").attr("title", "Do a one-time import");
    });
    $("#app-deactivate").live('click', function(e) {
        $("#app-import-user-data").addClass("disabled-control");
        $("#app-import-user-data").attr("title", "Sorry, user import is not available while the application is disabled");
    });


    ModalDialog.registerModalDialog("#csv-import-modal",
        {
            minWidth: 500,
            confirm: startCSVImport,
            cancel: cancelCSVImport
        });

    $("#csv-import-link").live('click', function(e){
        e.preventDefault();
        ModalDialog.openModal(e, "#csv-import-modal");
    });

    $("#import-ad-users-submit").live('click', function(e) {
        e.preventDefault();
        var fullImport = true;
        if ($("input[name='fullImport']:checked").size() == 1) {
            fullImport = $("input[name='fullImport']:checked").val();
        }
        $.modal.close();
        startImport(fullImport);
    });

    $("#import-ad-users-cancel").live('click', function(e) {
        $.modal.close();
    });

    $("#ad-import-user-data").live('click', function(e) {
        e.preventDefault();
        $("#ad-import-modal").modal({
            escClose: true,
            overlayClose:true,
            minWidth: 640,
            persist: false
        });
    });

};




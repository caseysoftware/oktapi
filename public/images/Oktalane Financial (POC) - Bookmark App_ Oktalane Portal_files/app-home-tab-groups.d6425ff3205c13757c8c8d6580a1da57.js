var GroupsSection=function(assignmentTab) {

  var grouplib = new GroupLib();
  var datatable;
  var checkboxTable;
  var conversionPageInitialized;
  //num of users that can be converted from being individually owned to group managed
  var numConvertible;
  var qtipApi;

  function getRowIdFromElm(elm) {
    return elm.id.split('-').slice(-1);
  }

  function getRowIdFromEvent(e) {
    return e.currentTarget.id.split('-').slice(-1);
  }

  function getRowWithGaaId(id) {
    return $("#group-app-assignment-row-" + id)[0];
  }

  function getRows() {
    return $("#group-app-assignment-table").find('tr').slice(1);
  }

  function getTitleRow() {
    return $("#group-app-assignment-table").find('tr')[0];
  }

  function getTopRow() {
    var rows = getRows();
    return rows[0];
  }

  function getBottomRow() {
    var rows = getRows();
    return rows[rows.length - 1];
  }

  function getRowAbove(gaaRow) {
    var rows = getRows();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id == gaaRow.id) {
        return rows[i - 1];
      }
    }
    return null; // shouldn't get here
  }

  function getRowBelow(gaaRow) {
    var rows = getRows();
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id == gaaRow.id) {
        return rows[i + 1];
      }
    }
    return null; // shouldn't get here
  }

  function swapRows(gaaRow, targetRow) {

    $.ajaxSafeJson({
      type: "POST",
      url: "/admin/groups/priorityChange",
      data: {
        gaaId: getRowIdFromElm(gaaRow),
        targetGaaId: getRowIdFromElm(targetRow)
      },
      success: function() {
        reloadGroupsList();
      }
    });
  }

  function isTopRow(gaaRow) {
    return gaaRow.id == getTopRow().id;
  }

  function isBottomRow(gaaRow) {
    return gaaRow.id == getBottomRow().id;
  }

  function disableLinks() {
    $("a.gaa-up-link").addClass("disabled-link");
    $("a.gaa-down-link").addClass("disabled-link");

    $("a.gaa-up-link").prop("disabled", "disabled");
    $("a.gaa-down-link").prop("disabled", "disabled");

    $("a.gaa-delete-link").prop("disabled", "disabled");
    $("a.gaa-edit-link").prop("disabled", "disabled");
  }

  function enableLinks() {

    $.each($("a.gaa-up-link"), function(i, a) {
      if (!$(a).hasClass("disabled-link")) {
        $(a).prop("disabled", "");
      }
    });
    $.each($("a.gaa-down-link"), function(i, a) {
      if (!$(a).hasClass("disabled-link")) {
        $(a).prop("disabled", "");
      }
    });

    $("a.gaa-up-link").removeClass("disabled-link");
    $("a.gaa-down-link").removeClass("disabled-link");

    $("a.gaa-delete-link").prop("disabled", "");
    $("a.gaa-edit-link").prop("disabled", "");
  }

  $(".gaa-up-link").live('click', function(e) {
    e.preventDefault();
    if ($(e.currentTarget).prop("disabled") == "disabled") {
      return;
    }

    disableLinks();

    var gaaId = getRowIdFromEvent(e);
    var gaaRow = getRowWithGaaId(gaaId);
    if (!isTopRow(gaaRow)) {
      var targetRow = getRowAbove(gaaRow);
      swapRows(gaaRow, targetRow);
    }
  });

  $(".gaa-down-link").live('click', function(e) {
    e.preventDefault();
    if ($(e.currentTarget).prop("disabled") == "disabled") {
      return;
    }

    disableLinks();

    var gaaId = getRowIdFromEvent(e);
    var gaaRow = getRowWithGaaId(gaaId);
    if (!isBottomRow(gaaRow)) {
      var targetRow = getRowBelow(gaaRow);
      swapRows(gaaRow, targetRow);
    }
  });

  function clearAutocompleteInput() {
    $("#groups-tab-group-search-input").val("");
  }

  this.addGaaCallback = function (event, data, formatted) {
    var groupId = data ? data[1] : null;

    var groupSearchInputVal = $("#groups-tab-group-search-input").val();

    if (!groupId) {
      clearAutocompleteInput();
      return;
    }

    if ($("#group-app-assignment-row-groupid-" + groupId).length) {
      // appInstance is already a member of this group
      var gaaId = $("#group-app-assignment-row-groupid-" + groupId).html();
      var applicationInstance = getApplicationInstance();
      var groupName = $("#groupname-" + gaaId).html();
      $("#groups-warning .infobox").html('<span class=\"icon error-16\"></span><p>'+ applicationInstance +" is already in group " + groupName + '</p>');
      $("#groups-warning").show();
      clearAutocompleteInput();
      return;
    }

    // appInstance is not already a member of this group
    disableLinks();

    var instanceId = getInstanceId();

    $("#confirm-gaa-add-content").load("/admin/group/" + groupId + "/addProperties/" + instanceId, function(response, status, xhr) {

      var applicationInstance = getApplicationInstance();

      $(".add-modal-appname").html(applicationInstance);
      $(".add-modal-groupname").html(groupSearchInputVal);
      $("#confirm-gaa-add-groupid").html(groupId);

      AjaxForm.bind_events();
      clearAutocompleteInput();
      ModalDialog.openModal(event, "#confirm-gaa-add");
    });
  }

  function addGaa(e) {
    var instanceId = getInstanceId();
    var instanceForm = $("#confirm-gaa-add-content form");

    var groupId = $("#confirm-gaa-add-groupid").html();
    var assignments = {};
    assignments[instanceId] = grouplib.createAssignmentsByElm(instanceForm);

    var data = {
      assignments: assignments
    };

    $("#confirm-group-add-confirmed").prop("disabled", true);

    $.postJson({
      url: "/admin/group/" + groupId + "/submitApps",
      data: data,
      success: function(response) {
        $("#confirm-group-add-confirmed").prop("disabled", false);
        ModalDialog.close();
        $("#confirm-gaa-add-content").html("");
        reloadGroupsList();
      }
    });
  }

  function editGaa(e) {

    var instanceId = getInstanceId();
    var instanceForm = $("#confirm-gaa-edit-content form");
    var groupId = $("#confirm-gaa-edit-groupid").html();
    var assignments = {};
    assignments[instanceId] = grouplib.createAssignmentsByElm(instanceForm);

    var data = {
      assignments: assignments
    };

    $("#confirm-group-edit-confirmed").prop("disabled", true);

    $.postJson({
      url: "/admin/group/" + groupId + "/editApp",
      data: data,
      success: function(response) {
        $("#confirm-group-edit-confirmed").prop("disabled", false);
        ModalDialog.close();
        $("#confirm-gaa-edit-content").html("");
        enableLinks();
      }
    });

  }

  function removeGaa(e) {

    var gaaId = $("#confirm-gaa-remove-gaaid").html();
    var groupId = $("#confirm-gaa-remove-groupid").html();

    $.ajaxSafeJson({
      type: "POST",
      url: "/admin/group/" + groupId + "/removeAppsById/" + gaaId,
      success: function() {
        reloadGroupsList();
      }
    });
  }

  function getDisplayName() {
    return $("#groups-tab-displayname").html();
  }

  function getAppName() {
    return $("#groups-tab-appname").html();
  }

  function getInstanceId() {
    return $("#groups-tab-instanceId").html();
  }

  function getApplicationInstance() {
    return $("#groups-tab-applicationInstance").html();
  }

  function isApiEnabled() {
    return $("#groups-tab-apienabled").html() == "true";
  }

  function reloadGroupsList() {
    var appName = getAppName();
    var instanceId = getInstanceId();
    $("#main-groups-list").load("/admin/app/" + appName + "/instance/" + instanceId + "/grouplist", function() {
      $("#groups-warning").hide();
    });
  }

  function appUserSearchParams(){
    // search parameters for finding convertible users
    return {
      instanceId: getInstanceId(),
      statuses: ['ACTIVE', 'NEW'],
      origin: 'INDIVIDUAL',
      excludeGroupId: true
    };
  }

  function countConvertible(){
    var source = "/admin/appusers/find-convertible?";

    $.ajaxSafeJson({
      "type": "GET",
      "url": source,
      "data": appUserSearchParams(),
      "success": function(json, status, req) {
        numConvertible = json.iTotalDisplayRecords;
        checkConvertibleAssignmentsButton();
        displayConverionInfobox();  //display one time tip
      }
    });
  }

  function checkConvertibleAssignmentsButton(){
    if (!qtipApi) {
      var tooltip = $("#convert-assignments-button").qtip({
        style: { name: 'dark',
                 tip: true,
                 width: 240,
                 padding: 6
               },
        position: {
          corner: {target: 'topMiddle', tooltip: 'bottomMiddle'},
          adjust: {x: 0, y: -4}
        },
        content: "This app doesn't have any individual assignments to be converted.",
        show: 'mouseover',
        hide: 'mouseout'
      });

      qtipApi = tooltip.qtip('api');
    }

    if(!numConvertible){
      disableConvertAssignmentsButton();
    }  else {
      enableConvertAssignmentsButton();
    }
  }

  function enableConvertAssignmentsButton() {
    $("#convert-assignments-button").removeClass('link-button-disabled').attr({title: 'Convert Assignments'});
    // qtipApi was initialized in checkConvertibleAssignmentsButton and relies on button '#convert-assignments-button'
    // which may not exists on the conversion page.
    if (qtipApi && qtipApi.disable) {
      qtipApi.disable(true);
    }
  }

  function disableConvertAssignmentsButton() {
    $("#convert-assignments-button").addClass('link-button-disabled').removeAttr('title');
    // qtipApi was initialized in checkConvertibleAssignmentsButton and relies on button '#convert-assignments-button'
    // which may not exists on the conversion page.
    if (qtipApi && qtipApi.disable) {
      qtipApi.disable(false);
    }
  }

  function displayConverionInfobox() {
    if (numConvertible > 0) {
      $("#conversion-infobox").show();
    }
  }

  $("#convert-assignments-button").live('click', function(e){
    e.preventDefault();
    if(!numConvertible){
      return;
    }
    $("#convert-button-panel-default").hide();
    $("#groups-content").hide();
    $("#convert-button-panel").hide();
    $("#groups-header-tag-convert").show(0, function(){
      $("#groups-header-tag").hide();
    });
    $("#convert-button-panel-default").hide();
    $("#groups-content").hide();
    $("#group-priority-help-header").hide();
    $("#group-priority-help-span").hide();
    $("#group-convert-help-header").show();
    $("#group-convert-help-span").show();
    if (!conversionPageInitialized) {
      initConversionPage();
      conversionPageInitialized = true;
    }
    $("#convert-button-panel-convert").show();
    $("#conversion-content").show();
  });

  $("#convert-selected-button").live('click', function(e){
    e.preventDefault();
    var appUserIds = checkboxTable.getChecked();
    if (!appUserIds.length) {
      return;
    }
    disableLinks();
    var numusers = $("#convert-selected-button span").html().replace(/[()]/g,'');
    $("#confirm-convert-some-numusers").html(numusers);
    ModalDialog.openModal(e, "#confirm-convert-some");
  });

  $("#conversion-dismiss-button").live('click', function(e){
    $("#conversion-message").hide();
  });

  $("#conversion-infobox-dismiss-button").live('click', function(e){
    $("#conversion-infobox").hide();
  });

  function displayConvertMessage(numusers) {
    var num = Number(numusers);
    var message;

    if (numusers === "" || isNaN(num)) {
      message = "All users were converted";
    } else if (num === 1) {
      message = num + " user was converted";
    } else {
      message = num + " users were converted";
    }

    $("#conversion-message-users-plural").html(message);
    $("#conversion-message").show();
  }

  function convertSome() {
    var appUserIds = checkboxTable.getChecked();
    var numusers = appUserIds.length;
    $.ajaxSafeJson({
      type: "POST",
      url: "/admin/app/" + getAppName() + "/instance/" + getInstanceId() + "/conversionSome",
      data: { appUserIds: appUserIds },
      success: function() {
        refreshDatatable();
        enableLinks();
        displayConvertMessage(numusers);
        numConvertible = numConvertible - numusers;
        checkConvertibleAssignmentsButton();
      }
    });
  }

  $("#convert-all-button").live('click', function(e){
    e.preventDefault();
    if ($(e.currentTarget).hasClass('link-button-disabled')) {
      return;
    }
    disableLinks();
    var numusers = $("#convert-all-button span.count").html();
    $("#confirm-convert-all-numusers").html(numusers);
    ModalDialog.openModal(e, "#confirm-convert-all");
  });

  $("#convert-selected-button").live('click', function(e){
    e.preventDefault();
    var appUserIds = checkboxTable.getChecked();
    if (!appUserIds.length) {
      return;
    }
    disableLinks();
    var numusers = $("#convert-selected-button span.count").html();
    if (numusers == 1) {
      $("#confirm-convert-some-users-plural").html("user");
    } else {
      $("#confirm-convert-some-users-plural").html("users");
    }
    $("#confirm-convert-some-numusers").html(numusers);
    ModalDialog.openModal(e, "#confirm-convert-some");
  });

  function convertAll() {
    var numusers = $("#confirm-convert-all-numusers").html();
    $.ajaxSafeJson({
      type: "POST",
      url: "/admin/app/" + getAppName() + "/instance/" + getInstanceId() + "/conversionAll",
      data: {},
      success: function() {
        refreshDatatable();
        enableLinks();
        displayConvertMessage(numusers);
        numConvertible = numConvertible - numusers;
        checkConvertibleAssignmentsButton();
      }
    });
  }

  $("#convert-cancel-button").live('click', function(e){
    e.preventDefault();
    $("#convert-button-panel").show();
    $("#groups-header-tag-convert").hide(0, function(){
      $("#groups-header-tag").show();
    });
    $("#group-convert-help-header").hide();
    $("#group-convert-help-span").hide();
    $("#group-priority-help-header").show();
    $("#group-priority-help-span").show();
    $("#groups-help-header").show();
    $("#groups-help-header-text").show();
    $("#convert-button-panel-convert").hide();
    $("#conversion-content").hide();
    $("#convert-button-panel-default").show();
    $("#groups-content").show();
  });

  function registerModals() {

    ModalDialog.registerModalDialog("#confirm-gaa-edit", {
      confirm: function(e) { editGaa(e); },
      cancel: function(e) {
        $("#confirm-gaa-edit-content").html("");
        enableLinks();
      },
      keepOpen: true,
      minWidth: 680
    });

    ModalDialog.registerModalDialog("#confirm-gaa-add", {
      confirm: function(e) { addGaa(e); },
      cancel: function(e) {
        $("#confirm-gaa-add-content").html("");
        enableLinks();
      },
      keepOpen: true,
      minWidth: 680
    });

    ModalDialog.registerModalDialog("#confirm-gaa-remove", {
      confirm: function(e) { removeGaa(e) },
      cancel: enableLinks,
      minWidth: 560
    });

    ModalDialog.registerModalDialog("#confirm-convert-some", {
      confirm: convertSome,
      cancel: enableLinks,
      minWidth: 560
    });

    ModalDialog.registerModalDialog("#confirm-convert-all", {
      confirm: convertAll,
      cancel: enableLinks,
      minWidth: 560
    });

  }

  function refreshDatatable() {
    checkboxTable.clearCheckboxList();
    datatable.fnFilter("");
  }

  function hideCountInButton() {
    $('#convert-all-button .count').hide().removeClass('count').addClass('no-count');
  }

  function showCountInButton() {
    $('#convert-all-button .no-count').addClass('count').removeClass('no-count').show();
  }

  function removeInaccurateTotalCountWarning() {
    $('#inaccurate-total-count-warning').remove();
  }

  function addInaccurateTotalCountWarning() {
    $('#conversion-content').prepend('<div id="inaccurate-total-count-warning" class="infobox infobox-warning clearfix margin-btm-15">\
      <span class="icon warning-16"></span>\
      <p>Due to the number of users assigned to this app, some users eligible for conversion are not listed. To convert a specific user from individual to group-based assignment, search for that user. To convert all eligible users, click "Convert All".</p>\
      </div>');
  }

  function extendUpdateInfo(originalUpdateInfo) {

    return function (json) {

      // remove the warning and get back the count
      // in case things may go right after convert some.
      removeInaccurateTotalCountWarning();
      showCountInButton();

      // all possible valid cases list below.
      // 1. more than 'one page' convertible users: iTotalDisplayRecords > page size and iTotalRecords === page size
      // 2. exactly one page: iTotalDisplayRecords === iTotalRecords === page size
      // 3. less than one page: iTotalDisplayRecords === iTotalRecords && both < page size
      // 4. no convertible at all.
      //
      // Other than those will be invalid and unexpected at this moment.
      // Backend query may fail to pull up correct count due to expensive query.
      // Force an consistency from UI as work around to cause less confusion to user.
      var pageSize = json.appUserSearchQuery.iDisplayLength;
      if (json.iTotalDisplayRecords < 0 ||
          json.iTotalDisplayRecords > pageSize && json.iTotalRecords < pageSize ||
          json.iTotalDisplayRecords < pageSize && json.iTotalRecords < pageSize && json.iTotalDisplayRecords !== json.iTotalRecords) {
        json.iTotalDisplayRecords = json.iTotalRecords;

        addInaccurateTotalCountWarning();
        // the total number is no longer accurate hence remove it.
        hideCountInButton();
      }

      originalUpdateInfo(json);

      // always enable 'convert all' button due to
      // 1. api cant count total number correctly all the time
      // 2. even though, we still want customers to be able to convert all appusers
      if (checkboxTable.getBars() &&
          checkboxTable.getBars()[0] &&
          checkboxTable.getBars()[0].actionAllButton &&
          checkboxTable.getBars()[0].actionAllButton.setDisabled) {
        checkboxTable.getBars()[0].actionAllButton.setDisabled(false);
      }
    };
  }

  function initConversionPage() {
    var appUserList = new saasure.Widget.AppUserList();

    var opt = appUserList.initTableOpt();

    opt.urlParam = appUserSearchParams;

    checkboxTable = new saasure.Widget.CheckboxTable();
    checkboxTable.initTableOpt(opt);
    opt.updateInfo = extendUpdateInfo(opt.updateInfo);

    checkboxTable.options.actionSelectedButton={
      id: "convert-selected-button",
      text:"Convert Selected",
      imgClass:"group-16"
    };
    checkboxTable.options.actionAllButton={
      id:"convert-all-button",
      text: "Convert All",
      imgClass:"group-16"
    };

    // The cancel is handled by backbone
    if (!assignmentTab) {
      checkboxTable.options.actionCancelButton = {
        id:"convert-cancel-button",
        text: "Cancel"
      };
    }

    checkboxTable.createBar("#topControlControlBar");
    datatable = $('#grouptab-appusers').oktaDataTable(opt);
  }

  function init() {
    registerModals();
    if (!assignmentTab) {
      reloadGroupsList();
      $('#tabs li:has(a[href="#tab-groups"])').one('groupsTabLoaded', countConvertible);
    }
    conversionPageInitialized = false;
  }

  init();

  return {
    initConversionPage: initConversionPage,
  };
};

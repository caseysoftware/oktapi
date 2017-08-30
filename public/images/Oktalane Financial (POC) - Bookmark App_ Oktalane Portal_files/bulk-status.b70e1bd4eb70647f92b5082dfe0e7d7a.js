var BulkAssignStatusController=function(){

    var container;

    var reviewLinkUrl="/admin/app/bulk-assign?groupId=${groupId}";

    var instanceId;

    var template =
            "{{if state == 'SUCCESS'}}<div class='x-bulk-success infobox infobox-success infobox-dismiss'>" +
                    "<a x-group='${groupId}' href='#' title='Close' class='x-clear-bulk infobox-dismiss-link'><span class='dismiss-icon'></span></a>" +
                    "<h4>Assignments completed <span class='text-light show'>${creationDate}</span></h4>" +
                    " <p><a class='x-bulk-status-link' href='" +reviewLinkUrl+ "'>${successCount} of ${totalCount} assignments completed</a></p></div>{{/if}}" +
            "{{if state == 'FAIL'}}<div class='x-bulk-fail infobox infobox-error" +
                    "<h4>${errorCount} assignments failed <span class='text-light show'>${creationDate}</span></h4>" +
                    "<p><a class='x-bulk-status-link' href='" +reviewLinkUrl+ "'>${successCount} of ${totalCount} assignments completed</a></p></div>{{/if}}"+
            "{{if state == 'IN_PROGRESS'}}<div class='x-bulk-in-progress infobox'>" +
                    "</span><h4>Assigning applications... <span class='text-light show'>${creationDate}</span></h4>" +
                    "<p>${successCount} of ${totalCount} assignments completed.</p><p>${errorCount} assignments failed.</p></div>{{/if}}";


    var compiledTemplate;

    var timeoutId;

    function updateUI(json){
        if (json.bulkInfo.length==0){
            container.html("");
            container.hide();
            return;
        }
        container.html("");
        $.tmpl(compiledTemplate,json.bulkInfo).appendTo(container);
        container.show();
    }

    function getInProgressCount(json){
        var inProgressCount=0;
        $.each(json.bulkInfo,function(idx,data){
            if(data.state=="IN_PROGRESS"){
                inProgressCount++;
            }
        });
        return inProgressCount;
    }

    function poll(overrideInterval){
        var url="/admin/app/bulk-assign-status";
        if (instanceId){
            url+="?appInstanceId="+instanceId;
        }

        $.ajaxSafeJson({
            url:url,
            success:function(json){
                updateUI(json);
                var inProgressCount=getInProgressCount(json);

                var interval=inProgressCount==0?300000:15000; //speed up update when there is some bulk assign going on

                if (overrideInterval) {
                    interval=overrideInterval;
                }
                startTimerOnce(interval);
            }
        });
    }

    function startTimerOnce(milliseconds){
        window.clearTimeout(timeoutId);
        timeoutId=window.setTimeout(function(){
            poll();
        },milliseconds);
    }

    this.refresh=function(firstInterval){
        poll(firstInterval);
    };
    this.init=function(containerArg,instanceIdArg){
        container=containerArg;
        instanceId=instanceIdArg;

        compiledTemplate=$.template(template);


        container.find(".x-clear-bulk").live("click",function(e){
            e.preventDefault();

            var elm=$(e.target);
            //elm.prop("disabled", true);
            elm.stop().parents(".infobox-dismiss").fadeOut(500);

            var groupId=elm.closest("a").attr("x-group");

            saasure.ajax.clearBulk(groupId,function(){
                poll();
            });
        });

        poll(3000);

    };
};
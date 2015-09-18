/*********************************
   JavaScript Document
   Author: Sean,Lin
   E-mail:  xiangx.lin@intel.com
   Date:2015-09-18
   Descrption: 
**********************************/
//http://192.168.5.22:8080/configuration/get_group?request_type=cluster
var address_Configuration_Get="../configuration/get_group?request_type=";
var address_Configuration_Set="../configuration/set_config";
var address_Delete="../configuration/del_config";
var address_Status="../monitor/tail_console";
var address_Report="../results/get_summary";
var address_Report_Detail="../results/get_detail";
var address_Report_Detail_pic="../results/get_detail_pic";
var address_Report_Detail_csv="../results/get_detail_csv";
var address_GetRuningStatus="../monitor/cetune_status";
var address_IntoRuningMode="../configuration/execute";
var address_ExitRuningMode="../configuration/cancel";

var timer_RunStatus;
var timer_Console;
var timer_Report;

var interval_RunStatus=30000;
var interval_Console=3000;
var interval_Report=30000;

/*************Interval function************************************************************************/

function RunStatus_Timer(){
    var cetune_status = GetDataByAjax(address_GetRuningStatus);//?
    if(cetune_status.indexOf("running")>=0)
    {
        $("#div_top_status_id a").text(cetune_status);
        $("#div_Configuration_right_back_id").show()
    }
    else
    {
        $("#div_Configuration_right_back_id").hide(); 
        clearTimer(timer_RunStatus);
        $("#div_top_status_id a").text(cetune_status);
        $("#bnt_Configuration_exec_id").attr("value","Execute")
    }
}

function Console_Timer(){
    //(1) get the last timestamp
    var timestamp = GetTimestamp();
    
    //(2) request ajax
    var data ;
    if(timestamp!="" & typeof(timestamp) != "undefined" & timestamp != undefined)
    {
       data ={"timestamp":timestamp};
       var consoleData = GetDataByAjax_POST(address_Status,data);
    }else{
       var consoleData = GetDataByAjax(address_Status);
    }
    
    if(consoleData.content == "")
        return 
    //create content html
    var consoleHTML = "";
    consoleHTML += "<div id='"+consoleData.timestamp+"' class='div_console_timestamp'>";
    consoleHTML += consoleData.content;
    consoleHTML += "</div>";
    
    //insert html
    $("#div_console_id").append(consoleHTML);    
    var scroll_position = 0
    $("#div_console_id").children(".div_console_timestamp").each(function(){ scroll_position += $(this).height()});
    $("#div_console_id").scrollTop( scroll_position );
}


function Report_Timer(){
    var reportSummaryData = GetDataByAjax(address_Report);
    reportSummaryData = reportSummaryData.replace(/<script>.*<\/script>/,'');
    $("#div_Reports").html(reportSummaryData);
	
	
	//----------------------------------------------
    $("#div_Reports tr").dblclick(function(){
		
		
        var session_name = $(this).attr("id"); 
		
		var isAdd=true;
		$("#div_menu_id ul li").each(function(index,value){   
             var a_title  = $(this).attr("title");
             if(a_title == session_name){
              isAdd = false;
			  return false;
            }           
       });
	   
	   if(isAdd != false){
		     var detailReport = GetDataByAjax_POST(address_Report_Detail, {"session_name": session_name})

             detailReport = detailReport.replace(/src=["'].\/include\/pic\/(\S*).png["']/g,'attr="$1"');
             detailReport = detailReport.replace(/<script>.*<\/script>/,'');
             //style='max-width:100px; overflow:hidden; white-space: nowrap; text-overflow:ellipsis;
		     var appendHtml = "<li id='menu_li_"+session_name+"' class='li_add_menu_class' padding-right:10px;' title='"+session_name+"'>";
			 var str;
		     if(session_name.length >= 4){
			    str=session_name.substring(0,4) + " ...";
		     }
			 
			 appendHtml +="<a id='menu_"+session_name+"'>"+ str +"</a>";
		
		     appendHtml +="<img class='img_menu_li_cancel_class' src='image/cancel.png'>";
		     appendHtml +="</li>";
			 
			 
			$("#div_menu_id ul").append(appendHtml);
			
			$(".div_tab_class").last().after("<div id='div_"+session_name+"' class = 'div_tab_class'></div>")
			$("#div_"+session_name).html( detailReport );
			$("#div_"+session_name).hide();
			//$("#div_"+session_name+" #tabs" ).tabs();
			//---------------------------------------------------------------------------------
			
			
			//$("#tabs ul li").delegate("a", "click", function(){
			$("#div_"+session_name+" #tabs ul li a").click(function(){
				//set menu style
				$("#tabs ul li").removeClass("tabs_li_click");
				$(this).parent().addClass("tabs_li_click");
				var tabsName = $(this).text();
				var div_id = "#" + tabsName;
				$("#tabs").children('div').hide();
				
				$(div_id).show();
			 
			});
			
			
			$("#div_"+session_name+" .cetune_pic").hide();
			
			$("#menu_"+session_name).click();
			  
			
           $( ".cetune_table a" ).click(function(){
			  $(this).parents('.cetune_table').parent().children('.cetune_pic').hide();
			  var id=$(this).attr('id'); 
			  pic = $(this).parents('.cetune_table').parent().children('#'+id+'_pic').children("img");
			  pic_name = pic.attr("attr");
			  if(pic.attr("src") == undefined){
				  pic.attr("src", address_Report_Detail_pic+"?session_name="+session_name+"&pic_name="+pic_name+".png" );
				  pic.next().attr("href", address_Report_Detail_csv+"?session_name="+session_name+"&csv_name="+pic_name+".csv");
				  pic.parent().show();
				  pic.next().click(function(){url=$(this).attr("href");location.href=url})
			  }//if
           });
		    
	   }//if
	   else
	   {
		   var li_id = "menu_li_"+session_name;
		   //var img_id = "";
		   var div_id = "div_"+session_name;
		   $("#"+li_id).click();
		   
	   }
	   
	   $("#div_"+session_name+" #tabs ul li a").eq(0).click();
	   
    });
}

//close the specific timer
function clearTimer(timer_obj){
    clearInterval(timer_obj);
}

//get timestamp from last sub div'id by console div 
function GetTimestamp(){
    var timestamp = $("#div_console_id").children().last().attr('id');
    return timestamp;
}

/*******************************************************************************************************/
$(document).ready(function(){
      
    //init seting-------------------------------------------------------------------------
   Init(); 
	  
   
		  
	  
	  
   //tab menu style click-----------------------------------------------------------------
   //$("#div_menu_id ul li").click(function(){
   $("#div_menu_id ul").delegate("li", "click", function(){

        //set menu style
        $("#div_menu_id ul li").removeClass("tab_background_click");
        $(this).addClass("tab_background_click");
        
		//show the cancel img
		 $("#div_menu_id ul li").children("img").hide();
		 $(this).children("img").show();
		
        //show and hide the sub div
        var index = $(this).index();
        $(".div_tab_class").eq(index).show().siblings(".div_tab_class").hide();

        //get the tab name
        var menuName = $(this).children().eq(0).attr('id');

        //clear specific timer
        switch(menuName)
        {
            case "menu_Configuration_id":
                clearTimer(timer_Console);
                clearTimer(timer_Report);
                RunStatus_Timer();
                timer_RunStatus = setInterval(RunStatus_Timer,interval_RunStatus);
               break;
            
            case "menu_Status_id": 
			
			    //init left li style, default select first li
			    $(".div_Status_left_nav_li_class > a").eq(0).addClass('active');
				
                clearTimer(timer_Report);
                Console_Timer();
                timer_Console = setInterval(Console_Timer,interval_Console);
               break;
               
            case "menu_Reports_id": 
                clearTimer(timer_Console);
                Report_Timer();
                timer_Report = setInterval(Report_Timer,interval_Report);
                break;
                
            default: 
                clearTimer(timer_Console);
                clearTimer(timer_Report);
        }//switch
		 
        //start timer for this tab
        
        //      
    });
	
	//delegate("li", "click", function()
	
	   $("#div_menu_id ul").delegate(".img_menu_li_cancel_class", "mousemove", function(){
		   $(this).addClass("img_active");
	    });
	    $("#div_menu_id ul").delegate(".img_menu_li_cancel_class", "mouseover", function(){
		   $(this).removeClass("img_active");
	    });
	    $("#div_menu_id ul").delegate(".img_menu_li_cancel_class", "mouseout", function(){
		   $(this).removeClass("img_active");
    	});
		//cancel tab
		$("#div_menu_id ul").delegate(".img_menu_li_cancel_class", "click", function(event){
					
			//show the prev element tab div
			var currentDiv_id = "div_" + $(this).parent().attr("title");
			var prevDiv_id = "div_" + $(this).parent().prev().attr("title");

			$("#"+currentDiv_id).remove();
			/*$(".div_tab_class").hide();
            $("#"+prevDiv_id).show();*/
		    
			//add class to prev element and show cancel img
		/*	$(this).parent().prev().addClass("tab_background_click");
			$(this).parent().prev().children("img").show();*/
			

			 //remove current parnet element(li)
			$(this).parent().remove();
		    $("#Reports_id").click();
			event.stopPropagation();    //  Stop the event bubbling
		/*	$("#Reports_id").addClass("tab_background_click");
			$("#Reports_id").children("img").show();
			$("div_Reports").show();*/
			
	    });
	
	
	

    //left sub menu click--------------------------------------------------------
    $("#dl_Configuration_left_nav_accordion_id ul li a").click(function(e){
        //(1) change right page title 
        var title = $(this).text();            
        $("#div_Configuration_right_top_titel_id").html(title);
        //(2) display data table      
        var id = $(e.target).attr('id');

        $("#div_Configuration_right_top_titel_id").attr("title",id);
        
        // display the table when cilic the sub mune, arg is li a element's id
        //-----------------------------------------------    
        DisplayConfiguationDataTable(id);//code on server
        //LocalTest_DisplayConfiguationDataTable(id);// code for local test
        //-----------------------------------------------            
    });
	
    
    //traverse the sub menu li, check Configuation Data is true----------------------------------
    $("#dl_Configuration_left_nav_accordion_id ul li a").each(function(index,value){
         var id = this.id;
         
         //get this li data 
         //--------------------------------------
         var jsonObj = GetConfigurationData(id);  // code on server
         //var jsonObj = LocalTest_GetConfigurationData(id); // code for local test
         //---------------------------------------
         
         var check = IsContentError(jsonObj);
         //change the img and title style for check result
         if(check == false){    
            $(this).children("img").attr("src","image/config_Wait.gif");
            $(this).children("img").attr("title","false");
         } 
     });
    
    //Executive 
    if(CheckIsExecutive() == "true"){    
        $("#bnt_Configuration_exec_id").removeAttr("disabled");        //re-enable
        $("#bnt_Configuration_exec_id").addClass("bnt_Configuration_exec");
    }else{
        $("#bnt_Configuration_exec_id").attr("disabled",true);
        $("#bnt_Configuration_exec_id").removeClass("bnt_Configuration_exec");
    }
       
    
    //Executive button click
    $("#bnt_Configuration_exec_id").click(function(){
        
        //1 check server is runing now? 
        
        
        //2 into the runing mode
        var stat = $(this).attr("value");
        if(stat=="Execute"){
            var result = GetDataByAjax(address_IntoRuningMode);  // code on server
            if(result != "false"){
                 $(this).attr("value","Cancel Job")
                 //show the runing status logo and title on top bar;
                 $("#div_top_stauts_id h1").show(); 
                 // a back div for keep out right opertion elements;
                 $("#div_Configuration_right_back_id").show(); 
                 $("#menu_Status_id").click();
            }else{
                 alert("Failed to start");
            }
        }
        if(stat=="Cancel Job"){
            var result = GetDataByAjax(address_ExitRuningMode);  // code on server
            if(result=="true"){
                 $(this).attr("value","Execute")
                 $("#div_Configuration_right_back_id").hide(); 
                 $("#menu_Status_id").click();
            }
        }

    });
    
  
  
   
  
   

});



//init setting
function Init(){
     
    //(1)tab seting
    $("#div_menu_id ul li").eq(0).addClass("tab_background_click");
    $(".div_tab_class").eq(0).show().siblings(".div_tab_class").hide();

    //(2)display the table for first sub mune (li a element's id) when the page load , defalut is "workflow"
    //-----------------------------------------------------------------------------
    DisplayConfiguationDataTable("cluster"); //code on server
    //LocalTest_DisplayConfiguationDataTable("workflow"); // code for local test
	//$(".div_Configuration_left_nav_li_class").first().children("a").click();   
    //-----------------------------------------------------------------------------
 
    //(3)change the title    
    var title = $("#dl_Configuration_left_nav_accordion_id ul li").eq(0).children("a").text();
    $("#div_Configuration_right_top_titel_id").html(title);
	var a_id = $("#dl_Configuration_left_nav_accordion_id ul li").eq(0).children("a").attr("id");
    $("#div_Configuration_right_top_titel_id").attr("title",a_id);
	 
	
    //(4)decide server is runing,start the timer;
    RunStatus_Timer();
    timer_RunStatus = setInterval(RunStatus_Timer,interval_RunStatus);
	
}

//decide this json data is content error check
function IsContentError(jsonObj){
        
    var check = true;
    $.each(jsonObj,function(index,val){
        if(val.check == "False"){
            check = false;
            return false;
        }         
    });
    //alert(check);
    return check;
}

//traverse the sub mune li, decide the li is true  and Execuvite button is display; 
function CheckIsExecutive(){
 var canExe="true";
 $("#dl_Configuration_left_nav_accordion_id ul li a").each(function(index,value){   
        var exe_status = $(this).children("img").attr("title");
        if(exe_status == "false"){
            canExe="false";
            return false;
        }           
  });
  return canExe;
}

//get the configuation ajax address for request type
function GetConfigurationAjaxAddress(request_type){
    var address_Config = "";
    address_Config = address_Configuration_Get + request_type;
    return address_Config;
}

//get the configuation data from ajax funtion
function GetConfigurationData(request_type){
    //(1) get the address by request type
    var address = GetConfigurationAjaxAddress(request_type);
    //(2) request the ajax
    var jsonObj_Config = GetDataByAjax(address);
    return jsonObj_Config;
}


//Display configuation data table and banchmark table on right page
function DisplayConfiguationDataTable(request_type){
    //(1) get data for json obj
    var jsonObj_Config = GetConfigurationData(request_type);
    
    var address_Benchmark = "../configuration/get_group?request_type=testcase"; 
    var jsonObj_Benchmark = GetDataByAjax(address_Benchmark);    
    
    //(2) display table
    CreateDataTableForConfiguration(jsonObj_Config , jsonObj_Benchmark ,request_type);
}

//get data by ajax(post)
function GetDataByAjax_POST(addressURL , data){
    var jsonObj;
    $.ajax({
       type:"POST",
       url:addressURL,
       data: data,
       //dataType:"json",
       async:false,
       success:function(ResponseText){
         try
         {
             jsonObj=ResponseText;//get json string and chenge it to json object;
         }
         catch(err)
         {
             jsonObj= null;
         }
       } 
    });    
    return jsonObj;
}


//get data by ajax
function GetDataByAjax(addressURL){
    var jsonObj;
    $.ajax({
       type:"GET",
       url:addressURL,
       //dataType:"json",
       async:false,
       success:function(ResponseText){
         try
         {
             jsonObj=ResponseText;//get json string and chenge it to json object;
         }
         catch(err)
         {
             jsonObj= null;
         }
       } 
    });    
    return jsonObj;
}


//into the server runing Mode
function IntoRuningMode()
{
}




//********(there test functions for local debug, the data source are text in local dir)**********************************
//get the configuation ajax address for request type
function LocalTest_GetConfigurationAjaxAddress(request_type){
    
    var address_Config = "";    
    switch(request_type)
    {
        case "workflow": address_Config="workflow.txt";break;
        case "cluster": address_Config="cluster.txt";break;
        case "system": address_Config="system.txt";break;
        case "ceph": address_Config="ceph.txt";break;
        case "benchmark": address_Config="benchmark.txt";break;
        case "analyzer": address_Config="analyzer.txt";break;
    }        
    return address_Config;
}


//get the configuation data from ajax funtion
function LocalTest_GetConfigurationData(request_type){
    var address = LocalTest_GetConfigurationAjaxAddress(request_type);
    var jsonObj_Config = GetDataByAjax(address);    
    return jsonObj_Config;
}



//Display configuation data table and banchmark table on right page
function LocalTest_DisplayConfiguationDataTable(request_type){

    //(1) get data for json obj
    var jsonObj_Config = LocalTest_GetConfigurationData(request_type);
    
    var address_Benchmark = "benchmarkTable.txt";
    var jsonObj_Benchmark = GetDataByAjax(address_Benchmark);
    
    //(3) display table
    CreateDataTableForConfiguration(jsonObj_Config , jsonObj_Benchmark ,request_type);
}
//*******************************************************************************************************



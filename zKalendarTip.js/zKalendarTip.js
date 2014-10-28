/*
 * 日历弹出窗口 by zhuxiaoping
 * */

!function ($) {
	
	if($('head').html().indexOf("kalendae.css") == -1){
	    $('head').append('<link rel="stylesheet" href="kalendae/kalendae.css" type="text/css" />');
	    $('head').append('<script type="text/javascript" src="kalendae/kalendae.standalone.js"></script>');
	}
	
	/*
	 * */
	function ZKalendarTip(options){
		this.options = null;
		
		this.defaults = {
			element:undefined,         //request true
			begin:undefined,
			end:undefined,
			ok:undefined,
			cancel:undefined
		};
	};
	
	ZKalendarTip.prototype = {
	    constructor: ZKalendarTip,
	    _init	: function(options){
	    	var opts = $.extend(true, {}, this.defaults, options);
	    	this.options = opts;
	    	var instance = this;
	    	
	    	var  msg = '<div class="showDateWidget" style="padding:2px;border:#ccc 1px solid;color:#aaaaaa;font-size:14px;font-family: Simsun;">';
			   msg += '<div style="margin: 5px;">选择日期范围</div>';
			   msg+= '<div style="clear:both;"></div>';
			   msg += '<div style="padding: 3px 0px 0px 6px;float:left;"><input readOnly class="custom_input_text input_date1" type="text" style="width: 85px;text-align: center;font-size: 14px;margin-right: 0;"> -- </div>';
			   msg += '<div style="padding: 3px 0px 0px 6px;float:left;"><input readOnly class="custom_input_text input_date2" type="text" style="width: 85px;text-align: center;font-size: 14px;margin-right: 0;"></div>';
			   msg += '<div style="padding: 10px 10px 0px 10px;float:left;"><i class="clearDate icon_checkbox_select"></i><span style="margin-right:10px;">所有日期</span></div>'
			   msg+= '<div style="clear:both;"></div><div class="kalendaeWrapper" style="margin:10px auto;width:375px;"></div></div>';
            $(opts.element).tooltip({
                position: 'bottom',
                content: msg,
				showEvent: 'click',
				hideEvent: '',
				onShow:function(){
					instance._tooltip = this;
					var self = this,$base = $(this).tooltip('tip');
				      $base.click(function (event) {
                        event.stopPropagation();
                      });
        			  $(document).one('click',function(event){
        				  instance._closeToolTip();
                	  });
					if($base.data('openCount')) return;
					$base.data('openCount',1);
					$base.css({
                        backgroundColor: '#f3f3f3',
						padding:0,
						borderWidth:0
                    });
					$(this).tooltip('arrow').css({
					    borderWidth:12,
					});
				    
					 var k1 = new Kalendae({
            			attachTo:$base.find('.kalendaeWrapper')[0],
            			months:1,
            			mode:'single',
						selected:opts.begin,
						subscribe: {
                           'change': function (date, action) {
                        	   $base.find(".clearDate").removeClass('icon_checkbox_select').addClass('icon_checkbox_noselect');
						       var begin = this.getSelected();
						       $base.find(".input_date1").val(begin);
							   if(k2){
							       if(Kalendae.moment(k2.getSelected()) - Kalendae.moment(begin) < 0)
								   {
								       k2.setSelected(begin,true);
								   }
								   k2.blackout= function (date) {
                            		   return Kalendae.moment(date) - Kalendae.moment(begin) < 0 ? 1 : 0;
                            	   };
								   k2.draw();
							   }
                           }
                       }
            		});
					 var k2 = new Kalendae({
            			attachTo:$base.find('.kalendaeWrapper')[0],
            			months:1,
            			mode:'single',
						selected:opts.end,
						blackout: function (date) {
                           return (opts.begin && Kalendae.moment(date) - Kalendae.moment(opts.begin) < 0) ? 1 : 0;
                        },
						subscribe: {
                           'change': function (date, action) {
                        	   $base.find(".clearDate").removeClass('icon_checkbox_select').addClass('icon_checkbox_noselect');
                        	   $base.find(".input_date2").val(this.getSelected());
                           }
                       }
            		});
					 
					 instance._k1 = k1;
					 instance._k2 = k2;
					
					 $base.find('.showDateWidget').append('<div style="margin: 10px 8px 10px 0;text-align: right;"><a class="dateCancel_btn custom_gray_btn" href="javascript:void(0);">取消</a><a href="javascript:void(0);" class="dateSelect_btn custom_orange_btn">确定</a></div>');
					if(opts.begin){
						$base.find(".clearDate").removeClass('icon_checkbox_select').addClass('icon_checkbox_noselect');
					}
					$base.find(".clearDate").click(function(){
					    if($(this).hasClass("icon_checkbox_select")){
						   $(this).removeClass('icon_checkbox_select').addClass('icon_checkbox_noselect');
						   if($base.find(".input_date1").data('date'))k1.setSelected($base.find(".input_date1").data('date'),true);
						   if($base.find(".input_date2").data('date'))k2.setSelected($base.find(".input_date2").data('date'),true);
						}
						else{
							$base.find(".input_date1").data('date',$base.find(".input_date1").val()).val(''); 
							$base.find(".input_date2").data('date',$base.find(".input_date2").val()).val(''); 
						    if(k1.getSelected())k1.removeSelected(k1.getSelected(),true);
							if(k2.getSelected())k2.removeSelected(k2.getSelected(),true);
						   $(this).removeClass('icon_checkbox_noselect').addClass('icon_checkbox_select');
						}
					});
					$base.find(".dateSelect_btn").click(function(){
						if(!$base.find(".clearDate").hasClass("icon_checkbox_select"))
						  {
						      var begin = $base.find(".input_date1").val() == "" ? null :$base.find(".input_date1").val();
							  var end = $base.find(".input_date2").val() == "" ? null : $base.find(".input_date2").val();
							  
							  instance.options.begin = begin;
							  instance.options.end = end;
							  
						  }
						  else{
							  instance.options.begin = null;
							  instance.options.end = null;
						  }
						  opts.ok(instance.options.begin,instance.options.end);
						  instance._closeToolTip();
					});
					$base.find(".dateCancel_btn").click(function(){
						instance._closeToolTip();
				    });
				 }
            });			    	
	    },
	    _closeToolTip : function(){
	    	var instance = this,$base = $(this._tooltip).tooltip('tip');
	    	if(instance.options.begin || instance.options.end){
	    		$base.find(".clearDate").removeClass('icon_checkbox_select').addClass('icon_checkbox_noselect');
	    		if(instance.options.begin)instance._k1.setSelected(instance.options.begin,true);
	    		if(instance.options.end)instance._k2.setSelected(instance.options.end,true);
	    	}
	    	else{
	    		if(instance._k1.getSelected())instance._k1.removeSelected(instance._k1.getSelected(),true);
	    		if(instance._k2.getSelected())instance._k2.removeSelected(instance._k2.getSelected(),true);
	    		$base.find(".clearDate").removeClass('icon_checkbox_noselect').addClass('icon_checkbox_select');
	    	}
	    	$(document).unbind('click');    
			$(instance._tooltip).tooltip('hide');
	    },
	    getCurrentTime : function(){
	    	return {begin:this.options.begin,end:this.options.end};
	    }
	};	
	
	$.zKalendarTip = function(options){
		var zk = new ZKalendarTip(options);
		zk._init(options);
		return zk;
	};
	
}(window.jQuery);
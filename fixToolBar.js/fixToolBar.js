/*
 * 固定工具条 by zhuxiaoping
 * */

!function ($) {
	
	if($('head').html().indexOf("fixToolBar.css") == -1){
		$('head').append('<link rel="stylesheet" href="fixToolBar.css" type="text/css" />');
	}
	/*
	 * options param:{
	 * show:true,       //request false
	 * parent:'body',   //request false
	 * position:'0.5' //request false  value:0-1
	 * list:[     //request false
	 * {title:'xxx',icon:'css',data:{},load:function($el,data){},eventHandles:{'click':function(e){}}}
	 * ],
	 * success : function(){}  //request false
	 * }
	 * */
	function fixToolBar(options){
		this._options = options || {};
		this._list = [];
		this._userlist = this._options.list || [];
		this.parent = this._options.parent || 'body';
		this._success = this._options.success;
		this._show = this._options.show == false ? false : true;
		this._ratio = this._options.position != undefined && typeof this._options.position == 'number' && this._options.position <= 1 && this._options.position >=0 ? this._options.position :0.5;
		this.element = null;
		
		this._init = function(){
			var self = this;
			$(self.parent).find(".fixToolBar").remove();
			var html = '<div class="fixToolBar"><ul></ul></div>';
			$(self.parent).append(html);
			self._list.push({title:'回顶部',icon:'icon_fix_top',eventHandles:{'click':function(event){
				if(scroll=="off") return;
				$('html,body').animate({scrollTop: 0}, 300);
			}}});
			self._list = self._list.concat(self._userlist);
			self._list.push({title:'到底部',icon:'icon_fix_bottom',eventHandles:{'click':function(event){
				if(scroll=="off") return;
				var sh = $(document).height() - $(window).height();
				$('html,body').animate({scrollTop: sh}, 300);
			}}});
			$.each(self._list,function(i,v){
				var s= '<li><a href="javascript:void(0)"><i class="'+v.icon+'"></i><p>'+v.title+'</p></a></li>'
				$(self.parent).find(".fixToolBar ul").append(s);
				if(v.load){
					v.load($(self.parent).find(".fixToolBar li:last-child"),v.data);
				}
				if(v.eventHandles){
					$(self.parent).find(".fixToolBar li:last-child a").bind(v.eventHandles,v.data);
				}
			})
			
			self.element = $(self.parent).find(".fixToolBar");
			var wh = Math.round((document.body.clientHeight - self.element.height())* self._ratio);
			console.log(wh,self._ratio);
			self.element.css('top',wh+"px");
			
			self._initScrollDiv(0);
			$(window).scroll(function () {
				self._initScrollDiv(200);
			});
			
			if(!self._show){
				self.hide();
			}
			
			if(self._success){
				self._success();
			}
		};
		this._initScrollDiv = function(time){
			var self = this,sh = $(document).height() - $(window).height();
			if(sh == 0){
				$(self.parent).find(".fixToolBar li:first-child a").fadeOut(time);
				$(self.parent).find(".fixToolBar li:last-child a").fadeOut(time);
				return;
			}
			var st = $(window).scrollTop();
			if(st == 0){
				$(self.parent).find(".fixToolBar li:first-child a").fadeOut(time);
				$(self.parent).find(".fixToolBar li:last-child a").show();
			}
			else if(st == sh){
				$(self.parent).find(".fixToolBar li:last-child a").fadeOut(time);
				$(self.parent).find(".fixToolBar li:first-child a").show();
			}
			else{
				$(self.parent).find(".fixToolBar li:first-child a").show();
				$(self.parent).find(".fixToolBar li:last-child a").show();
			}
		}
	}
	
	fixToolBar.prototype = {
	        constructor: fixToolBar,

	        show: function () {
	        	var self = this;
	        	$(self.parent).find(".fixToolBar").show();
	        	$.each(self._list,function(i,v){
	        		if(v.onShow)v.onShow($(self.parent).find(".fixToolBar li:nth-child("+(i+1)+")"),v.data);
	        	});
	        },
	        enable: function(){
	        	var self = this;
	        	$(self.parent).find(".fixToolBar li:not(:last-child):not(:first-child)").removeClass("disabled");
	        },
	        disable: function(){
	        	var self = this;
	        	$(self.parent).find(".fixToolBar li:not(:last-child):not(:first-child)").addClass("disabled");
	        },
	        hide:function(){
	        	$(this.parent).find(".fixToolBar").hide();
	        },
	        destroy:function(){
	        	$(this.parent).find(".fixToolBar").remove();
	        	self.element = null;
	        }
	}
	
	
	$.fixToolBar = function(options){
		var ftb = new fixToolBar(options);
		ftb._init();
        return ftb;
	}
}(window.jQuery);
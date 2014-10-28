/*
 * 标签功能 by zhuxiaoping
 * */

!function ($,dfdJsonGet,htmlEncode) {
	if($('head').html().indexOf("ztag.css") == -1){
	    $('head').append('<link rel="stylesheet" href="ztag.css" type="text/css" />');
	}
	/*
	 * */
	function Ztag(options){
		this.$taglist = null;
		this.options = null;
		this.selectedTag = null;
		this.editButton = {btnEl:undefined};
		
		this.defaults = {
			parent:undefined,         //request true
			category:undefined,            //request true   获取标签的category
			baseUrl:"",               //request true   ${base}
			selectTagId:0,    //request false  选中tag id
			deleteTagsSuccess:undefined, //request true 删除标签后的回调
			editable:false,          //request true 标签是否可被编辑
			editableBtn:undefined,   //request true 编辑标签按钮,
			selectTagCallBack:undefined, //request true 选中某个标签后的回调
			loadSuccess:undefined
		};
	};
	
	Ztag.prototype = {
	    constructor: Ztag,
	    _create	: function(options){
	    	var opts = $.extend(true, {}, this.defaults, options);
	    	this.options = opts;
	    	var $parent = $(this.options.parent),instance = this;
	    	this.editButton.btnEl = instance.options.editableBtn;
	    	instance._bindEditableBtn();
	    	instance._initEditableBtn(false,false);
			
			var html = '<ul class="ztagList"></ul>';
			$parent.append(html);
			
			instance.$taglist = $parent.find(".ztagList");
			
			var url = opts.category == "product" ? opts.baseUrl+"/management/product/get-all-tags" : opts.baseUrl+'/tag/list/'+opts.category;
			
			dfdJsonGet(url).done(function(list){
				instance._loadUrlSuccess(list);
				if(opts.loadSuccess){
					opts.loadSuccess();
				}
			});
			
	    },
	    _loadUrlSuccess : function(list){
	    	if(this.options.category == "product"){
	    		var all = [{id:'-1',name:"全部"}];
	    		list = all.concat(list);
	    	}
	    	this._draw(list);
	    },
	    _draw : function(list){
	    	var instance = this;
	    	var hasEditableTag = false;
	    	instance.$taglist.html('');
	    	$.each(list,function(i,v){
	    		  var selected = false;
	    		  if(instance.options.selectTagId && v.id == instance.options.selectTagId){
	    			  instance.selectedTag = v;
	    			  selected = true;
	    		  }
	    		  else if(!instance.options.selectTagId && i == 0){
	    			  instance.selectedTag = v;
	    			  selected = true;
	    		  }
	              var tpl = '<li class="'+(selected?'select tag-item':'tag-item')+'" data-id='+v.id+'>';
	        	  tpl += '<a data-id='+v.id+' class="tag-link ztagcolor'+Math.floor(i/6)%2+'-'+(i%6)+'">';
				   tpl += '<span class="tag-yes">√</span>';
	        	  tpl += '<span class="txt-name">'+htmlEncode(v.name)+'</span>';
	        	  if(v.count){
	        	      tpl += '<span class="tag-album-item-num">('+v.count+')</span>';
	        	  }
	        	  tpl += '</a>';
				  if(v.id != -1 && v.id != 0){
	        	    tpl += '<i class="icon_edit_modify" style="display:none;"></i><i class="icon_edit_recycle" style="display:none;"></i>';
	        	    hasEditableTag = true;
				  }
	        	  tpl += '</li>';
	        	  instance.$taglist.append(tpl);
	        	  instance.$taglist.find(".tag-item:last-child").data('tag',v);
	        });
	    	instance._initEditableBtn(hasEditableTag,false);
	    	
	    	$.each(instance.$taglist.find(".icon_edit_modify"),function(i,v){
				  if($("#editTagName").length > 0) return;
	              var str = '<div id="editTagName" style="padding:10px;background-color:#f2f2f2;border:#ccc 1px solid;">';
	        		str += '<div class="add-box-line" style="margin:0px auto;width: 245px;"><form class="validate_input_form">';
	        		str +=	'<input value="{name}" class="custom_input_text" style="width:161px;" placeholder="请输入名称" /></form>';
	        		str +=	'<a href="javascript:void(0);" data-id="{id}" class="custom_orange_btn" style="padding:6px 14px;">保存</a>';
	        		str +='</div>';
	              str +='</div>';
	        	  str = str.replace('{name}',$(this).parent().find('.txt-name').text());
	        	  str = str.replace('{id}',$(this).parent().attr("data-id"));
				  $(this).tooltip({
	                    position: 'bottom',
	                    content: str,
						showEvent: 'click',
						hideEvent: '',
						onShow:function(){
						     $(this).tooltip('tip').click(function (event) {
	                            event.stopPropagation();
	                          });
	                		  var self = this;
	            			  $(document).one('click',function(event){
	                    	       $(self).tooltip('hide');
	                    	  });
						    if($(this).tooltip('tip').data('openCount')) return;
						    $(this).tooltip('tip').data('openCount',1);
							$(this).tooltip('tip').css({
	                            backgroundColor: '#f3f3f3',
								padding:0,
								borderWidth:0
	                        });
							$(this).tooltip('arrow').css({
							    borderWidth:12,
							});
						    $('#editTagName .custom_input_text').validatebox({
	                                required: true,
	                                validType: 'maxLength[20,10]'
	                         });
						    
						    $('#editTagName .custom_orange_btn').click(function(){
                                        instance._renameTag($(this).attr("data-id"));
                            });
	    				 }
	                });				
	          });
	    	instance.$taglist.find(".icon_edit_recycle").bind('click',function(){
	             var id = $(this).parent().attr("data-id");
	                 $.messager.confirm('操作确认', '您确定要删除该标签吗?', function(r){
	                	if (r){
	                		instance._confirmDeleteCallback(id);
	                	}
	               });
	          });
	    	instance.$taglist.find(".tag-item").bind('click',function(){
	               if(!instance.editButton.active){
	            	   instance.$taglist.find(".select").removeClass('select');
	            	   instance.selectedTag = $(this).data('tag');
	                      var id = $(this).addClass('select').attr('data-id');
	                      instance.options.selectTagId = id;
	                      instance.options.selectTagCallBack(id);
	        		}
	          });
	    },
	    _confirmDeleteCallback : function(id){
	    	var instance = this;
	    	var url = instance.options.category == "product" ? instance.options.baseUrl+"/management/product/remove-tag/"+id : instance.options.baseUrl+'/tag/'+id;
	    	$.ajax({url:url,type:'DELETE'}).done(function(){
    		    if(instance.options.deleteTagsSuccess){
    		    	instance.options.deleteTagsSuccess();
    		    }
    		    else{
    		    	$('#right-panel').panel('refresh');
    		    }
    		});
	    },
	    _renameTag : function(id){
	    	var instance = this;
	        var name = $('#editTagName .custom_input_text').val();
	    	if($('#editTagName .check_input_form').form('validate')){
	            var url = instance.options.category == "product" ? instance.options.baseUrl+'/management/product/tag/rename/'+id+'.ajax' : instance.options.baseUrl+'/tag/rename/'+id+'.ajax';
	    		dfdJsonPost2(url,{id:id,name:name}).done(function(){
	        	    instance.refresh();
	        	    instance._initEditableBtn(true,false);
	        	    $('#editTagName').parent().parent().remove();
	        	});
	    	}
	    },
	    _initEditableBtn : function(show,active){
	    	var instance = this;
	    	if(instance.editButton.show != show){
		    	instance.editButton.show = show;
		    	if(instance.options.editable && instance.editButton.show){
		    		instance.editButton.btnEl.show();
		    		instance.editButton.btnEl.parent().css('margin-top',"-"+Math.floor(instance.editButton.btnEl.parent().height()/2)+"px");
		    		instance.editButton.btnEl.parent().parent().parent().css('min-height',"52px");
		    	}
	    	    else if(instance.editButton.btnEl){
	    		    instance.editButton.btnEl.hide();
	    		    if(instance.options.category != "product"){
	    		        instance.editButton.btnEl.parent().css('margin-top',"-"+Math.floor(instance.editButton.btnEl.parent().height()/2)+"px");
	    		        instance.editButton.btnEl.parent().parent().parent().css('min-height','0');
	    		    }
	    	    }
	    	}
	    	if(instance.editButton.active != active){
		    	instance.editButton.active = active;
		    	if(instance.options.editable && instance.editButton.active){
		    		instance.editButton.btnEl.addClass("ztag_btn_active");
		    	}
		    	else if(instance.editButton.btnEl){
		    		instance.editButton.btnEl.removeClass("ztag_btn_active");
		    	}
	    	}
	    },
	    _bindEditableBtn : function(){
	    	var instance = this;
	    	if(!instance.options.editable) return;
	    	instance.editButton.btnEl.click(function(){
	    	    if(!instance.editButton.active){
	    	    	instance.$taglist.find("li .icon_edit_modify").show();
	    	    	instance.$taglist.find("li .icon_edit_recycle").show();
	    	    	instance._initEditableBtn(true,true);
	    		}
	    		else{
	    			instance.$taglist.find("li .icon_edit_modify").hide();
	    			instance.$taglist.find("li .icon_edit_recycle").hide();
	    			instance._initEditableBtn(true,false);
	    		}
	    	});
	    },
	    refresh : function(){
	    	var instance = this,opts = this.options;
	    	var url = opts.category == "product" ? opts.baseUrl+"/management/product/get-all-tags" : opts.baseUrl+'/tag/list/'+opts.category;
	    	dfdJsonGet(url).done(function(list){
				instance._loadUrlSuccess(list);
			});
	    },
	    getSelectTag : function(){
	    	var $tl = this.$taglist.find(".tag-item[data-id="+this.options.selectTagId+"]");
	    	var tag = {};
	    	tag.id = this.options.selectTagId;
	    	tag.name = $tl.find(".txt-name").text();
	    	var count = $tl.find(".tag-album-item-num").text();
	    	count = count.substring(count.indexOf("(")+1,count.indexOf(")"));
	    	tag.count = +count;
	    	return tag;
	    }
	    
	};	
	
	$.ztag = function(options){
		var zt = new Ztag(options);
		zt._create(options);
		return zt;
	};
	
}(window.jQuery,dfdJsonGet,htmlEncode);
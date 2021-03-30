(function ($, window, document, undefined) {

	// 'use strict';

	$(function () {

		// console.log('ASH // ABS-CBN DEV');

		// Easing
		jQuery.extend(jQuery.easing, {
			easeInExpo: function (x, t, b, c, d) {
				return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
			},
			easeOutExpo: function (x, t, b, c, d) {
				return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
			},
			easeInOutExpo: function (x, t, b, c, d) {
				if (t == 0) return b;
				if (t == d) return b + c;
				if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
				return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
			},
			easeInBack: function (x, t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			},
			easeOutBack: function (x, t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			},
			easeInOutBack: function (x, t, b, c, d, s) {
				if (s == undefined) s = 1.70158;
				if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			},
			easeInElastic: function (x, t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			},
			easeOutElastic: function (x, t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
			},
			easeInOutElastic: function (x, t, b, c, d) {
				var s=1.70158;var p=0;var a=c;
				if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
				if (a < Math.abs(c)) { a=c; var s=p/4; }
				else var s = p/(2*Math.PI) * Math.asin (c/a);
				if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
				return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
			}
		});

		// GLOBAL VARIABLES

		// Social Pane
		var socialHolder = $('.social-holder'),
			socialHolderList = socialHolder.find('li'),
			socialHolderSlide = socialHolderList.find('.slide'),
			containerScroll = $('.container-scroll');

		// Custom Select
		var customSelect = $('.option-set');

		// Header height
		var headerHeight = $('.header').height();

		// Sticky share trigger point
		var shareStickyTrigger = $('.header').offset().top + headerHeight;

		// Canvas
		var canvas;

		// Load more data
		var feed = [];
		var feedOutput = '';
		var feed_order = 0;
		var next_url = '';

		// FUNCTIONS

		// Carousel - Set Fluid Width
		var fluidity = (function () {

			function setFluidWidths(container, groupClassName, listContainer, fluidWidth, totalItem, itemWidth, itemMargin) {

			if ($(container).length > 0) {

				// Set container width
				$(listContainer, container).width(fluidWidth + '%');

				// Create fluid carousel
				if (groupClassName !== '') {

					var i;

					for (i = totalItem - 1; i >= 0; i -= 1) {
						if (i === 0) {
							$(groupClassName + ':eq(' + i + ')', container).css({
								'width': (itemWidth + '%')
							});
						} else {
							$(groupClassName + ':eq(' + i + ')', container).css({
								'marginLeft': (itemMargin + '%'),
								'width': (itemWidth + '%')
							});
						}
					}

				}

				}

			}

			return {
				render: setFluidWidths
			};

		}());

		// Carousel fluid build
		var carousel = (function () {

			function backToDefault(el) {
				$(el).attr('style', '');

				for (i = 0; i < totalItem; i += 1) {
					$('>ul>li.item-group:eq(' + i + ')', el).attr('style', '');
					$('>ul', el).append($('>ul>li.item-group:eq(' + i + ') ul', el).html());
				}

				$('>ul>li.item-group', el).attr('style', '').remove();
				$('>ul', el).attr('style', '');
				$('>ul>li', el).attr('style', '');
			}

			function build(el) {

				var i = 0,
				groupByDefault = 6,
				$ul = $('>ul', el),
				$li = $('>ul>li:not(.item-group)', el),
				$liGroup,
				direction = 0,
				itemCurrent = 0,
				easing = 'easeOutExpo';

				// Group carousel elements
				for (i=0; i < $li.length; i+=groupByDefault) {

					if(i <= (groupByDefault - 1)) {
						// Group first loop to Six (6)
						$li.slice(i,i+groupByDefault).wrapAll('<li class="item-group" />').wrapAll('<ul />' );	
					} else {
						// Group all remaining to Nine (9)
						groupByDefault+=3;
						$li.slice(i,i+groupByDefault).wrapAll('<li class="item-group" />').wrapAll('<ul />' );
					}

					// Retain white space for default spacing of inline-blocks
					$li.after('\n');

					$liGroup = $('>ul>li.item-group', el);

					var containerWidth = 1240;
						totalItem = $liGroup.length;
						marginWidth = 0;
						totalMargin = marginWidth * (totalItem - 1);
						wrapperWidth = (containerWidth * totalItem) + totalMargin;
						fluidWidth = (wrapperWidth / containerWidth) * 100;
						itemWidth = (containerWidth / wrapperWidth) * 100;
						itemMargin = (marginWidth / wrapperWidth) * 100;
						itemPush = fluidWidth / totalItem;

					// Apply fluid width
					fluidity.render(el, '.item-group', '>ul', fluidWidth, totalItem, itemWidth, itemMargin);

				}

				// Carousel controls click event
				$('.carousel-controls a').on('click', function () {

					if ($(this).hasClass('prev')) {
						itemCurrent -= 1;
						(itemCurrent < 0) ? itemCurrent = ($liGroup.length - 1) : itemCurrent;
						// easing = 'easeOutExpo';
					} else if ($(this).hasClass('next')) {
						itemCurrent += 1;
						(itemCurrent > ($liGroup.length - 1)) ? itemCurrent = 0 : itemCurrent;
						// easing = 'easeInExpo';
					}

					var itemPush = (((containerWidth * $liGroup.length) / containerWidth) * 100) / $liGroup.length;

					$ul.stop(true).animate({
						'left': -(itemPush * itemCurrent) + '%'
					}, 600, easing);

					return false;

				});

			}

			return {
				init: build,
				reset: backToDefault
			};

		}());

		// Menu hover
		var blinds = (function () {

			var timer;

			function backToDefault(el) {
				clearInterval(timer);
				$(el).attr('style', '');
				$('ul>li>ul', el).attr('style', '');
				$('ul>li>ul>li', el).attr('style', '');
				$('ul>li', el).unbind('mouseenter mouseleave');
			}

			function dropEffect(el) {

				var items, itemHeight = 15, levelOneItems = $('ul>li', el), levelTwoItems = $('ul>li>ul>li', el);

				// Init menu item height
				levelTwoItems.height(0);

				// Level I - Menu (Click)
				levelOneItems.unbind('click').on('click', function() {
					levelOneItems.removeClass('active');
					$(this).addClass('active');
				});

				// Level I - Menu (Hover)
				levelOneItems.unbind('mouseenter mouseleave').hover(function () {

					items = $('ul>li', this).length;

					$('ul>li', this).each(function (i) {

						var self = $(this), delay = 75 * i;

						timer = setTimeout(function () {
							self.stop(true).animate({
								height: itemHeight
							}, delay, 'easeOutBack').css('visibility', 'visible');
						});

					});

				}, function () {

					$('ul>li', this).each(function (i) {

						var self = $(this), delay = 400;
						
						timer = setTimeout(function () {
							self.stop(true).animate({
								height: 0
							}, delay, 'easeInBack', function () {
								clearTimeout(timer);
							}).css('visibility', 'hidden');
						});

					});

				});

			}

			return {
				drop: dropEffect,
				reset: backToDefault
			};

		}());

		// Search hover
		var search = (function () {

			function backToDefault(el) {
				$(el).unbind('mouseenter mouseleave');
				$(el).attr('style', '');
				$('.search-form').unbind('mouseenter mouseleave');
				$('input[type="text"]', el).attr('style', '');
				$(window).off('resize');
			}

			function displaySearch(el) {

				// Get available space
				var availableWidth = ($('.search').parent().width() - $('.social-links').outerWidth()) - 100;
				var fieldWidth = (availableWidth > 255) ? 255 : availableWidth;

				// Hide input text
				$('input[type="text"]', el).hide();

				// Form hover
				$('.search-form, ' + el).unbind('mouseenter mouseleave').hover(function () {
					$('input[type="text"]', el).show().stop(true).animate({
						width: fieldWidth
					}, 'fast', 'easeOutBack');
					$('.icon-search').removeClass('hidden');
					$('.search-temp').addClass('hidden');
				}, function () {
					$('input[type="text"]', el).blur().stop(true).animate({
						width: 0
					}, 'fast', 'easeInBack', function () {
						$(this).hide();
						$(el).attr('style', '');
					});
					$('.icon-search').addClass('hidden');
					$('.search-temp').removeClass('hidden');
				});

				// Adapt input field width on resize
				$(window).on('resize', function() {
					availableWidth = ($('.search').parent().width() - $('.social-links').outerWidth()) - 100;
					fieldWidth = (availableWidth > 255) ? 255 : availableWidth;
				});

			}

			return {
				stretch: displaySearch,
				reset: backToDefault
			};

		}());

		// Overlay hover
		var overlays = (function () {

			function backToDefault(el) {
				$('ul>li', el).unbind('mouseenter mouseleave');
				$('ul>li .details, ul>li .begin, ul>li .go', el).attr('style', '');
			}

			function overlayPump(el) {

				$('ul>li', el).unbind('mouseenter mouseleave').hover(function() {
					$('.overlay', this).parent().stop(true).animate({
						'bottom': 0 + '%'
					}, 2000, 'easeOutElastic');
				}, function() {
					$('.overlay', this).parent().stop(true).animate({
						'bottom': -(100) + '%'
					}, 100, 'easeOutElastic');
				});

				// Special animation for meme list
				if ($(el).hasClass('meme-list') || $(el).hasClass('memes')) {
					$('ul>li', el).unbind('mouseenter mouseleave').hover(function() {
						$('.overlay', this).stop(true).animate({ opacity: 0.5 });
					}, function() {
						$('.overlay', this).stop(true).animate({ opacity: 0 });
					});
				} 

				// Special case for events carousel
				if ($(el).hasClass('events')) {
					// Reset hover binds
					$('.events ul>li').unbind('mouseenter mouseleave');
					$('.events li.item-group li').unbind('mouseenter mouseleave').hover(function() {
						$('.overlay', this).parent().stop(true).animate({
							'bottom': 0 + '%'
						}, 2000, 'easeOutElastic');
					}, function() {
						$('.overlay', this).parent().stop(true).animate({
							'bottom': -(100) + '%'
						}, 100, 'easeOutElastic');
					});
				}

			}

			return {
				pump: overlayPump,
				reset: backToDefault
			};

		}());

		// Question & Answer
		var qanda = (function () {

			function backToDefault(el) {
				
			}

			function beginQuiz(el) {

				var current = 0,
					totalItem = $('.current>ul>li', el).length,
					currentQuestion = $('.current>ul>li.active', el),
					currentAnswer = $('.current>ul>li .answers a', el),
					storedAnswer = $('.current>ul>li.active input', el),
					progress = $('.progress>span');

				currentAnswer.on('click', function() {

					var answer = $(this).data('answer');

					current+=1;

					if(current < totalItem) {

						// Reset and update progress
						currentAnswer.removeClass('active');
						$(this).addClass('active');
						progress.text('Progress: ' + (current + 1) + ' of ' + totalItem);

						// Store answer
						storedAnswer.val(answer);

						// Answered
						$('.current>ul>li:eq('+current+')', el).attr('style', '').addClass('active');
						$('.current>ul>li:not(:eq('+current+'))').removeClass('active').hide();
						$('html, body').animate({ scrollTop: currentAnswer.offset().top }, '500', 'swing');

					} else {

						// Show complete status!
						$('.current').hide();
						$(el).addClass('completed');

					}

					return false;

				});

				currentAnswer.hover(function() {
					$('.overlay', this).stop(true).animate({ opacity: 0.5 });
				}, function() {
					$('.overlay', this).stop(true).animate({ opacity: 0 });
				});

				// Initially hide other questions
				$('.current>ul>li:not(:eq(0))', el).hide();
				
			}

			return {
				begin: beginQuiz,
				reset: backToDefault
			};

		}());

		// Meme generator
		var generator = (function () {

			function backToDefault() {
				$('.canvas-container').attr('style', '');
				$('.buttons.upload').attr('style', '');
				$('.image-tools').attr('style', '');
				$('.generated-preview').attr('style', '');
				$('#generate').addClass('disabled').attr('disabled', 'disabled');
			}

			function setupGenerator(canvasId) {

				// Init fabric canvas
				canvas = new fabric.Canvas(canvasId);

				var fileInput = document.getElementById('upload'),
					mFileInput = document.getElementById('mupload');

				fileInput.addEventListener('change', imageLoader, false);
				mFileInput.addEventListener('change', mImageLoader, false);

				// Submit image
				$('#meme-generator').on('submit', function() {

					// Final Data: JSON or DataURL?
					var memeJSON = JSON.stringify(canvas),
						dataURL = canvas.toDataURL("image/png");

					var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

					var currentdate = new Date(),
						month = monthNames[currentdate.getMonth()+1],
						date = currentdate.getDate(),
						year = currentdate.getFullYear(),
						hours = currentdate.getHours(),
						minute = currentdate.getMinutes(),
						mid = 'AM',
						timestamp;

					if(hours == 0) {
						hours = 12;
					} else if(hours > 12){
						hours = hours % 12;
						mid = 'PM';
					}

					// Concat timestamp
					timestamp = month + ' ' + date + ', ' + year + ' ' + hours + ':' + minute + ' ' + mid;

					// Show generated details
					$('.generators .generated-preview').css('display', 'table');
					$('.generators .generated-preview .timestamp').text(timestamp);

					// Reset
					$('#new').on('click', function() {
						canvas.clear();
						generator.reset();
						return false;
					});

					// Generator kept on view
					$('html, body').animate({ scrollTop: $('.generators').offset().top }, '500', 'swing');

					return false;
				});

				function imageLoader() {

					var reader = new FileReader();

					// Reset
					canvas.clear();

					reader.onload = function (event) {
						
						var img = new Image();

						// Defaults
						var topColor = '#ffffff',
							topStroke = '#000000',
							bottomColor = '#ffffff',
							bottomStroke = '#000000';

						img.onload = function(){

							// Reset buttons
							$('.buttons.upload').hide();
							$('.image-tools').show();
							$('#generate').removeClass('disabled').removeAttr('disabled');

							// Start drawing!
							fabric.Image.fromURL(img.src, function(img){

								var topText = $('#toptext').val(),
									topSize = $('#topsize').val(),
									bottomText = $('#bottomtext').val(),
									bottomSize = $('#bottomsize').val();

								var top = new fabric.Text(topText, {
									fontFamily: 'Impact',
									fontSize: topSize,
									textAlign: 'center',
									fill: '#ffffff',
									stroke: '#000000',
									strokeWidth: 2,
									lineCap: 'round'
								});

								var bottom = new fabric.Text(bottomText, {
									fontFamily: 'Impact',
									fontSize: bottomSize,
									textAlign: 'center',
									fill: '#ffffff',
									stroke: '#000000',
									strokeWidth: 2,
									lineCap: 'round'
								});

								// Add image to canvas
							    canvas.add(img.set({
									left: 0,
									top: 0,
									scaleY: canvas.height / img.width,
									scaleX: canvas.width / img.width
							    }));

							    // Add text to canvas
							    canvas.add(top, bottom);

							    // Zoom in/out & Drag
								$('.image-tools a').on('click', function(e) {
									
									if (img) {

										if ($(this).hasClass('icon-zin')) {
											img.scaleX += 0.1;
											img.scaleY += 0.1;
										}
										else if ($(this).hasClass('icon-zout')) {
											img.scaleX -= 0.1;
											img.scaleY -= 0.1;
										}
										else if ($(this).hasClass('icon-fit')) {
											img.set({
												left: 0,
												top: 0,
												scaleY: canvas.height / img.width,
												scaleX: canvas.width / img.width
											});
										}
										
										img.setCoords();
										canvas.renderAll();

									}

									return false;

								});

								// Color change
								$('.color-picker a').on('click', function() {

									var color = $(this).data('color');

									if ($(this).hasClass('topcolor')) {
										top.set('fill', color);
										$('#topcolor').val(color);
									}

									if ($(this).hasClass('topstroke')) {
										top.set('stroke', color);
										$('#topstroke').val(color);
									}

									if ($(this).hasClass('bottomcolor')) {
										bottom.set('fill', color);
										$('#bottomcolor').val(color);
									}

									if ($(this).hasClass('bottomstroke')) {
										bottom.set('stroke', color);
										$('#bottomstroke').val(color);
									}

									canvas.renderAll();

									return false;

								});

								// Textarea on keyup
								$('textarea').on("keyup", function(e) {

									if ($(this).attr('id') === 'toptext') {
										
										// Get 'Enter' event
										if((e.keyCode || e.which) == 13) {
											top.set({
												text: $(this).val(),
												left: (canvas.width / 2) - (top.width / 2),
												top: 0
											});	
										}

										top.set({
											text: $(this).val(),
											left: (canvas.width / 2) - (top.width / 2),
											top: 0
										});

									}
									else if ($(this).attr('id') === 'bottomtext') {
										
										// Get 'Enter' event
										if((e.keyCode || e.which) == 13) {
											bottom.set({
												text: $(this).val(),
												left: (canvas.width / 2) - (bottom.width / 2),
												top: canvas.height - bottom.height
											});
										}

										bottom.set({
											text: $(this).val(),
											left: (canvas.width / 2) - (bottom.width / 2),
											top: canvas.height - bottom.height
										});

									}

									canvas.renderAll();

								}).trigger("keyup");

								// Text size range
								$('input[type="range"]').rangeslider('destroy');
								$('input[type="range"]').rangeslider({
									polyfill: false,
									onSlide: function(position, value) {

										if (this.$element[0].id === 'topsize') {
											top.set({
												fontSize: value,
												left: (canvas.width / 2) - (top.width / 2)
											});
										}
										else if (this.$element[0].id === 'bottomsize') {
											bottom.set({
												fontSize: value,
												left: (canvas.width / 2) - (bottom.width / 2),
												top: canvas.height - bottom.height
											});
										}

										canvas.renderAll();

									}
								});

							});

						}
						
						img.src = reader.result;

					}

					reader.readAsDataURL(fileInput.files[0]);

				}

				function mImageLoader() {

					var reader = new FileReader();

					// Reset
					canvas.clear();

					reader.onload = function (event) {
						
						var img = new Image();

						// Defaults
						var topColor = '#ffffff',
							topStroke = '#000000',
							bottomColor = '#ffffff',
							bottomStroke = '#000000';

						img.onload = function(){

							// Reset buttons
							$('.buttons.upload').hide();
							$('.image-tools').hide();
							$('#generate').removeClass('disabled').removeAttr('disabled');

							if($('.mobile-preview').length > 0) {
								$('.mobile-preview').append('<img src="'+img.src+'" />');
								$('.mobile-preview').animate({
									opacity: 1
								});
							}

							// Start drawing!
							fabric.Image.fromURL(img.src, function(img){

								var topText = $('#toptext').val(),
									topSize = $('#topsize').val(),
									bottomText = $('#bottomtext').val(),
									bottomSize = $('#bottomsize').val();

								var top = new fabric.Text(topText, {
									fontFamily: 'Impact',
									fontSize: topSize,
									textAlign: 'center',
									fill: '#ffffff',
									stroke: '#000000',
									strokeWidth: 2,
									lineCap: 'round'
								});

								var bottom = new fabric.Text(bottomText, {
									fontFamily: 'Impact',
									fontSize: bottomSize,
									textAlign: 'center',
									fill: '#ffffff',
									stroke: '#000000',
									strokeWidth: 2,
									lineCap: 'round'
								});

								// Add image to canvas
							    canvas.add(img.set({
									left: 0,
									top: 0,
									scaleY: canvas.height / img.width,
									scaleX: canvas.width / img.width
							    }));

							    // Add text to canvas
							    canvas.add(top, bottom);

							    // Zoom in/out & Drag
								$('.image-tools a').on('click', function(e) {
									
									if (img) {

										if ($(this).hasClass('icon-zin')) {
											img.scaleX += 0.1;
											img.scaleY += 0.1;
										}
										else if ($(this).hasClass('icon-zout')) {
											img.scaleX -= 0.1;
											img.scaleY -= 0.1;
										}
										else if ($(this).hasClass('icon-fit')) {
											img.set({
												left: 0,
												top: 0,
												scaleY: canvas.height / img.width,
												scaleX: canvas.width / img.width
											});
										}
										
										img.setCoords();
										canvas.renderAll();

									}

									return false;

								});

								// Color change
								$('.color-picker a').on('click', function() {

									var color = $(this).data('color');

									if ($(this).hasClass('topcolor')) {
										top.set('fill', color);
										$('#topcolor').val(color);
									}

									if ($(this).hasClass('topstroke')) {
										top.set('stroke', color);
										$('#topstroke').val(color);
									}

									if ($(this).hasClass('bottomcolor')) {
										bottom.set('fill', color);
										$('#bottomcolor').val(color);
									}

									if ($(this).hasClass('bottomstroke')) {
										bottom.set('stroke', color);
										$('#bottomstroke').val(color);
									}

									canvas.renderAll();

									return false;

								});

								// Textarea on keyup
								$('textarea').on("keyup", function(e) {

									if ($(this).attr('id') === 'toptext') {
										
										// Get 'Enter' event
										if((e.keyCode || e.which) == 13) {
											top.set({
												text: $(this).val(),
												left: (canvas.width / 2) - (top.width / 2),
												top: 0
											});	
										}

										top.set({
											text: $(this).val(),
											left: (canvas.width / 2) - (top.width / 2),
											top: 0
										});

									}
									else if ($(this).attr('id') === 'bottomtext') {
										
										// Get 'Enter' event
										if((e.keyCode || e.which) == 13) {
											bottom.set({
												text: $(this).val(),
												left: (canvas.width / 2) - (bottom.width / 2),
												top: canvas.height - bottom.height
											});
										}

										bottom.set({
											text: $(this).val(),
											left: (canvas.width / 2) - (bottom.width / 2),
											top: canvas.height - bottom.height
										});

									}

									canvas.renderAll();

								}).trigger("keyup");

								// Text size range
								$('input[type="range"]').rangeslider('destroy');
								$('input[type="range"]').rangeslider({
									polyfill: false,
									onSlide: function(position, value) {

										if (this.$element[0].id === 'topsize') {
											top.set({
												fontSize: value,
												left: (canvas.width / 2) - (top.width / 2)
											});
										}
										else if (this.$element[0].id === 'bottomsize') {
											bottom.set({
												fontSize: value,
												left: (canvas.width / 2) - (bottom.width / 2),
												top: canvas.height - bottom.height
											});
										}

										canvas.renderAll();

									}
								});

							});

						}
						
						img.src = reader.result;

					}

					reader.readAsDataURL(mFileInput.files[0]);

				}
				
			}

			return {
				setup: setupGenerator,
				reset: backToDefault
			};

		}());

		// Load more
		var get = (function () {
			
			function backToDefault(el) {}

			function loadMore(data_url, el) {

				// Init i
				var i;

				/*
				"id": "0", // default auto iterate
				"layout": "two-column", // one-column
				"large": false, // true = large block
				"reversed": false, // true =  block aligned reversed
				"left": false, // true = default margined item
			    "margin": true, // false = remove margin on item
			    "bottom": false, // true = add margin bottom on item
				"clear": false, // true = block next line
				*/
				
				$.ajax({
					type: 'GET',
					dataType: 'jsonp',
					url: data_url,
					success: function (data) {
						
						if (typeof data.data !== 'undefined' && data.data !== null && data.data.length > 0) {

							// Miss you load more
							// $('.load-more').text('Load More').removeClass('disabled').removeAttr('disabled');

							// Get next_url on every request
							next_url = data.pagination.next_url;

							for (i = 0; i < data.data.length; i += 1) {

								// TFO = True Feed Order
								feed_order+=1;

								var odata = data.data[i],
									id = odata.id,
									type = odata.type,
									layout = odata.layout,
									large = odata.large,
									reversed = odata.reversed,
									clear = odata.clear,
									left = odata.left,
									margin = odata.margin,
									bottom = odata.bottom,
									show_url = (!odata.show) ? '' : odata.show.url,
									show_title = (!odata.show) ? '' : odata.show.title,
									show_logo = (!odata.show) ? '' : odata.show.logo,
									url = odata.url,
									title = odata.title,
									timestamp = odata.timestamp,
									hero = odata.hero,
									thumbnail = odata.thumbnail,
									itemSettings;

								// Store data
								feed[i] = {
									id: id,
									type: type,
									layout: layout,
									large: large,
									reversed: reversed,
									clear: clear,
									left: left,
									margin: margin,
									bottom: bottom,
									show_url: show_url,
									show_title: show_title,
									show_logo: show_logo,
									url: url,
									title: title,
									timestamp: timestamp,
									hero: hero,
									thumbnail: thumbnail
								}

								// Setup item settings
								if(feed[i].layout === 'two-column') {
									itemSettings = 'two-column';

									if(feed[i].large === true) {
										itemSettings += ' large';
									}

									if(feed[i].reversed === true) {
										itemSettings += ' reversed';
									}

									if(feed[i].clear === true) {
										itemSettings += ' clear';
									}

								} else {

									itemSettings = 'one-column';

									if(feed[i].large === true) {
										itemSettings += ' large';
									}

									if(feed[i].reversed === true) {
										itemSettings += ' reversed';
									}

									if(feed[i].clear === true) {
										itemSettings += ' clear';
									}

									if(feed[i].left === false) {
										itemSettings += ' no-left';
									}

									if(feed[i].margin === false) {
										itemSettings += ' no-margin';
									}

									if(feed[i].bottom === true) {
										itemSettings += ' less-bottom';
									}

								}
								
								feedOutput = '<li class="' + itemSettings + ' ' + feed[i].show_title.split(' ').join('-').toLowerCase() + '" data-order="' + (feed_order - 1) + '">';

								if (feed[i].type === 'quiz' || feed[i].type === 'promo' || feed[i].type === 'event') {

									if (feed[i].layout === 'two-column' && feed[i].reversed === true) {

										feedOutput += '<div>';
										feedOutput += '<div class="begin">';
										
										if(feed[i].type === 'promo' || feed[i].type === 'event') {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Join Now!</a>';	
										} else {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Begin Quiz</a>';
										}
										
										feedOutput += '<div class="overlay"></div>';
										feedOutput += '</div>';
										feedOutput += '<img src="' + feed[i].thumbnail + '" alt="' + feed[i].title + '">';
										feedOutput += '</div>';

										feedOutput += '<div>';
										feedOutput += '<a class="show" href="' + feed[i].show_url + '">';
										feedOutput += '<img src="' + feed[i].show_logo + '" alt="' + feed[i].show_title + '">';
										feedOutput += '</a>';
										feedOutput += '<div class="details">';
										feedOutput += '<a class="title" href="' + feed[i].url + '">' + feed[i].title + '</a>';
										feedOutput += '<p class="byline">' + feed[i].timestamp + '</p>';
										feedOutput += '</div>';
										feedOutput += '</div>';

									} else if (feed[i].layout === 'two-column' && feed[i].reversed === false) {

										feedOutput += '<div>';
										feedOutput += '<a class="show" href="' + feed[i].show_url + '">';
										feedOutput += '<img src="' + feed[i].show_logo + '" alt="' + feed[i].show_title + '">';
										feedOutput += '</a>';
										feedOutput += '<div class="details">';
										feedOutput += '<a class="title" href="' + feed[i].url + '">' + feed[i].title + '</a>';
										feedOutput += '<p class="byline">' + feed[i].timestamp + '</p>';
										feedOutput += '</div>';
										feedOutput += '</div>';
										
										feedOutput += '<div>';
										feedOutput += '<div class="begin">';

										if(feed[i].type === 'promo' || feed[i].type === 'event') {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Join Now!</a>';	
										} else {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Begin Quiz</a>';
										}

										feedOutput += '<div class="overlay"></div>';
										feedOutput += '</div>';
										feedOutput += '<img src="' + feed[i].thumbnail + '" alt="' + feed[i].title + '">';
										feedOutput += '</div>';

									} else if (feed[i].layout === 'one-column') {
											
										feedOutput += '<div>';
										feedOutput += '<div class="begin">';
										feedOutput += '<div>';
										feedOutput += '<a class="show" href="' + feed[i].show_url + '">';
										feedOutput += '<img src="' + feed[i].show_logo + '" alt="' + feed[i].show_title + '">';
										feedOutput += '</a>';
										
										if(feed[i].type === 'promo' || feed[i].type === 'event') {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Join Now!</a>';	
										} else {
											feedOutput += '<a class="buttons red" href="' + feed[i].url + '">Begin Quiz</a>';
										}

										feedOutput += '</div>';
										feedOutput += '<div class="overlay"></div>';
										feedOutput += '</div>';
										feedOutput += '<div class="details">';
										feedOutput += '<a class="title" href="' + feed[i].url + '">' + feed[i].title + '</a>';
										feedOutput += '<p class="byline">' + feed[i].timestamp + '</p>';
										feedOutput += '</div>';
										feedOutput += '<img src="' + feed[i].thumbnail + '" alt="' + feed[i].title + '">';
										feedOutput += '</div>';

									}

								} else if (feed[i].type === 'meme') {

									feedOutput += '<div>';
									feedOutput += '<a href="' + feed[i].hero + '" data-src="' + feed[i].hero + '" data-timestamp="' + feed[i].timestamp + '">';
									feedOutput += '<div class="overlay"></div>';
									feedOutput += '<img src="' + feed[i].thumbnail + '" alt="' + feed[i].title + '">';
									feedOutput += '</a>';
									feedOutput += '</div>';

								}
								
								feedOutput += '</li>';

								// Append
								$('ul', el).append(feedOutput);

								// Retain white space for default spacing of inline-blocks
								$('ul>li>div', el).after('\n');
								
								// Show items after image load
								preloadMedia(feed[i].thumbnail, $('ul>li[data-order="' + (feed_order - 1) + '"]', el));

								// Bind hover overlays
								overlays.pump(el);

								if (feed[i].type === 'meme') {

									// Meme list click
									$('.pure-one-column a', el).unbind('click').on('click', function() {
										var data = {
											source: $(this).data('src'),
											timestamp: $(this).data('timestamp')
										};
										lightbox.open('.lightbox', '.lightbox-overlay', data);
										return false;
									});

									$('.lightbox #close, .lightbox-overlay').unbind('click').on('click', function() {
										lightbox.close('.lightbox', '.lightbox-overlay');
										return false;
									});

								}

							}

						} else {

							// if(next_url == 'EOF') {
							// 	Search returns 0
							//	$('.section-gallery').empty().append('<p class="no-records">No users found.</p>'); 
							// }

							// // Hide load-more when you can't take it anymore!
							// $('.load-more').text('Nothing to Load').addClass('disabled').attr('disabled', 'disabled');

						}

						function preloadMedia(url, container) {
							var image = new Image();
							image.src = url;
							image.onload = function() {
								$(container).fadeTo(500, 1);
							};
						}

					},
					complete: function() {}
				});

			}

			return {
				pile: loadMore,
				reset: backToDefault
			};

		}());

		// Meme lightbox
		var lightbox = (function () {

			function backToDefault(container, overlay) {
			}

			function openLightbox(container, overlay, data) {
				
				$(overlay).show().animate({
					opacity: 0.5
				}, function() {
					
					$(container).show();
					$('html, body').css('overflow', 'hidden');
					preload(data.source, container + ' .media');

				});

				function preload(url, wrapper) {

					var image = new Image();
					image.src = url;
					image.onload = function () {
						
						// Append image to lightbox
						
						$('.details>a#download', container).attr('href', data.source);
						$('.timestamp', container).text('Generated Last: ' + data.timestamp);

						$(wrapper).append('<img src="'+image.src+'" />').stop(true).animate({
							opacity: 1
						}, function() {

							// Get lightbox current dimensions
							var lightboxWidth = $(container).outerWidth(),
								lightboxHeight = $(container).outerHeight();

							$(container).css({
								marginLeft: -(lightboxWidth / 2),
								marginTop: -(lightboxHeight / 2),
								visibility: 'visible'
							});

							$('img', container).fadeTo(300, 1);

						});

						// Adapt lightbox position on resize
						// $(window).on('resize', function() {

						// 	// Get lightbox current dimensions
						// 	var lightboxWidth = $(container).outerWidth(),
						// 		lightboxHeight = $(container).outerHeight();

						// 	$(container).css({
						// 		marginLeft: -(lightboxWidth / 2),
						// 		marginTop: -(lightboxHeight / 2)
						// 	});

						// });

					};

				}
			}

			function closeLightbox(container, overlay) {

				$('.media', container).html('');
				$(container).hide();

				$(overlay).animate({
					opacity: 0,
				}, function() {
					
					$(overlay).hide();
					$('html, body').attr('style', '');

				});

			}

			return {
				open: openLightbox,
				close: closeLightbox,
				reset: backToDefault
			};

		}());
	
		// Initialize app functions

		// START APP FUNCTIONS

		// Load content
		if($('.content-lists').length > 0) {

			// TEST JSON URL

			// Quiz
			var data_quiz = 'http://www.json-generator.com/api/json/get/bPwsPyvBQi?indent=2';

			// Promo
			var data_promo = 'http://www.json-generator.com/api/json/get/caAhJCAbyq?indent=2';

			// Event
			var data_event = 'http://www.json-generator.com/api/json/get/cofcRCePjC?indent=2';

			// Meme
			var data_meme = 'http://www.json-generator.com/api/json/get/bNOfGWoJxK?indent=2';

			// Dynamically load content
			if ($('.content-lists.quiz-list').length > 0) {

				get.pile(data_quiz, '.content-lists');

			} else if($('.content-lists.promo-list').length > 0) {

				get.pile(data_promo, '.content-lists');

			} else if ($('.content-lists.event-list').length > 0) {

				get.pile(data_event, '.content-lists');

			} else if ($('.content-lists.meme-list').length > 0) {

				get.pile(data_meme, '.content-lists');

			}

			// Load more
			$('.load-more a').on('click', function() {

				// FOR TEST ONLY
				next_url = data_event;

				get.pile(next_url, '.content-lists');
				return false;
			});

		}

		// Get header height - Init once
		if($('.main').css('paddingTop') != headerHeight + 'px') {
			$('.main').css('paddingTop', headerHeight);	
		}

		// Init carousels
		if($('.carousel').length > 0) {
			carousel.init('.carousel');
		}

		// Bind hover overlays
		if($('.overlay').length > 0) {
			overlays.pump('.promos');
			overlays.pump('.events');
			overlays.pump('.memes');
			overlays.pump('.others');
			overlays.pump('.exclusives');
		}

		// Start main menu drop effect
		if($('.main-menu').length > 0) {
			blinds.drop('.main-menu');
		}

		// Start search stretch effect
		if($('.search').length > 0) {
			search.stretch('.search');
		}

		// Begin Question and Answer
		if($('.lists.quiz').length > 0) {
			qanda.begin('.lists.quiz');
		}

		// Meme list on click
		if($('.memes').length > 0) {
			
			$('.memes ul li a').unbind('click').on('click', function() {
				var data = {
					source: $(this).data('src'),
					timestamp: $(this).data('timestamp')
				};
				lightbox.open('.lightbox', '.lightbox-overlay', data);
				return false;
			});

			$('.lightbox #close, .lightbox-overlay').unbind('click').on('click', function() {
				lightbox.close('.lightbox', '.lightbox-overlay');
				return false;
			});

		}

		// Build meme generator
		if($('.generators').length > 0) {
			generator.setup('canvas');
		}

		// Check if Custom Select is available - Init once
		if(customSelect.length > 0) {
			customSelect.selecter({
				callback: selectCallback
			});

			function selectCallback(value, index) {

				console.log("VALUE: " + value);

				$('.content-lists ul>li').stop(true).animate({
					opacity: 0
				}, function() {
					$('.content-lists ul>li').hide();
					$('.content-lists ul>li.' + value).show().stop(true).animate({
						opacity: 1
					});
				});

			}
		}

		// Range polyfill - Init once
		if($('input[type="range"]').length > 0) {
			$('input[type="range"]').rangeslider({ polyfill: false });
		}

		// Social get followers/likes - Init once
		if (socialHolder.length > 0) {

			// FACEBOOK
			$.ajax({
				type: "GET",
				dataType: "jsonp",
				cache: true,
				url: "https://graph.facebook.com/abscbnNEWS",
				success: function (data) {
					var fb_count = data['likes'];
					$(socialHolder.find('span.count.fb').text(kFormatter(fb_count)));
				}
			});

			// INSTAGRAM
			$.ajax({
				type: "GET",
				dataType: "jsonp",
				cache: true,
				url: "https://api.instagram.com/v1/users/341883537/?access_token=30770142.f59def8.639f9118a68b48a6b1dc966d7a1e91c6",
				success: function (data) {
					var ig_count = data.data.counts.followed_by;
					$(socialHolder.find('span.count.instagram').text(kFormatter(ig_count)));
				}
			});

			// HOVERS
			socialHolder.find('li').mouseenter(function() {
				$(this).find('.slide').stop().animate({
					'left' : 60
				},250);
			}).mouseleave(function() {
				moveleft = $(this).find('.button-holder').width();
				$(this).find('.slide').stop().animate({
					'left' : (moveleft * -1) + 60
				},250);
			}).trigger('hover');

			// SHARE ARTICLE COLLAPSE
			$('.plus-close-button').on('click', function(event) {
				if ($(this).find('img').hasClass('toggled')){
					$(this).find('img').removeClass('toggled');
					$(this).siblings('div').animate({
						'height' : 32
					});
				} else {
					$(this).find('img').addClass('toggled');
					$(this).siblings('div').animate({
						'height' : 165
					});
				}
				return false;
			});

			function kFormatter(num) {
				if (num <= 999){
					return num
				} else if (num <= 999999){
					return (num/1000).toFixed(1) + ' K' 
				} else if (num > 1000000){
					return (num/1000000).toFixed(1) + ' M' 
				}
			}

			function positionButtons() {
				socialHolderList.each(function (){
					var moveleft = $(this).find('.button-holder').width();
					$(this).find('.slide').css({
						'left': -(moveleft) + 60
					});
				});
				socialHolder.css('visibility','visible');
			}

		}

		// Sticky share - Init once
		if ($('.share.sticky').length > 0) {
			
			$('.share.sticky a').on('click', function() {

				var w = 626,
					h = 436,
					left = (screen.width/2)-(w/2),
					top = (screen.height/2)-(h/2),
					href = $(this).attr('href'),
					title = $(this).data('title');

				if($(this).hasClass('icon-email')) {
					// do nothing
					return true;
				} if($(this).hasClass('icon-gplus')) { 
					window.open(href, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width='+600+', height='+450+', top='+top+', left='+left);
				} else {
					window.open(href, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
				}

				return false;

			});

		}

		// END APP FUNCTIONS

		// Init All
		function appInit() {

			// Init carousels
			if($('.carousel').length > 0) {
				carousel.init('.carousel');
			}

			// Bind hover overlays
			if($('.overlay').length > 0) {
				overlays.pump('.promos');
				overlays.pump('.events');
				overlays.pump('.memes');
				overlays.pump('.others');
				overlays.pump('.exclusives');
				overlays.pump('.content-lists');
			}

			// Start main menu drop effect
			if($('.main-menu').length > 0) {
				blinds.drop('.main-menu');
			}

			// Start search stretch effect
			if($('.search').length > 0) {
				search.stretch('.search');
			}

			// Begin Question and Answer
			if($('.lists.quiz').length > 0) {
				qanda.begin('.lists.quiz');
			}

			// Meme list on click
			if($('.meme-list').length > 0) {
				
				$('.pure-one-column a, .memes ul li a').unbind('click').on('click', function() {
					var data = {
						source: $(this).data('src'),
						link: $(this).data('link')
					};
					lightbox.open('.lightbox', '.lightbox-overlay', data);
					return false;
				});

				$('.lightbox #close, .lightbox-overlay').unbind('click').on('click', function() {
					lightbox.close('.lightbox', '.lightbox-overlay');
					return false;
				});

			}

		}

		// Reset All
		function appReset() {

			// Start item overlay on hover
			if($('.overlay').length > 0) {
				overlays.reset('.promos');
				overlays.reset('.events');
				overlays.reset('.memes');
				overlays.reset('.others');
				overlays.reset('.exclusives');
				overlays.reset('.content-lists');
			}

			// Init carousels
			if($('.carousel').length > 0) {
				carousel.reset('.carousel');
			}

			// Start main menu drop effect
			if($('.main-menu').length > 0) {
				blinds.reset('.main-menu');
			}

			// Start search stretch effect
			if($('.search').length > 0) {
				search.reset('.search');
			}

			// Begin Question and Answer
			if($('.lists.quiz').length > 0) {
				qanda.reset('.lists.quiz');
			}

			// Clear canvas
			if($('.generators').length > 0) {

				canvas.clear();

				// File input reset
				$('#upload, #mupload').wrap('<form>').parent('form').trigger('reset');
				$('#upload, #mupload').unwrap();

				$('.mobile-preview').attr('style', '').find('>img').remove();
				$('textarea').val('(Insert Caption)');
				$('#generate').addClass('disabled').attr('disabled', 'disabled');

			}

			// Meme list on click
			if($('.meme-list').length > 0) {
				$('.pure-one-column a, .memes ul li a, .lightbox #close, .lightbox-overlay').unbind('click').on('click', function() {
					return false;
				});
			}

		}

		// WINDOW ON LOAD
		$(window).on('load', function() {

			// SOCIAL PANE INIT
			setTimeout(function() {
				positionButtons();  
			}, 1000);

		});

		// WINDOW ON SCROLL
		$(window).on('scroll', function() {

			if ($(window).scrollTop() > shareStickyTrigger) {
				$('.footer').css('paddingBottom', 37);
				$('.share.sticky').stop(true).animate({
					bottom: 0
				}, 800, 'easeOutElastic');
			} else {
				$('.footer').attr('style', '');
				$('.share.sticky').stop(true).animate({
					bottom: -(37)
				}, 300, 'easeOutElastic');
			}

		});

		// WINDOW ON RESIZE
		$(window).on('resize', function() {

			setTimeout(function() {
        		positionButtons();  
    		}, 1000);

		});
 
		// BREAKPOINTS
		enquire
			.register("only screen and (min-width: 729px) and (max-width: 768px)", {
				match: function () {

					var timer;

					function init() {
						
						// Resets
						appReset();

						// Re-init functions 
						appInit();

						// Remove sticky header
						$('.header').css({
							position: 'relative',
							top: 'auto'
						}).removeClass('fixed');

						$('.main').css('paddingTop', 0);

						// Setup appropriate generator
						if($('.generators').length > 0) {
							$('label[for="upload"]').show();
							$('.image-tools').hide();
							$('label[for="mupload"]').hide();
						}

					}

					timer = setTimeout(init, 10);

				},
				unmatch: function () {

					var timer;

					function init() {

						clearTimeout(timer);

						// Re-init functions
						appInit();

						// Activate sticky header
						$('.header').attr('style', '').addClass('fixed');

						$('.main').attr('style', '');

						// Setup appropriate generator
						if($('.generators').length > 0) {
							$('label[for="upload"]').hide();
							$('.image-tools').hide();
							$('label[for="mupload"]').show();
						}

					}

					timer = setTimeout(init, 10);

				}
			}, true)
			.register("only screen and (min-width: 320px) and (max-width: 728px)", {
				match: function () {

					var timer;

					function init() {

						// Resets
						appReset();
						
						// Toggle variable
						var menuToggled = true,
							searchToggled = true,
							showsToggled = true,
							connectToggled = true;

						// Remove sticky header
						$('.header').css({
							position: 'relative',
							top: 'auto'
						}).removeClass('fixed');

						$('.main').css('paddingTop', 0);

						// Set click events on mobile buttons
						$('.header .middle-row .icon-menu.mobile-icons').unbind('click').on('click', function() {
							menuToggled = toggler(menuToggled, '.main-menu');
							return false;
						});

						$('.header .middle-row .icon-search.mobile-icons').unbind('click').on('click', function() {
							searchToggled = toggler(searchToggled, '.search');
							return false;
						});

						$('.drop-shows').unbind('click').on('click', function() {
							showsToggled = toggler(showsToggled, '#link-shows>ul');

							// Set active menu
							$('#link-shows').parent().find('li').removeClass('active');
							$('#link-shows').toggleClass('active');
							$(this).toggleClass('collapsed');

							return false;
						});

						$('#link-connect>a').unbind('click').on('click', function() {
							connectToggled = toggler(connectToggled, '#link-connect>ul');

							// Set active menu
							$('#link-connect').parent().find('li').removeClass('active');
							$('#link-connect').toggleClass('active');

							return false;
						});

						// Setup appropriate generator
						if($('.generators').length > 0) {
							$('label[for="upload"]').hide();
							$('.image-tools').hide();
							$('label[for="mupload"]').show();

						}

						// Toggler
						function toggler(toggled, togglee) {
							if (toggled) {
								$(togglee).slideDown();
								toggled = false;
							} else {
								$(togglee).slideUp();
								toggled = true;
							}
							return toggled;
						}

					}

					timer = setTimeout(init, 10);
				},
				unmatch: function () {

					var timer;

					function init() {

						clearTimeout(timer);

						// Re-init functions
						appInit();

						// Activate sticky header
						$('.header').attr('style', '').addClass('fixed');

						$('.main').attr('style', '');

						// Setup appropriate generator
						if($('.generators').length > 0) {
							$('label[for="upload"]').show();
							$('.image-tools').hide();
							$('label[for="mupload"]').hide();
						}

						// Reset drop downs
						$('#link-shows, #link-connect').removeClass('active');
						$('#link-shows>ul, #link-connect>ul').attr('style', '');

						// Off Mobile icons
						$('.header .middle-row .icon-menu.mobile-icons, .header .middle-row .icon-search.mobile-icons, #link-connect>a').unbind('click');
						$('.drop-shows').removeClass('collapsed').unbind('click');

					}

					timer = setTimeout(init, 10);

				}

			}, true);

	});

})(jQuery, window, document);

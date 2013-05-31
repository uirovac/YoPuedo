var idApp = "1";
var senderId = "207801521218";
var latitud;
var longitud;
var direccion;
var idMessage;
var pushNotification;
var typeDevice = null;
var idDevice;
var pictureSource; 
var destinationType;
var facingImage = "";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	try { 
		pushNotification = window.plugins.pushNotification;
		typeDevice=(device.platform == "android" || device.platform == "Android")?0:1;
		if (device.platform == 'android' || device.platform == 'Android') {
			pushNotification.register(successHandler, errorHandler, {"senderID":senderId,"ecb":"onNotificationGCM"});
		}
		else {
			pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
		}
	}
	catch(err) { 
		txt="There was an error on this page.\n\n"; 
		txt+="Error description: " + err.message + "\n\n"; 
	}
	pictureSource=navigator.camera.PictureSourceType;
	destinationType=navigator.camera.DestinationType;
	navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onNotificationAPN(e) {
	if (e.alert) {
		navigator.notification.alert(e.alert);
	}
	if (e.sound) {
		var snd = new Media(e.sound);
		snd.play();
	}
	if (e.badge) {
		pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
	}
}

function onNotificationGCM(e) {
	switch( e.event ) {
		case "registered":
				if ( e.regid.length > 0 ) {
					idDevice = e.regid;
					idUsuario = "13176947";
					$.ajax({ 
						type: "POST",
						url: "http://www.anywhere.cl/wsanywhere/services/enrolamiento/update",
						data: {  a1:idUsuario, a2:idDevice, a3:senderId },
						crossDomain : true,
						success: function(data,status,jqXHR) { 
							console.log("transaccion guardada");
							$.getJSON("http://www.anywhere.cl/wsanywhere/services/p2s/querys/listamensajes/" + idDevice + "/" + idApp,{ },getMensajes);
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) { console.log("transaccion incompleta"); }
					});		
				} 
				break;
		case "message":
				if (e.foreground) {
					var my_media = new Media("/android_asset/www/" + e.soundname);
					my_media.play();
					idUsuario = "13176947";
					alert("foreground : " + idDevice);
					$.ajax({ 
						type: "POST",
						url: "http://www.anywhere.cl/wsanywhere/services/notificacion/tracking/save",
						data: {  a1:idDevice, a2:idUsuario, a3:idApp, a4:e.payload.msgcnt, a5:"2" },
						crossDomain : true,
						success: function(data,status,jqXHR) { console.log("transaccion guardada"); },
						error: function(XMLHttpRequest, textStatus, errorThrown) { console.log("transaccion incompleta"); }
					});					
				}
				else 
					alert("coldstart : " + idDevice);
					if(e.coldstart) {
						idUsuario = "13176947";
						$.ajax({ 
							type: "POST",
							url: "http://www.anywhere.cl/wsanywhere/services/notificacion/tracking/save",
							data: {  a1:idDevice, a2:idUsuario, a3:idApp, a4:e.payload.msgcnt, a5:"1" },
							crossDomain : true,
							success: function(data,status,jqXHR) { console.log("transaccion guardada"); },
							error: function(XMLHttpRequest, textStatus, errorThrown) { console.log("transaccion incompleta"); }
						});	
				}
				else { }
				idMessage = e.payload.msgcnt;
				var url = "#mensaje";    
				$(location).attr("href",url);
				$("#txt_mensaje").html(e.payload.message);
				$("#btn_responder").removeClass("ui-disabled");  
				break;
		case "error":
				alert("ERROR -> MSG:" + e.msg);
				break;
		default:
				alert("EVENT -> Unknown, an event was received and we do not know what it is");
		break;
	}
}

function tokenHandler (result) {
	idDevice = result;
	$.getJSON("http://www.anywhere.cl/wsanywhere/services/p2s/querys/listamensajes/" + idDevice + "/" + idApp,{ },getMensajes);
}

function successHandler (result) { }

function errorHandler (error) { }

function onSuccess(position) {
	latitud = position.coords.longitude;
	longitud = position.coords.longitude;
	direccion =	position.coords.heading;
}

function onError(error) {
	alert("Intente realizar nuevamente esta operaci&oacute;n.  Si el problema persiste, busque un sitio con mejor recepci&oacute;n");
}

capturePhotoEdit = function(source) {
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality : 50,
		destinationType : destinationType.DATA_URL,
		sourceType : source
	});
}

onFail = function(message) {
	alert('Failed because: ' + message);
}
		
onPhotoDataSuccess = function(imageData) {
	var capturefacing = document.getElementById("capturefacing");
	capturefacing.style.display = "block";
	capturefacing.src = "data:image/jpeg;base64," + imageData;
	facingImage = imageData;
}

$("#principal").live("pageinit",function() {
	$("#close").click(
		function() {
			navigator.app.exitApp()
		}
	);
});

$("#mensaje").live("pageinit",function() {
	idUsuario = "13176947";
	alert("page message : " + idDevice);
	$.ajax({
		type: "POST",
		url: "http://www.anywhere.cl/wsanywhere/services/notificacion/tracking/save",
		data: {  a1:idDevice, a2:idUsuario, a3:idApp, a4:idMessage, a5:"2" },
		crossDomain : true,
		success: function(data,status,jqXHR) { console.log("transaccion guardada"); },
		error: function(XMLHttpRequest, textStatus, errorThrown) { console.log("transaccion incompleta"); }
	});	
});

$("#enrolar").live("click",
	function() {
		if(facingImage == null) {
			alert("Debe tomar una fotografia del usuario");
			return;
		}
		else {
			if ($("#formulario1").validate({
				errorPlacement: function(error, element) {
					if ($(element).is("select")) {
						error.insertAfter($(element).parent());
					}
					else {
						error.insertAfter(element);
					}
				}
			}).form() == true) {
				if(idDevice!=null && senderId !=null) {
					$.ajax({ 
						type: "POST",
						url: "http://www.anywhere.cl/wsanywhere/services/enrolamiento/save",
						data: {  a1 : $("#txt_rut").val(), a2 : $("#txt_password").val(), a3 : idDevice, a4 : typeDevice, 
								 a5 : senderId, a6 : direccion, a7 : latitud, a8 : longitud, a9 : facingImage
						},
						crossDomain : true,
						beforeSend: function() {
							$.mobile.showPageLoadingMsg();
						},				
						success: function(data,status,jqXHR) {
							 alert("Se ha guardado el registro")
							 limpiaForm("#formulario1");
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) { 
							alert("Ocurri&oacute; un error al guardar el registro")
							limpiaForm("#formulario1");
						},
						complete: function(data) {
							$.mobile.hidePageLoadingMsg();
							$(location).attr("href","#principal");
						}
					});
				}	
			}
		}
});

$("#desenrolar").live("click",
	function() {
		pushNotification.unregister(successHandler, errorHandler);
		$.ajax({ 
			type: "POST",
			url: "http://www.anywhere.cl/wsanywhere/services/enrolamiento/delete",
			data: {  a1:$("#txt_rut").val(), a2:$("txt_password").val(), a3:idDevice },
			crossDomain : true,
			beforeSend: function() {
				$.mobile.showPageLoadingMsg();
			},
			success: function(data,status,jqXHR) {
				alert("Se ha desenrolado el dispositivo")
				limpiaForm("#formulario1");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				alert("Ocurri&oacute; un error al desenrolar el dispositivo")
				limpiaForm("#formulario1");
			},
			complete: function(data) {
				$.mobile.hidePageLoadingMsg();
				$(location).attr("href","login.html");
			}
		});
	});
	
$("#response").live("click", function(e) {
	if ($("#formulario2").validate({
		errorPlacement: function(error, element) {
			if ($(element).is("select")) {
				error.insertAfter($(element).parent());
			}
			else {
				error.insertAfter(element);
			}
		}
	}).form() == true) {
		idUsuario = "13176947";
		$.ajax({ 
			type: "POST",
			url: "http://www.anywhere.cl/wsanywhere/services/notificacion/response/save",
			data: {  a1:idDevice, a2:idUsuario, a3:idMessage, a4:$("#txt_respuesta").val() },
			crossDomain : true,
			beforeSend: function() {
				$.mobile.showPageLoadingMsg();
			},			
			success: function(data,status,jqXHR) {
				alert("Se ha guardado el registro")
				limpiaForm("#formulario2");
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) { 
				alert("Ocurrio un error al guardar el registro")
				limpiaForm("#formulario2");
			},
			complete: function(data) {
				$.mobile.hidePageLoadingMsg();
				$(location).attr("href","#principal");
			}
		});
	}
});

$("#lvw_mensajes li a").live("click", function(e) {
	data = $(this).jqmData("params");
	globalParams = data !== null ? data : null;
	$("#txt_mensaje").val(getUrlVars(globalParams)["mensaje"]);
	$("#btn_responder").addClass("ui-disabled");
});

function getMensajes(data) {
	$.each(data, function(key, val) {
		$.each(val, function(key2, val2) {
			$("#lvw_mensajes").append('<li><a href="#mensaje" data-params="mensaje='+ escape(val2[2].value) +'">'+ 
			val2[2].value + '<span class="ui-li-count">' + val2[0].value + '</span></a></li>');
		});
	});
	$("#lvw_mensajes").listview("refresh");
}

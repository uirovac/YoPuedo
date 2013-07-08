$("#login").live("pageinit", function() {
	$.validator.addMethod("rutValidate", function(value, element) {  
        return this.optional(element) || /^0*(\d{1,3}(\.?\d{3})*)\-?([\dkK])$/i.test(value); 
	}, "Rut invalido: Ingresa un rut válido.");
	
	$("#formLogin").bind("submit", function () {
		if ($("#formLogin").validate({
			rules : {
				rutPer : {
					 required: true,
					 rutValidate : true
				}
			},
			errorPlacement: function(error, element) {
				error.insertAfter(element);
			}
		}).form() == true) {
			$.ajax({ 
				type: "POST",
				dataType:"json",
				url: "http://www.anywhere.cl/tradeagenda/login/access",
				data: $(this).serialize(),
				crossDomain : true,
				success: function(data,status,jqXHR) {
					var tmp = "";
			        if (data.success == "true") {
						$.each(data,function(key,val) {
							if(key != "success") {
								sessionStorage.setItem(key,val);
								tmp = key;
							}
						});
						sessionStorage.setItem("idDevice","APA91bG5k3AUCrN4UgGyJJKXdV2hsz4I_SdGWPDZSRVCqJoSiRcG2VwlfBIz36VOVn1syFA8xwOxKlWILHsZeS6V4zvZx_mWnkaflakGGxUlyGRh6dlFp_rP37NuQ0eW0gRRB7jcgonnrUR3ZgRxk3gZSnwntj2-pA");
						$(location).attr("href","principal.html");
			        }
			        else {
			        	popup("Mensaje", "Usuario o clave invalido","login.html")
			        }
				},
				beforeSend: function() {
					$.mobile.showPageLoadingMsg();
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) { 
					popup("Mensaje", "Aplicación no disponible en estos instantes, vuelta a intentarlo mas tarde","login.html")
				},
				complete: function(data) {
					$.mobile.hidePageLoadingMsg();
				}				
			});
		}
	});
});


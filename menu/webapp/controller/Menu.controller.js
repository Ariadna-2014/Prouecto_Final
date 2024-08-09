sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, sapMLib) {
        "use strict";

        return Controller.extend("esj.menu.controller.Menu", {
            onInit: function () {

            },

            onAfterRendering: function () {

            },
            
            //Funcion para crear el empleado, manda a vistra crear empleado

            navToCreateEmployee: function () {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CreateEmployee",{},false);
            },

            // Funcion para ver empleados, te manda a la vista ShowEmployee

            navToShowEmployee: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ShowEmployee",{},false);
            },

            // Funcion para mostrar la aplicacion de empleados, la constante de la url es cuando subes la aplicacion a dev
            openOrders: function () {
                const url = "https://8c6f9ecdtrial-dev-logali-approuter.cfapps.us10-001.hana.ondemand.com/logaligroupemployees/index.html"
                const {URLHelper} = sapMLib;
                URLHelper.redirect(url);
            }

        });
    });
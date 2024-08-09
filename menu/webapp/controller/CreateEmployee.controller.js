sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, UploadCollectionParameter) {
        "use strict";

        var j = 0;

        return Controller.extend("esj.menu.controller.CreateEmployee", {

            onInit: function () {
                this._splitAppEmployee = this.byId("splitAppEmployee");
            },

            onBeforeRendering: function () {
                this._wizard = this.byId("wizard");
                this._model = new sap.ui.model.json.JSONModel({});
                this.getView().setModel(this._model);
                var oFirstStep = this._wizard.getSteps()[0];
                this._wizard.discardProgress(oFirstStep);
                this._wizard.goToStep(oFirstStep);
                oFirstStep.setValidated(false);

            },

            toStep2: function (oEvent) {

                var dataEmployeeStep = this.byId("dataEmployeeStep");

                var typeEmployeeStep = this.byId("typeEmployeeStep");

                var button = oEvent.getSource();
                var typeEmployee = button.data("typeEmployee");

                var Salary, Type;
                switch (typeEmployee) {
                    case "interno":
                        Salary = 24000;
                        Type = "0";
                        break;
                    case "autonomo":
                        Salary = 400;
                        Type = "1";
                        break;
                    case "gerente":
                        Salary = 70000;
                        Type = "2";
                        break;
                    default:
                        break;
                }

                this._model.setData({
                    _type: typeEmployee,
                    Type: Type,
                    _Salary: Salary
                });

                if (this._wizard.getCurrentStep() === typeEmployeeStep.getId()) {
                    this._wizard.nextStep();
                } else {
                    this._wizard.goToStep(dataEmployeeStep);
                }
            },

            validateDNI: function (oEvent) {
                if (this._model.getProperty("_type") !== "autonomo") {
                    var dni = oEvent.getParameter("value");
                    var number;
                    var letter;
                    var letterList;
                    var regularExp = /^\d{8}[a-zA-Z]$/;
                    if (regularExp.test(dni) === true) {
                        number = dni.substr(0, dni.length - 1);
                        letter = dni.substr(dni.length - 1, 1);
                        number = number % 23;
                        letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                        letterList = letterList.substring(number, number + 1);
                        if (letterList !== letter.toUpperCase()) {
                            this._model.setProperty("/_DniState", "Error");
                        } else {
                            this._model.setProperty("/_DniState", "None");
                            this.dataEmployeeValidation();
                        }
                    } else {
                        this._model.setProperty("/_DniState", "Error");
                    }
                }
            },

            dataEmployeeValidation: function (_oEvent, callback) {
                var object = this._model.getData();
                var isValid = true;

                if (!object.FirstName) {
                    object._FirstNameState = "Error";
                    isValid = false;
                } else {
                    object._FirstNameState = "None";
                }


                if (!object.LastName) {
                    object._LastNameState = "Error";
                    isValid = false;
                } else {
                    object._LastNameState = "None";
                }

                if (!object.CreationDate) {
                    object._CreationDateState = "Error";
                    isValid = false;
                } else {
                    object._CreationDateState = "None";
                }

                if (!object.Dni) {
                    object._DniState = "Error";
                    isValid = false;
                } else {
                    object._DniState = "None";
                }

                if (isValid) {
                    this._wizard.validateStep(this.byId("dataEmployeeStep"));
                } else {
                    this._wizard.invalidateStep(this.byId("dataEmployeeStep"));
                }

                if (callback) {
                    callback(isValid);
                }
            },

            wizardCompletedHandler: function (oEvent) {
                this.dataEmployeeValidation(oEvent, function (isValid) {
                    if (isValid) {

                        var wizardNavContainer = this.byId("wizardNavContainer");
                        wizardNavContainer.to(this.byId("ReviewPage"));
                        var uploadCollection = this.byId("UploadCollection");
                        //var files = uploadCollection.getItems();
                        var files = uploadCollection.getIncompleteItems()
                        //var numFiles = uploadCollection.getItems().length;
                        var numFiles = uploadCollection.getIncompleteItems().length;
                        this._model.setProperty("/_numFiles", numFiles);
                        if (numFiles > 0) {
                            var arrayFiles = [];
                            for (var i in files) {
                                //arrayFiles.push({ DocName: files[i].getFileName(), MimeType: files[i].getMimeType() });
                                arrayFiles.push({ DocName: files[i].mProperties.fileName, MimeType: files[i].mProperties.fileName.mimeType });
                            }
                            this._model.setProperty("/_files", arrayFiles);
                        } else {
                            this._model.setProperty("/_files", []);
                        }
                    } else {
                        this._wizard.goToStep(this.byId("dataEmployeeStep"));
                    }
                }.bind(this));
            },


            _editStep: function (step) {
                var wizardNavContainer = this.byId("wizardNavContainer");
                var wizard = this.byId("wizard");

                var fnAfterNavigate = function () {
                    wizard.goToStep(this.byId(step));
                    wizardNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);

                wizardNavContainer.attachAfterNavigate(fnAfterNavigate);
                wizardNavContainer.back();
            },

            editStepOne: function () {
                this._editStep("typeEmployeeStep");
            },

            editStepTwo: function () {
                this._editStep("dataEmployeeStep");
            },

            editStepThree: function () {
                this._editStep("optionalInfoStep");
            },


            onSaveEmployee: function () {
                var json = this.getView().getModel().getData();
                var body = {};
                for (var i in json) {
                    if (i.indexOf("_") !== 0) {
                        body[i] = json[i];
                    }
                }
                body.SapId = this.getOwnerComponent().SapId;
                body.UserToSalary = [{
                    Amount: parseFloat(json._Salary).toString(),
                    Comments: json.Comments,
                    Waers: "EUR"
                }];

                console.log(body);

                this.getView().setBusy(true);
                this.getView().getModel("odataModel").create("/Users", body, {
                    success: function (data) {
                        this.getView().setBusy(false);
                        this.newUser = data.EmployeeId;
                        sap.m.MessageBox.information(this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this.newUser, {
                            onClose: function () {

                                var wizardNavContainer = this.byId("wizardNavContainer");
                                wizardNavContainer.back();
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("RouteMenu", {}, true);
                            }.bind(this)
                        });
                        this.onStartUpload();
                    }.bind(this),
                    error: function () {
                        this.getView().setBusy(false);
                    }.bind(this)
                });

            },


            onCancel: function () {

                sap.m.MessageBox.confirm(this.oView.getModel("i18n").getResourceBundle().getText("preguntaCancelar"), {
                    onClose: function (oAction) {
                        if (oAction === "OK") {
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteMenu", {}, true);
                        }
                    }.bind(this)
                });

            },



            onChange: function (oEvent) {
                var oUploadCollection = oEvent.getSource();
                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("odataModel").getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
            },


            onBeforeUploadStart1: function (oEvent) {
                let oItem = oEvent.getParameter("item");
                var oAttachmentUpl = this.byId("UploadCollection");
                var aIncompleteItems = oAttachmentUpl.getIncompleteItems();
                let oModel = this.getView().getModel("odataModel"),
                    sSapId = this.getOwnerComponent().SapId;

                //used to turn off busy indicator upon completion of all pending uploads
                if (aIncompleteItems.length !== 0) {
                    oAttachmentUpl.setBusy(true);
                    //used to turn off busy indicator when all uploads complete
                    for (var i = j; i < aIncompleteItems.length; i++) {
                        var sFileName = aIncompleteItems[i].getProperty("fileName");
                        let sSlug = sSapId + ";" + "3" + this.newUser.replace(/^0+/g, "") + ";" + sFileName,
                            sSecurityToken = oModel.getSecurityToken();

                        var oXCSRFToken = new sap.ui.core.Item({
                            key: "X-CSRF-Token",
                            text: sSecurityToken
                        });

                        var oSlug = new sap.ui.core.Item({
                            key: "slug",
                            text: sSlug
                        });

                        oAttachmentUpl.removeAllHeaderFields();
                        oAttachmentUpl.addHeaderField(oXCSRFToken);
                        oAttachmentUpl.addHeaderField(oSlug);
                        j += 1.
                        oAttachmentUpl.uploadItem(aIncompleteItems[i]);

                    }

                }
            },

            onBeforeUploadStart: function (oEvent) {
                let oItem = oEvent.getParameter("item");
                let oModel = this.getView().getModel("odataModel"),
                    sSapId = this.getOwnerComponent().SapId;

                var sFileName = oItem.getFileName();
                let sSlug = sSapId + ";" + "3" + this.newUser.replace(/^0+/g, "") + ";" + sFileName,
                    sSecurityToken = oModel.getSecurityToken();

                var oXCSRFToken = new sap.ui.core.Item({
                    key: "X-CSRF-Token",
                    text: sSecurityToken
                });

                var oSlug = new sap.ui.core.Item({
                    key: "slug",
                    text: sSlug
                });

                //oItem.removeAllHeaderFields();
                oItem.addHeaderField(oXCSRFToken);
                oItem.addHeaderField(oSlug);

            },

            onFileUploadComplete: function (oEvent) {
                
            },

            onStartUpload: function (_ioNum) {
                var that = this;
                var oUploadCollection = that.byId("UploadCollection");
                oUploadCollection.upload();
            }

        });
    });
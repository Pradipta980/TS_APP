// import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";
import BaseObject from "sap/ui/base/Object";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace tsapp.model
 */
export default class Models extends BaseObject{
    private deviceModel:JSONModel;
    private appModel: JSONModel;

    constructor(){
        super();
        this.deviceModel = new JSONModel(Device);
        this.deviceModel.setDefaultBindingMode("OneWay");

        this.appModel = new JSONModel();
    }

    getModels(){
        return {
            deviceModel: this.deviceModel,
            appModel: this.appModel
        };
    }

    
}
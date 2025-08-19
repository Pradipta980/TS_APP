import Controller from "sap/ui/core/mvc/Controller";
import Component from "tsapp/Component";

/**
 * @namespace tsapp.controller
 */
export default class BaseController extends Controller{
    private getAppComponent(){
        return this.getOwnerComponent() as Component;
    }

    getAppRouter(){
        return this.getAppComponent().getRouter();
    }

    getModelHelper(){
        return this.getAppComponent().getModelHelper();
    }
}
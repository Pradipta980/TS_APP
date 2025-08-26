import Controller from "sap/ui/core/mvc/Controller";
import Model from "sap/ui/model/Model";
import Component from "tsapp/Component";

/**
 * @namespace tsapp.controller
 */
export default class BaseController extends Controller{
    protected getAppComponent(){
        return this.getOwnerComponent() as Component;
    }

    protected getGlobalModel(name?: string){
        return this.getAppComponent().getModel(name);
    }

    protected setGlobalModel(model: Model | null | undefined,name?: string){
        return this.getAppComponent().setModel(model, name);
    }

    protected getViewModel(name?: string){
        return this.getView()?.getModel(name);
    }

    protected setViewModel(model: Model | null | undefined,name?: string){
        return this.getView()?.setModel(model, name);
    }    
}
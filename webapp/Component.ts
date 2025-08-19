import BaseComponent from "sap/ui/core/UIComponent";
import Models from "./model/Models";

/**
 * @namespace tsapp
 */
export default class Component extends BaseComponent {

    public static metadata = {
        manifest: "json",
        interfaces: [
            "sap.ui.core.IAsyncContentCreation"
        ]
    };
    private  modelHelper: Models;

    public init(): void {
        // call the base component's init function
        super.init();

        // set the  models        
        const { appModel, deviceModel } = this.getModelHelper().getModels();
        this.setModel(deviceModel, "device");
        this.setModel(appModel, "appModel");

        // enable routing
        this.getRouter().initialize();
    }

    getModelHelper(){
        return this.modelHelper ??= new Models();
    }
}
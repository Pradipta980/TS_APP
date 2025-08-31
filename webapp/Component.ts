import BaseComponent from "sap/ui/core/UIComponent";
import Models from "./model/Models";
import DataManager from "./helper/DataManager";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import RoutingHelper from "./helper/RoutingHelper";

/**
 * @namespace tsapp
 */
export default class Component extends BaseComponent {

    private modelHelper: Models;
    private routingHelper: RoutingHelper;
    private dataManager: DataManager;

    public static metadata = {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]
    };

    public init(): void {
        super.init();

        const { appModel, deviceModel } = this.getModelHelper().getModels();
        this.setModel(deviceModel, "device");
        this.setModel(appModel, "appModel");

        this.getRouter().initialize();
        this.setModel(this.getRoutingHelper().getHelperModel(), "layoutModel");
    }

    public getModelHelper(): Models {
        return this.modelHelper ??= new Models();
    }

    public getRoutingHelper(): RoutingHelper {
        return this.routingHelper ??= RoutingHelper.getInstance(this)
    }

    public getDataManger(): DataManager{
        return this.dataManager ??= new DataManager(this.getModel() as ODataModel);
    }
}
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import { LayoutType } from "sap/f/library";
import BaseObject from "sap/ui/base/Object";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Component from "tsapp/Component";


/**
 * @namespace tsapp.helper
 */
export default class RoutingHelper extends BaseObject {
    private helperModel = new JSONModel();
    private readonly component: Component;
    static instance: RoutingHelper | undefined;

    private constructor(component: Component) {
        if (RoutingHelper.instance) {
            // ensure singleton in JS environment
            throw new Error("Instance exists.Use RoutingHelper.getInstance(). Do not call the constructor directly.");
        }

        super();
        this.component = component;

        //Listen to changes
        this.getFcl().then((fcl) => fcl.attachStateChange(this.updateHelperModel, this));
        this.component.getRouter().attachRouteMatched(this.updateHelperModel, this);
    }

    static getInstance(component: Component): RoutingHelper {
        return RoutingHelper.instance ??= new RoutingHelper(component);
    }

    private async updateHelperModel() {
        const fclHelper = await this.getFclHelper();
        this.helperModel.setData(fclHelper.getCurrentUIState());
    }

    private async getFcl(): Promise<FlexibleColumnLayout> {
        const rootView = await this.component.rootControlLoaded() as View;
        const fclId = this.component.getManifestEntry("/sap.ui5/routing/config/controlId");
        return rootView.byId(fclId) as FlexibleColumnLayout;
    }

    async getFclHelper(): Promise<FlexibleColumnLayoutSemanticHelper> {
        const oSettings = {
            defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
            defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
            initialColumnsCount: 2,
            maxColumnsCount: 2
        };

        return FlexibleColumnLayoutSemanticHelper.getInstanceFor(await this.getFcl(), oSettings);
    }

    getHelperModel(): JSONModel {
        return this.helperModel;
    }

    async destroy(): Promise<void> {
        const fcl = await this.getFcl();
        fcl.detachStateChange(this.updateHelperModel, this);
        this.component.getRouter().detachRouteMatched(this.updateHelperModel, this);
        this.helperModel.destroy();
        RoutingHelper.instance = undefined;
        super.destroy();
    }

    /// Routing functions
    navToCategoryList(replaceHistory?: boolean) {
        this.component.getRouter().navTo("Categories", undefined, undefined, replaceHistory);
    }
    navToCategoryDetails(categoryId: string, replaceHistory?: boolean) {
        this.component.getRouter().navTo("CategoryDetail", { categoryId }, undefined, replaceHistory);
    }

}
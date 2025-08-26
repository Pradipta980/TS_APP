import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";
import FlexibleColumnLayoutSemanticHelper from "sap/f/FlexibleColumnLayoutSemanticHelper";
import { LayoutType } from "sap/f/library";
import Router from "sap/f/routing/Router";
import BaseObject from "sap/ui/base/Object";
import View from "sap/ui/core/mvc/View";
import { Router$BeforeRouteMatchedEvent } from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import Component from "tsapp/Component";


/**
 * @namespace tsapp.helper
 */
export default class RoutingHelper extends BaseObject {
    private helperModel = new JSONModel();
    //state flag
    private hasStarted = false

    constructor(
        private readonly component: Component
    ) {
        super();
    }

    async start() {
        if (this.hasStarted) return;
        this.hasStarted = true;

        const fcl = await this.getFcl();

        //Watch routing change
        this.component.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        // // Trigger event manually the first time, since we don't know when the helper was actually started
        // const hashChanger = this.component.getRouter().getHashChanger();
        // const routeInfo = this.component.getRouter().getRouteInfoByHash(hashChanger.getHash());
        // if (routeInfo) {
        //     this.component.getRouter().fireBeforeRouteMatched(routeInfo);
        // } else {
        //     fcl.setLayout(LayoutType.OneColumn);
        // }

        //Watch FCL state change
        fcl.attachStateChange(this.onFclStateChange, this);
    }

    async stop() {
        this.hasStarted = false;
        this.component.getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        const fcl = await this.getFcl();
        fcl.detachStateChange(this.onFclStateChange, this);
    }

    private async onBeforeRouteMatched(event: Router$BeforeRouteMatchedEvent) {
        const parameters = event.getParameters();
        let layout = this.getLayout(parameters.name, parameters.arguments);
        (await this.getFcl()).setLayout(layout);
    }

    private getLayout(name: any, args: any): LayoutType {
        /**
         * Parameters are kept as `any` since routing config is defined in manifest.json,
         * making compile-time type inference impractical. This method will be revisited
         * later to evaluate safer handling or runtime validation.
         */
        let layout = LayoutType.OneColumn
        //TODO: implemtation soon
        return layout;
    }

    private async onFclStateChange(){
        const fclState = (await this.getFclHelper()).getCurrentUIState();
        this.getHelperModel().setData(fclState);
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

    getHelperModel(){
        return this.helperModel;
    }

    destroy(): void {
        this.stop();
    }

}
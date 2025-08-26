import JSONModel from "sap/ui/model/json/JSONModel";
import MessagingHelper from "tsapp/helper/MessagingHelper";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";

/**
 * @namespace tsapp.controller
 */
export default class Categories extends BaseController {
    private messagingHelper: MessagingHelper;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const router = this.getAppComponent().getRouter();
        router.getRoute("Categories")?.attachPatternMatched(this.handleMatched, this);
    }

    private async handleMatched(event: Route$PatternMatchedEvent) {
       const data = await this.getAppComponent().getDataManger().getCategories();
       (this.getGlobalModel("appModel") as JSONModel).setProperty("/categories", data);
    }

    formatImage(dataString: string): string | undefined{
        return dataString ? `data:image/png;base64,${dataString.substring(104)}` : undefined;
    }
}
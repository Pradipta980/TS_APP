import JSONModel from "sap/ui/model/json/JSONModel";
import MessagingHelper from "tsapp/helper/MessagingHelper";
import BaseController from "./BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import { ListBase$ItemPressEvent } from "sap/m/ListBase";
import SearchField, { SearchField$ChangeEvent } from "sap/m/SearchField";
import Filter from "sap/ui/model/Filter";

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

    private handleMatched(event: Route$PatternMatchedEvent) {
        this.loadCategories();
    }

    formatImage(dataString: string): string | undefined {
        return dataString ? `data:image/png;base64,${dataString.substring(104)}` : undefined;
    }

    onSearchCatagory(event: SearchField$ChangeEvent) {
        const query = event.getParameters().value;
        this.loadCategories(query);
    }

    onPressCategory(event: ListBase$ItemPressEvent) {
        const listItem = event.getParameters().listItem;
        const bindingObject = (listItem?.getBindingContext("appModel")?.getObject()) as any;
        const catId = encodeURIComponent(bindingObject.CategoryID);
        this.getAppComponent().getRoutingHelper().navToCategoryDetails(catId);
    }

    private async loadCategories(query?: string) {
        let filter: Filter | undefined;
        if (query) {
            filter = new Filter({
                filters: [
                    new Filter("CategoryName", "Contains", query),
                    new Filter("Description", "Contains", query)
                ],
                and: false
            });
        }

        const appModel = this.getGlobalModel("appModel") as JSONModel;
        appModel.setProperty("/categoryBusy", true);
        const data = await this.getAppComponent().getDataManger().getCategories(filter ? [filter] : undefined);;
        appModel.setProperty("/categories", data);
        appModel.setProperty("/categoryBusy", false);
    }

}
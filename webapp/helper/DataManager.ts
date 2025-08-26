import BaseObject from "sap/ui/base/Object";
import Filter from "sap/ui/model/Filter";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import promiseOdata from "tsapp/utils/promiseOdata";

/**
 * @namespace tsapp.helper
 */
export default class DataManager extends BaseObject {
    private readonly model: ODataModel;

    constructor(model: ODataModel) {
        super();
        this.model = model;
    }

    async getCategories(filter?: Filter[]) {
        const { promise } = promiseOdata<any>(this.model, "/Categories", { action: "read", options: { filters: filter } });
        return (await promise).results;
    }

}
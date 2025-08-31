import Deferred from "sap/base/util/Deferred";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import assertNever from "./assertNever";

//Types
type RemoveCallbacks<T> = Omit<Exclude<T, undefined>, "success" | "error">;
export type ReadParam = RemoveCallbacks<Parameters<typeof ODataModel.prototype.read>[1]>;
export type RemoveParam = RemoveCallbacks<Parameters<typeof ODataModel.prototype.remove>[1]>;
export type CreateParam = RemoveCallbacks<Parameters<typeof ODataModel.prototype.create>[2]>;
export type UpdateParam = RemoveCallbacks<Parameters<typeof ODataModel.prototype.update>[2]>;
export type ODataParams = ReadParam | RemoveParam | CreateParam | UpdateParam | undefined;
type ODataMethodReturn = { abort: () => void };
type PromiseODataReturn<T> = { promise: Promise<T>, abort: ODataMethodReturn["abort"] };

type ODataParamByAction =
    { action: "read", options?: ReadParam }
    | { action: "remove", options?: RemoveParam }
    | { action: "create", payload: object, options?: CreateParam }
    | { action: "update", payload: object, options?: UpdateParam };


export default function promiseOdata<T>(
    model: ODataModel,
    path: string,
    param: ODataParamByAction
): PromiseODataReturn<T> {
    const { promise, resolve, reject } = new Deferred<T>();
    const addResolvers = (options?: ODataParams) => {
        return { ...options, success: resolve, error: reject };
    };

    let abort = () => { };
    switch (param.action) {
        case "read":
            abort = (model.read(path, addResolvers(param.options)) as ODataMethodReturn).abort;
            break;
        case "remove":
            abort = (model.remove(path, addResolvers(param.options)) as ODataMethodReturn).abort;
            break;
        case "create":
            abort = (model.create(path, param.payload, addResolvers(param.options)) as ODataMethodReturn).abort;
            break;
        case "update":
            abort = (model.update(path, param.payload, addResolvers(param.options)) as ODataMethodReturn).abort;
            break;
        default:
        // Exhaustiveness check
        assertNever(param);
    };

    return { promise, abort };
};
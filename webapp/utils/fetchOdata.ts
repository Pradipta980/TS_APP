import Deferred from "sap/base/util/Deferred";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";

//Types
type ReadParams = Parameters<typeof ODataModel.prototype.read>[1];
type CreateParams = Parameters<typeof ODataModel.prototype.create>[2];
type UpdateParams = Parameters<typeof ODataModel.prototype.update>[2];
type RemoveParams = Parameters<typeof ODataModel.prototype.remove>[1];

type OdataAction = "read" | "remove" | "create" | "update";
type OdataReturn<T> = {
    promise: Promise<T>,
    abort: () => void
};

type ParamsForMethod<M extends OdataAction> =
    M extends "read" ? ReadParams
    : M extends "remove" ? RemoveParams
    : M extends "create" ? CreateParams
    : UpdateParams;


// Overload signatures
export default function fetchOdata<T, M extends "read" | "remove">(
    model: ODataModel,
    action: M,
    path: string,
    params?: ParamsForMethod<M>
): OdataReturn<T>;

export default function fetchOdata<T, M extends "create" | "update">(
    model: ODataModel,
    action: M,
    path:string,
    payload: object,
    params?: ParamsForMethod<M>
): OdataReturn<T>;

//Implementation
export default function fetchOdata<T, M extends OdataAction>(
    model: ODataModel,
    action: M,
    path: string,
    paramsOrPayload?: object,
    params?: object
): OdataReturn<T> {
    const { promise, resolve, reject } = new Deferred<T>();
    const wrapCallbacks = <P extends ReadParams | CreateParams | UpdateParams | RemoveParams>(params: P): P => {
        return {
            ...params,
            success: (data: any, response: string) => {
                params?.success?.(data, response);
                resolve(data);
            },
            error: (error: any) => {
                params?.error?.(error);
                reject(error);
            }
        };
    };

    const methodMap = {
        read: () => model.read(path, wrapCallbacks(paramsOrPayload)),
        remove: () => model.remove(path, wrapCallbacks(paramsOrPayload)),
        create: () => model.create(path, { ...paramsOrPayload }, wrapCallbacks(params)),
        update: () => model.update(path, { ...paramsOrPayload }, wrapCallbacks(params))
    }

    const fnToExecute = methodMap[action];
    const { abort } = fnToExecute() as { abort: () => void };

    return { promise, abort };
}
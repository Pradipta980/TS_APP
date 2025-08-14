import Deferred from "sap/base/util/Deferred";
import MessageBox from "sap/m/MessageBox";

//Types
type MBoxMethod = Exclude<keyof MessageBox, "Action" | "Icon">;
type OptionsForMBoxMethod<M extends MBoxMethod> = 
    M extends "alert" ? Parameters<typeof MessageBox.alert>[1]
    : M extends "confirm" ? Parameters<typeof MessageBox.confirm>[1]
    : M extends "error" ? Parameters<typeof MessageBox.error>[1]
    : M extends "information" ? Parameters<typeof MessageBox.information>[1]
    : M extends "show" ? Parameters<typeof MessageBox.show>[1]
    : M extends "success" ? Parameters<typeof MessageBox.success>[1]
    : Parameters<typeof MessageBox.warning>[1]; // for "warning method"

type Action = typeof MessageBox.Action;
type MBoxActionType = 
          | (Action | keyof  Action)
          | Array<Action | keyof  Action>
          | string
          | string[];


export default function showMessageBox<M extends MBoxMethod>(
    action: M,
    message: string,
    options?: OptionsForMBoxMethod<M>
){
    const {promise, resolve} = new Deferred<MBoxActionType>();
    const wrappedOptions = {
        ...options,
        onClose:(action: MBoxActionType)=>{
            options?.onClose?.(action);
            resolve(action)
        }
    }
    MessageBox[action](message, wrappedOptions);
    return promise
}
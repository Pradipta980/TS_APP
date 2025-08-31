import Deferred from "sap/base/util/Deferred";
import MessageBox from "sap/m/MessageBox";
import assertNever from "./assertNever";

// Types
type StripOnClose<T> = Omit<Exclude<T, undefined>, "onClose">;

export type AlertParam = StripOnClose<Parameters<typeof MessageBox.alert>[1]>;
export type ConfirmParam = StripOnClose<Parameters<typeof MessageBox.confirm>[1]>;
export type ErrorParam = StripOnClose<Parameters<typeof MessageBox.error>[1]>;
export type InformationParam = StripOnClose<Parameters<typeof MessageBox.information>[1]>;
export type ShowParam = StripOnClose<Parameters<typeof MessageBox.show>[1]>;
export type SuccessParam = StripOnClose<Parameters<typeof MessageBox.success>[1]>;
export type WarningParam = StripOnClose<Parameters<typeof MessageBox.warning>[1]>;

type MBParams = AlertParam | ConfirmParam | ErrorParam | InformationParam | ShowParam | SuccessParam | WarningParam;
type MessageBoxActions = (keyof typeof MessageBox.Action) | (string & {}); // loose suggestion

type MBParamsByAction =
  { action: "alert", options?: AlertParam }
  | { action: "confirm", options?: ConfirmParam }
  | { action: "error", options?: ErrorParam }
  | { action: "information", options?: InformationParam }
  | { action: "show", options?: ShowParam }
  | { action: "success", options?: SuccessParam }
  | { action: "warning", options?: WarningParam };

export default function showMessageBox(message: string, params: MBParamsByAction): Promise<MessageBoxActions> {
  const { promise, resolve } = new Deferred<MessageBoxActions>();
  const addResolvers = (options?: MBParams) => {
    return { ...options, onClose: resolve };
  }

  const { action, options } = params;
  switch (action) {
    case "alert":
      MessageBox.alert(message, addResolvers(options));
      break;
    case "confirm":
      MessageBox.confirm(message, addResolvers(options));
      break;
    case "error":
      MessageBox.error(message, addResolvers(options));
      break;
    case "information":
      MessageBox.information(message, addResolvers(options));
      break;
    case "show":
      MessageBox.show(message, addResolvers(options));
      break;
    case "success":
      MessageBox.success(message, addResolvers(options));
      break;
    case "warning":
      MessageBox.warning(message, addResolvers(options));
      break;
    default:
      // Exhaustiveness check
      assertNever(params);
  };

  return promise;
};
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { ButtonType } from "sap/m/library";
import MessageItem from "sap/m/MessageItem";
import MessagePopover, { MessagePopover$ActiveTitlePressEvent } from "sap/m/MessagePopover";
import MessageView from "sap/m/MessageView";
import ManagedObject from "sap/ui/base/ManagedObject"
import BaseObject from "sap/ui/base/Object";
import ElementRegistry from "sap/ui/core/ElementRegistry";
import { URI } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import MessageProcessor from "sap/ui/core/message/MessageProcessor";
import MessageType from "sap/ui/core/message/MessageType";
import Messaging from "sap/ui/core/Messaging";
import Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";
import ListBinding from "sap/ui/model/ListBinding";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import debouncer from "tsapp/utils/debouncer";


type SafeMessaging = Omit<typeof Messaging, "removeAllMessages" | "updateMessages">;

/**
 * @namespace tsapp.helper
 */
export default class MessagingHelper extends BaseObject {
    private custMessageModel: JSONModel;
    private messageHelperModel: JSONModel;
    private messageBinding: ListBinding;
    private resourceModel: ResourceModel;
    private messageDialog: Dialog;
    private messagePopover: MessagePopover;
    readonly messaging = Messaging as SafeMessaging;

    constructor(messageFilter?: Filter | Filter[]) {
        super();
        //Message related
        this.custMessageModel = new JSONModel();
        this.messageHelperModel = new JSONModel();
        this.messageBinding = Messaging.getMessageModel().bindList("/");
        this.messageBinding.attachChange(debouncer(this.handleChange.bind(this), 10));
        this.setMessageFilter(messageFilter);

        //i18n
        this.resourceModel = new ResourceModel({
            bundleName: "tsapp.i18n"
        });
    }

    setMessageFilter(messageFilter?: Filter | Filter[]) {
        this.messageBinding.filter(messageFilter);
    }

    private getAllMessages(): Message[] {
        const currentMessageContexts = this.messageBinding.getAllCurrentContexts();
        return currentMessageContexts.map((context) => context.getObject() as Message);
    }

    getMessages(params: { target?: string, isTargetPrefix?: boolean, type?: MessageType, processor?: MessageProcessor })
        : Message[] {
        const { target, isTargetPrefix, type, processor } = params;
        const filteredMessages = this.getAllMessages().filter((message) => {
            const messageTarget = message.getTargets()[0] ?? "";
            const targetMatched = !target || (isTargetPrefix ? messageTarget.startsWith(target) : messageTarget === target);
            const typeMatched = !type || message.getType() === type;
            const processorMatched = !processor || message.getMessageProcessor() === processor;

            return targetMatched && typeMatched && processorMatched;
        });

        return filteredMessages;
    }

    removeMessages(params: Parameters<typeof this.getMessages>[0]) {
        Messaging.removeMessages(this.getMessages(params));
    }

    removeAllMessages() {
        Messaging.removeMessages(this.getAllMessages());
    }

    private handleChange() {
        const allContexts = this.messageBinding.getAllCurrentContexts();
        const messages: Message[] = [];

        let severity = "None";
        for (const context of allContexts) {
            const message = context.getObject() as Message;
            messages.push(message);

            //Determine heighest severity
            switch (message.getType()) {
                case "Error":
                    severity = "Error";
                    break;
                case "Warning":
                    severity = severity !== "Error" ? "Warning" : severity;
                    break;
                case "Success":
                    severity = severity !== "Error" && severity !== "Warning" ? "Success" : severity;
                    break;
                default:
                    severity = !severity ? "Information" : severity;
                    break;
            }
        }

        const { buttonType, buttonIcon } = this.getButtonDetails(severity as keyof typeof MessageType);
        //set model data
        this.custMessageModel.setData(messages);
        this.messageHelperModel.setData({severity, buttonType, buttonIcon, count: messages.length});
    }

    private getButtonDetails(severity: keyof typeof MessageType) {
        let buttonType: ButtonType;
        let buttonIcon: URI;

        switch (severity) {
            case "Error":
                buttonType = ButtonType.Negative;
                buttonIcon = "sap-icon://error";
                break;
            case "Warning":
                buttonType = ButtonType.Critical;
                buttonIcon = "sap-icon://warning";
                break;
            case "Success":
                buttonType = ButtonType.Success;
                buttonIcon = "sap-icon://sys-enter-2";
                break;
            default:
                buttonType = ButtonType.Neutral;
                buttonIcon = "sap-icon://information";
                break;
        }

        return { buttonType, buttonIcon };
    }

    getMessageDialog(): Dialog {
        if (this.messageDialog) {
            return this.messageDialog;
        }

        const template = new MessageItem({
            title: "{_messageModel>message}",
            subtitle: "{_messageModel>additionalText}",
            description: "{_messageModel>description}",
            longtextUrl: "{_messageModel>descriptionUrl}",
            type: "{_messageModel>type}"
        });

        const messageView = new MessageView({
            items: {
                path: '_messageModel>/',
                template: template,
                templateShareable: false
            }
        });

        this.messageDialog = new Dialog({
            // customHeader: customHeader,
            title: "{_i18n>messageDialogHeader}",
            state: "{_messageHelperModel>/severity}",
            resizable: true,
            contentHeight: "50%",
            contentWidth: "50%",
            verticalScrolling: false,
            content: messageView,
            endButton: new Button({
                text: "{_i18n>close}",
                press: () => {
                    this.messageDialog.close();
                }
            }),
            beforeOpen: () => messageView.navigateBack()
        });

        //Set models
        this.messageDialog
            .setModel(this.custMessageModel, "_messageModel")
            .setModel(this.messageHelperModel, "_messageHelperModel")
            .setModel(this.resourceModel, "_i18n");

        return this.messageDialog;
    }

    getMessagePopover(): MessagePopover {
        if (this.messagePopover) {
            return this.messagePopover;
        }

        const template = new MessageItem({
            title: "{_messageModel>message}",
            subtitle: "{_messageModel>additionalText}",
            description: "{_messageModel>description}",
            longtextUrl: "{_messageModel>descriptionUrl}",
            type: "{_messageModel>type}",
            activeTitle: {
                path: '_messageModel>',
                formatter: (message: Message) => message.getControlId() ? true : false
            }
        });

        this.messagePopover = new MessagePopover({
            items: {
                path: "_messageModel>/",
                template: template,
                templateShareable: false
            },
            activeTitlePress: (event: MessagePopover$ActiveTitlePressEvent) => {
                const item = event.getParameters().item;
                const message = item?.getBindingContext("_messageModel")?.getObject() as Message;
                const element = ElementRegistry.get(message.getControlId());
                element?.focus?.();
            },
        });

        //Set models
        this.messagePopover
            .setModel(this.custMessageModel, "_messageModel")
            .setModel(this.messageHelperModel, "_messageHelperModel")
            .setModel(this.resourceModel, "_i18n");

        return this.messagePopover;
    }

    getMessageHelperModel(){
        return this.messageHelperModel;
    }

}
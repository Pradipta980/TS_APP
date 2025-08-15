import { Button$PressEvent } from "sap/m/Button";
import Message from "sap/ui/core/message/Message";
import MessageType from "sap/ui/core/message/MessageType";
import Controller from "sap/ui/core/mvc/Controller";
import MessagingHelper from "tsapp/helper/MessagingHelper";
import showMessageBox from "tsapp/utils/showMessageBox";

/**
 * @namespace tsapp.controller
 */
export default class View1 extends Controller {
    private messagingHelper: MessagingHelper;

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        this.messagingHelper = new MessagingHelper();
        this.getView()?.setModel(this.messagingHelper.getMessageHelperModel(), "messageHelperModel");
    }

    onPressPopBtn(event: Button$PressEvent) {
        const button = event.getSource();
        this.messagingHelper.getMessagePopover().toggle(button);
    }

    async onPressDiaBtn() {
        const action = await showMessageBox("confirm", "Do you want to open message dialo?");
        action === "OK" && this.messagingHelper.getMessageDialog().open();
        this.messagingHelper.getMessageDialog().attachEventOnce("afterClose", () => {
            showMessageBox("success", "Message dialog closed successfully");
        });
    }

    generateMessages(){
        this.addRandomMessages();
    }




    // Helper to get a random MessageType
    getRandomMessageType(): MessageType {
        const types: MessageType[] = [MessageType.Warning, MessageType.Error, MessageType.Success, MessageType.Information, MessageType.None];
        const randomIndex = Math.floor(Math.random() * types.length);
        return types[randomIndex];
    }

    // Helper to generate random string
    getRandomText(prefix: string, length = 6): string {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        return `${prefix}-${Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
    }

    // Add up to 500 random messages
    addRandomMessages(count = 500) {
        const messageCount = Math.floor(Math.random() * count) + 1; // 1 to 500
        const messages: Message[] = [];

        for (let i = 0; i < messageCount; i++) {
            messages.push(new Message({
                message: this.getRandomText("Message"),
                additionalText: this.getRandomText("Additional"),
                description: this.getRandomText("Description"),
                type: this.getRandomMessageType()
            }));
        }
        this.messagingHelper.removeAllMessages();
        this.messagingHelper.addToMessaging(messages);
    }
}
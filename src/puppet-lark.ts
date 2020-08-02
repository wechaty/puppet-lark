import {
    MessagePayload, MessageType,
    Puppet,
    PuppetOptions,
    ImageType,
    MiniProgramPayload,
    UrlLinkPayload,
    FileBox,
  
} from 'wechaty-puppet'

import * as net from 'net'
let express = require('express')


export type PuppetLarkServer={
    host?:string,
    port?:number,
}
export type PuppetLarkOptions=PuppetOptions &{
    larkServer:PuppetLarkServer,
}

class  PuppetLark extends Puppet{
    private server:net.Server
    constructor(
        public options: PuppetLarkOptions
    ){
        super(options);
        if(options.larkServer){
            let app = express();
            app.post('/',function(req,res){
                let body = req.body
                res.send(body['challenge'])})
            this.server=app.listen(8083,function(){
                console.log("Server is running at http://%s:%s",this.server.address().address,this.server.address().port)
            })
        }
    }
    start(): Promise<void> {
        throw new Error("Method not implemented.")
    }
    stop(): Promise<void> {
        throw new Error("Method not implemented.")
    }
    logout(): Promise<void> {
        throw new Error("Method not implemented.")
    }
    ding(data?: string): void {
        throw new Error("Method not implemented.")
    }
    contactSelfName(name: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    contactSelfQRCode(): Promise<string> {
        throw new Error("Method not implemented.")
    }
    contactSelfSignature(signature: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    tagContactAdd(tagId: string, contactId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    tagContactDelete(tagId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    tagContactList(contactId: string): Promise<string[]>
    tagContactList(): Promise<string[]>
    tagContactList(contactId?: any) {
        throw new Error("Method not implemented.")
    }
    tagContactRemove(tagId: string, contactId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    contactAlias(contactId: string): Promise<string>
    contactAlias(contactId: string, alias: string): Promise<void>
    contactAlias(contactId: any, alias?: any) {
        throw new Error("Method not implemented.")
    }
    contactAvatar(contactId: string): Promise<FileBox>
    contactAvatar(contactId: string, file: FileBox): Promise<void>
    contactAvatar(contactId: any, file?: any) {
        throw new Error("Method not implemented.")
    }
    contactList(): Promise<string[]> {
        throw new Error("Method not implemented.")
    }
    protected contactRawPayload(contactId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected contactRawPayloadParser(rawPayload: any): Promise<import("wechaty-puppet").ContactPayload> {
        throw new Error("Method not implemented.")
    }
    friendshipAccept(friendshipId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    friendshipAdd(contactId: string, hello?: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    friendshipSearchPhone(phone: string): Promise<string> {
        throw new Error("Method not implemented.")
    }
    friendshipSearchWeixin(weixin: string): Promise<string> {
        throw new Error("Method not implemented.")
    }
    protected friendshipRawPayload(friendshipId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected friendshipRawPayloadParser(rawPayload: any): Promise<import("wechaty-puppet").FriendshipPayload> {
        throw new Error("Method not implemented.")
    }
    messageContact(messageId: string): Promise<string> {
        throw new Error("Method not implemented.")
    }
    messageFile(messageId: string): Promise<FileBox> {
        throw new Error("Method not implemented.")
    }
    messageImage(messageId: string, imageType: ImageType): Promise<FileBox> {
        throw new Error("Method not implemented.")
    }
    messageMiniProgram(messageId: string): Promise<MiniProgramPayload> {
        throw new Error("Method not implemented.")
    }
    messageUrl(messageId: string): Promise<UrlLinkPayload> {
        throw new Error("Method not implemented.")
    }
    messageSendContact(conversationId: string, contactId: string): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageSendFile(conversationId: string, file: FileBox): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageSendMiniProgram(conversationId: string, miniProgramPayload: MiniProgramPayload): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageSendText(conversationId: string, text: string, mentionIdList?: string[]): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageSendUrl(conversationId: string, urlLinkPayload: UrlLinkPayload): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageRecall(messageId: string): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    protected messageRawPayload(messageId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected messageRawPayloadParser(rawPayload: any): Promise<MessagePayload> {
        throw new Error("Method not implemented.")
    }
    roomInvitationAccept(roomInvitationId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    protected roomInvitationRawPayload(roomInvitationId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected roomInvitationRawPayloadParser(rawPayload: any): Promise<import("wechaty-puppet").RoomInvitationPayload> {
        throw new Error("Method not implemented.")
    }
    roomAdd(roomId: string, contactId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    roomAvatar(roomId: string): Promise<FileBox> {
        throw new Error("Method not implemented.")
    }
    roomCreate(contactIdList: string[], topic?: string): Promise<string> {
        throw new Error("Method not implemented.")
    }
    roomDel(roomId: string, contactId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    roomList(): Promise<string[]> {
        throw new Error("Method not implemented.")
    }
    roomQRCode(roomId: string): Promise<string> {
        throw new Error("Method not implemented.")
    }
    roomQuit(roomId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    roomTopic(roomId: string): Promise<string>
    roomTopic(roomId: string, topic: string): Promise<void>
    roomTopic(roomId: any, topic?: any) {
        throw new Error("Method not implemented.")
    }
    protected roomRawPayload(roomId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected roomRawPayloadParser(rawPayload: any): Promise<import("wechaty-puppet").RoomPayload> {
        throw new Error("Method not implemented.")
    }
    roomAnnounce(roomId: string): Promise<string>
    roomAnnounce(roomId: string, text: string): Promise<void>
    roomAnnounce(roomId: any, text?: any) {
        throw new Error("Method not implemented.")
    }
    roomMemberList(roomId: string): Promise<string[]> {
        throw new Error("Method not implemented.")
    }
    protected roomMemberRawPayload(roomId: string, contactId: string): Promise<any> {
        throw new Error("Method not implemented.")
    }
    protected roomMemberRawPayloadParser(rawPayload: any): Promise<import("wechaty-puppet").RoomMemberPayload> {
        throw new Error("Method not implemented.")
    }
}

export { PuppetLark }
export default PuppetLark

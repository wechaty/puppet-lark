import {
    MessagePayload, MessageType,
    Puppet,
    PuppetOptions,
    ImageType,
    MiniProgramPayload,
    UrlLinkPayload,
    FileBox,

} from 'wechaty-puppet'

////////////////////
const http = require('http')
const localtunnel = require('localtunnel')
const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data');
////////////////////

export type PuppetLarkServer = {
    port?: number,
}

export type LarkAppConfig = {
    appId: string,
    appSecret: string,
    appVerificationToken: string,
}
export type PuppetLarkOptions = PuppetOptions & {
    larkServer?: PuppetLarkServer,
    larkAppConfig: LarkAppConfig,
}

class PuppetLark extends Puppet {
    app: any
    server: any
    messageStore: any
    imageStore: any

    constructor(
        public options: PuppetLarkOptions = {
            larkAppConfig: {
                appId: "",
                appSecret: "",
                appVerificationToken: ""
            },
        },
    ) {
        super(options)
    }

    async start(): Promise<void> {

        this.app = express()
        this.app.use(bodyParser.json({ limit: '1mb' }));  //body-parser 解析json格式数据
        this.app.use(bodyParser.urlencoded({ extended: true }))  //此项必须在 bodyParser.json 下面,为参数编码

        this.server = http.createServer(this.app)

        this.messageStore = {}
        this.imageStore = {}

        let _port = this.options.larkServer?.port ? this.options.larkServer?.port : 1234

        console.log('正在启动飞书Server...')
        this.server.listen(_port, async () => {
            const listenedPort = (this.server.address() as { port: number }).port
            let lt = await localtunnel({
                host: 'http://localtunnel.chatie.io',
                port: listenedPort,
                subdomain: 'wechaty-puppet-lark',
            })
            console.log("Server is running on ", lt.url, ' now')
            console.log('Please verify it on your lark bot and app.')
        });

        // set puppet login
        this.id = this.options.larkAppConfig.appId
        this.state.on(true)

        this.app.post('/', async (req: any, res: any) => {
            const payload = req.body

            // verify token
            if (payload.token != this.options.larkAppConfig.appVerificationToken) {
                console.info("verification token not match, token =", payload.token)
                return null
            }

            // response according to message type
            if (payload.type == 'url_verification') {
                res.status(200).json({ "challenge": payload.challenge })
                return null
            }

            if (payload.type == 'event_callback') {
                console.log(payload.event)
                this.messageStore[payload.event.open_message_id] = payload.event
                if(payload.event.msg_type=='image'){
                    this.downloadImage(payload.event.image_key)
                }
                this.emit('message', {
                    messageId: payload.event.open_message_id
                })
            }
            else {
                console.info('未知类型访问')
                return null
            }
        })
        return
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
    tagContactList(tagId: string, contactId: string): Promise<string[]>;
    tagContactList(): Promise<string[]>
    tagContactList(contactId?: any): Promise<string[]> | null {
        throw new Error("Method not implemented.")
    }
    tagContactRemove(tagId: string, contactId: string): Promise<void> {
        throw new Error("Method not implemented.")
    }
    contactAlias(contactId: string): Promise<string>
    contactAlias(contactId: string, alias: string): Promise<void>
    contactAlias(contactId: any, alias?: any): Promise<void> | Promise<string> {
        throw new Error("Method not implemented.")
    }
    contactAvatar(contactId: string): Promise<FileBox>
    contactAvatar(contactId: string, file: FileBox): Promise<void>
    contactAvatar(contactId: any, file?: any): Promise<FileBox> | Promise<void> {
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
    async messageSendFile(conversationId: string, file: FileBox): Promise<string | void> {
        let _token = await this.getTenantAccessToken(this.options.larkAppConfig.appId, this.options.larkAppConfig.appSecret)
        let _image_key = await this.uploadImage(_token, file)
        console.log('_image_key',_image_key)
        let response = await axios({
            method: "POST",
            headers:{
                "Authorization": "Bearer "+_token,
                "Content-Type": "application/json"
            },
            url:'https://open.feishu.cn/open-apis/message/v4/send/',
            data: 
                {
                    "open_id": conversationId,
                    "msg_type":"image",
                    "content":{
                        "image_key":_image_key
                    },
                }
        })
        if (response.data.code=='0'){
            console.log('图片发送成功')
        }
        else{
            console.log(response)
            console.log('图片发送失败')
        }
    }
    messageSendMiniProgram(conversationId: string, miniProgramPayload: MiniProgramPayload): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    async messageSendText(conversationId: string, text: string, mentionIdList?: string[]): Promise<string | void> {
        let _token = await this.getTenantAccessToken(this.options.larkAppConfig.appId, this.options.larkAppConfig.appSecret)
        let response = await axios({
            method: "POST",
            headers: {
                "Authorization": "Bearer " + _token,
                "Content-Type": "application/json"
            },
            url: 'https://open.feishu.cn/open-apis/message/v4/send/',
            data:
            {
                "open_id": conversationId,
                "msg_type": "text",
                "content": {
                    "text": text
                },
            }
        })
        if (response.data.code == '0') {
            console.log('消息发送成功')
        }
        else {
            console.log('消息发送失败')
        }
    }
    async messageSendUrl(conversationId: string, urlLinkPayload: UrlLinkPayload): Promise<string | void> {
        throw new Error("Method not implemented.")
    }
    messageRecall(messageId: string): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    public async messageRawPayload(messageId: string): Promise<any> {
        return this.messageStore[messageId]
    }
    public async messageRawPayloadParser(rawPayload: any): Promise<MessagePayload> {
        // Lark message Payload -> Puppet message payload
        let _types: { [key: string]: MessageType } = {
            'image': MessageType.Image,
            'file': MessageType.Attachment,
            'text': MessageType.Text
        }
        const payload: MessagePayload = {
            id: rawPayload.open_message_id,
            text: rawPayload.text,
            timestamp: Date.now(),
            fromId: rawPayload.user_open_id,
            toId: rawPayload.user_open_id, // TODO
            type: _types[rawPayload.msg_type]
        }
        return payload
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
    roomTopic(roomId: any, topic?: any): Promise<string> | Promise<void> {
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
    roomAnnounce(roomId: any, text?: any): Promise<string> | Promise<void> {
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

    private async getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
        let response = await axios({
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            url: 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/',
            data:
            {
                "app_id": appId,
                "app_secret": appSecret
            }
        })
        let tenantAccessToken = response.data.tenant_access_token
        return tenantAccessToken
    }

    private async uploadImage(_token: string, image: FileBox): Promise<string> {
        const _image = await image.toStream()
        let formData = new FormData()
        formData.append('image',_image)
        formData.append("image_type","message")
        let boundary = await formData.getBoundary()
        let response = await axios({
            method: "POST",
            headers: {
                "Authorization": "Bearer " + _token,
                "Content-Type": "multipart/form-data;boundary="+boundary
            },
            url: 'https://open.feishu.cn/open-apis/image/v4/put/',
            data: formData            
        })
        if (response.data.code == 0) {
            return response.data.data.image_key
        }
        else {
            console.log(response.data)
            throw new Error("图片上传失败.")
        }
    }

    private async downloadImage(image_key: FileBox):Promise<FileBox>{
        let _token = await this.getTenantAccessToken(this.options.larkAppConfig.appId, this.options.larkAppConfig.appSecret)
        let response = await axios({
            method: "GET",
            headers: {
                "Authorization": "Bearer " + _token,
            },
            url: 'https://open.feishu.cn/open-apis/image/v4/get/',
            data:
            {
                "image_key": image_key
            },
            responseType:'arraybuffer'
        })
        let file = FileBox.fromBuffer(response.data,'image.png')
        return file
    }
}

export { PuppetLark }
export default PuppetLark

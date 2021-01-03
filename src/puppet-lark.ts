import { UrlLink } from 'wechaty'
import {
  MessagePayload, MessageType,
  Puppet,
  PuppetOptions,
  ImageType,
  MiniProgramPayload,
  UrlLinkPayload,
  FileBox,
  EventDongPayload,
} from 'wechaty-puppet'

/// /////////////////
const http = require('http')
const localtunnel = require('localtunnel')
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
/// /////////////////

export type PuppetLarkServer = {
    port?: number,
}

export type PuppetLarkOptions = PuppetOptions & {
    larkServer?: PuppetLarkServer
}

class PuppetLark extends Puppet {

    app: any
    server: any
    messageStore: any
    imageStore: any
    roomJoinStore: any
    localTunnel: any

    contacts: any
    departments: any

    appId: string = process.env.WECHATY_PUPPET_LARK_APPID !
    appSecret: string = process.env.WECHATY_PUPPET_LARK_APPSECRET!
    appVerificationToken: string = process.env.WECHATY_PUPPET_LARK_TOKEN!

    constructor (
        public options: PuppetLarkOptions = {},
    ) {
      super(options)
    }

    async start (): Promise<void> {
      this.app = express()
      this.app.use(bodyParser.json({ limit: '1mb' }))
      this.app.use(bodyParser.urlencoded({ extended: true }))
      this.server = http.createServer(this.app)
      this.messageStore = {}
      this.roomJoinStore = {}
      this.imageStore = {}

      const _port = this.options.larkServer?.port ? this.options.larkServer?.port : 1234

      if (this.appId === null || this.appSecret === null || this.appVerificationToken === null) {
        console.info('ERROR: Please add environment variable.')
        throw new Error('Environment variable not found.')
      }

      this.server.listen(_port, async () => {
        const listenedPort = (this.server.address() as { port: number }).port
        this.localTunnel = await localtunnel({
          host: 'http://localtunnel.chatie.io',
          port: listenedPort,
          subdomain: 'wechaty-puppet-lark',
        })
        console.info('Server is running on ', this.localTunnel.url, ' now')
        console.info('Please verify it on your lark bot and app.')
      })

      this.id = this.appId
      this.state.on(true)

      this.app.post('/', async (req: any, res: any) => {
        const payload = req.body
        // verify token
        if (payload.token !== this.appVerificationToken) {
          console.info('verification token not match, token =', payload)
          return null
        }
        // response according to message type
        if (payload.type === 'url_verification') {
          res.status(200).json({ challenge: payload.challenge })
          return null
        }
        if (payload.type === 'event_callback') {
          if (payload.event.type === 'message') {
            this.messageStore[payload.event.open_message_id] = payload.event
            this.emit('message', {
              messageId: payload.event.open_message_id,
            })
          }
        } else {
          console.info('Type undefined: ' + payload)
          return null
        }
      })

    }

    async stop (): Promise<void> {
      this.localTunnel.close()
      console.info('Bot is stopped now.')
    }

    async logout (): Promise<void> {
      console.info('WARNNING: There is no need to use this method \'logout\' in a lark bot.')
    }

    ding (data?: string): void {
      const eventDongPayload: EventDongPayload = {
        data: data ? data! : 'ding-dong',
      }
      this.emit('dong', eventDongPayload)
    }

    async contactSelfName (name: string): Promise<void> {
      console.info('ERROR: The name of lark bot can not be modified.')
    }

    async contactSelfQRCode (): Promise<string> {
      console.info('A lark bot don\'t have the QR code. So we will show you the bot\'s id.')
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/bot/v3/info/',
      })
      if (response.data.code === 0) {
        return response.data.bot.open_id
      } else {
        console.info(response.data)
        return ''
      }
    }

    async contactSelfSignature (signature: string): Promise<void> {
      console.info('ERROR: The signature of lark bot can not be modified.')
    }

    // Tag is use as department in lark bot
    async tagContactAdd (tagId: string, contactId: string): Promise<void> {
      let _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      let response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/user/batch_get',
        data: {
          employee_ids: [contactId],
        },
      })

      const deps = response.data.data.user_infos.departments
      deps.push(tagId)
      _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/user/update',
        data:
            {
              open_id: contactId,
              department_ids: deps,
            },
      })
      if (response.data.code === '0') {
        console.info('Successfully modify department.')
      } else {
        console.info('Failed to modify department:' + response.data.msg)
      }
    }

    async tagContactDelete (tagId: string): Promise<void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/user/update',
        data:
            {
              id: tagId,
            },
      })
      if (response.data.code === '0') {
        console.info('Successfully delete department.')
      } else {
        console.info('Failed to delete department:' + response.data.msg)
      }
    }

    tagContactList(tagId: string, contactId: string): Promise<string[]>;
    tagContactList(): Promise<string[]>
    tagContactList (contactId?: any): Promise<string[]> | null {
      throw new Error('Method not implemented.')
    }

    async tagContactRemove (tagId: string, contactId: string): Promise<void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/user/update',
        data:
            {
              open_id: contactId,
              department_ids: [],
            },
      })
      if (response.data.code === '0') {
        console.info('Successfully modify department.')
      } else {
        console.info('Failed to modify department:' + response.data.msg)
      }
    }

    contactAlias(contactId: string): Promise<string>
    contactAlias(contactId: string, alias: string): Promise<void>
    async contactAlias (contactId: any, alias?: any): Promise<string | void> {
      console.info('ERROR: There is no alias in lark.')
    }

    contactAvatar(contactId: string): Promise<FileBox>
    contactAvatar(contactId: string, file: FileBox): Promise<void>
    async contactAvatar (contactId: any, file?: any): Promise<FileBox | void> {
      console.info('ERROR: The avatar of lark contact can not be modified.')
    }

    async contactList (): Promise<string[]> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/scope/get',
      })
      let authedEmployee: string[] = []
      if (response.data.code === 0) {
        const authedEmployeeIdList = response.data.data.authed_employee_ids
        authedEmployee = await this.getEmployeeList(authedEmployeeIdList)
        return authedEmployee
      } else {
        console.info(response)
        return authedEmployee
      }
    }

    protected contactRawPayload (contactId: string): Promise<any> {
      throw new Error('Method not implemented.')
    }

    protected contactRawPayloadParser (rawPayload: any): Promise<import('wechaty-puppet').ContactPayload> {
      throw new Error('Method not implemented.')
    }

    async friendshipAccept (friendshipId: string): Promise<void> {
      console.info('ERROR: There is no need to use this method \'friendshipAccept\' in lark.')
    }

    async friendshipAdd (contactId: string, hello?: string): Promise<void> {
      console.info('ERROR: There is no need to use this method \'friendshipAdd\' in lark.')
    }

    async friendshipSearchPhone (phone: string): Promise<string> {
      console.info('ERROR: This method \'friendshipSearchPhone\' is not avilable now.')
      return ''
      // let _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      // let response = await axios({
      //     method: "GET",
      //     headers: {
      //         "Authorization": "Bearer " + _token,
      //     },
      //     url: 'https://open.feishu.cn/open-apis/user/v1/batch_get_id',
      //     data: {
      //         "mobiles": phone
      //     }
      // })
      // console.info(response.data)
      // if (response.data.code === 0) {
      //     return response.data.data.mobile_users[phone]
      // }
      // else {
      //     console.info('ERROR:Failed to search phone:' + response.data.msg)
      //     return ''
      // }
    }

    async friendshipSearchWeixin (weixin: string): Promise<string> {
      console.info('ERROR: Method \'friendshipSearchWeixin\' is not available in lark.')
      return ''
    }

    protected friendshipRawPayload (friendshipId: string): Promise<any> {
      throw new Error('Method not implemented.')
    }

    protected friendshipRawPayloadParser (rawPayload: any): Promise<import('wechaty-puppet').FriendshipPayload> {
      throw new Error('Method not implemented.')
    }

    async messageContact (messageId: string): Promise<string> {
      throw new Error('Method not implemented.')
    }

    async messageFile (messageId: string): Promise<FileBox> {
      const fileKey = this.messageStore[messageId].file_key
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/open-file/v1/get/',
        data:
            {
              file_key: fileKey,
            },
        responseType: 'arraybuffer',
      })
      const file = FileBox.fromBuffer(response.data, '')
      return file
    }

    async messageImage (messageId: string, imageType: ImageType): Promise<FileBox> {
      const imageKey = this.messageStore[messageId].image_key
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/image/v4/get/',
        data:
            {
              image_key: imageKey,
            },
        responseType: 'arraybuffer',
      })
      const file = FileBox.fromBuffer(response.data, 'image.png')
      return file
    }

    messageMiniProgram (messageId: string): Promise<MiniProgramPayload> {
      throw new Error('Method not implemented.')
    }

    messageUrl (messageId: string): Promise<UrlLinkPayload> {
      throw new Error('Method not implemented.')
    }

    async messageSendContact (conversationId: string, contactId: string): Promise<string | void> {
      console.info('ERROR: You can not send contact with bot in lark yet.')
    }

    async messageSendFile (conversationId: string, file: FileBox): Promise<string | void> {
      const _mimeType = file.mimeType ? file.mimeType : ''
      if (/image/i.test(_mimeType)) {
        const token = await this.getTenantAccessToken(this.appId, this.appSecret)
        const imageKey = await this.uploadImage(token, file)
        const response = await axios({
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          url: 'https://open.feishu.cn/open-apis/message/v4/send/',
          data:
                {
                  chat_id: conversationId,
                  msg_type: 'image',
                  content: {
                    image_key: imageKey,
                  },
                },
        })
        if (response.data.code === '0') {
          console.info('Successfully send image.')
        } else {
          console.info('ERROR: Failed to send image:' + response.data.msg)
        }
      }
    }

    async messageSendMiniProgram (conversationId: string, miniProgramPayload: MiniProgramPayload): Promise<string | void> {
      console.info('ERROR: There is no mini program in lark.')
    }

    async messageSendText (conversationId: string, text: string, mentionIdList?: string[]): Promise<string | void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/message/v4/send/',
        data:
            {
              chat_id: conversationId,
              msg_type: 'text',
              content: {
                text: text,
              },
            },
      })
    }

    async messageSendUrl (conversationId: string, urlLinkPayload: UrlLinkPayload): Promise<string | void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/message/v4/send/',
        data:
            {
              chat_id: conversationId,
              msg_type: 'text',
              content: {
                text: urlLinkPayload.url,
              },
            },
      })
    }

    messageRecall (messageId: string): Promise<boolean> {
      throw new Error('Method not implemented.')
    }

    public async messageRawPayload (messageId: string): Promise<any> {
      return this.messageStore[messageId]
    }

    public async messageRawPayloadParser (rawPayload: any): Promise<MessagePayload> {
      // Lark message Payload -> Puppet message payload
      const _types: { [key: string]: MessageType } = {
        image: MessageType.Image,
        file: MessageType.Attachment,
        text: MessageType.Text,
      }
      const payload: MessagePayload = {
        id: rawPayload.open_chat_id,
        text: rawPayload.text,
        timestamp: Date.now(),
        fromId: rawPayload.user_open_id,
        toId: rawPayload.user_open_id, // TODO
        type: _types[rawPayload.msg_type],
      }
      return payload
    }

    async roomInvitationAccept (roomInvitationId: string): Promise<void> {
      console.info('WARNNING: This methods \'roomInvitationAccept\' is used to invite bot into room in lark.')
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/create/',
        data:
            {
              chat_id: roomInvitationId,
            },
      })
    }

    protected roomInvitationRawPayload (roomInvitationId: string): Promise<any> {
      throw new Error('Method not implemented.')
    }

    protected roomInvitationRawPayloadParser (rawPayload: any): Promise<import('wechaty-puppet').RoomInvitationPayload> {
      throw new Error('Method not implemented.')
    }

    async roomAdd (roomId: string, contactId: string): Promise<void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/create/',
        data:
            {
              chat_id: roomId,
              open_ids: [contactId],
            },
      })
    }

    async roomAvatar (roomId: string): Promise<FileBox> {
      console.info('You can not get room avatar with lark bot yet.')
      return FileBox.fromUrl('')
    }

    async roomCreate (contactIdList: string[], topic?: string): Promise<string> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/create/',
        data:
            {
              name: topic,
              open_ids: contactIdList,
            },
      })
      if (response.data.code === 0) {
        console.info('Successfully create room!')
      } else {
        console.info(response.data)
      }
      return response.data.chat_id

    }

    async roomDel (roomId: string, contactId: string): Promise<void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/chatter/delete/',
        data:
            {
              chat_id: roomId,
              open_ids: [contactId],
            },
      })
      if (response.data.code === 0) {
        console.info('Successfully remove user!')
      } else {
        console.info(response.data)
      }
    }

    async roomList (): Promise<string[]> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      let response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/list',
      })
      let hasmore = response.data.data.has_more
      const results: string[] = response.data.data.groups
      if (hasmore) {
        while (hasmore) {
          response = await axios({
            method: 'GET',
            headers: {
              Authorization: 'Bearer ' + _token,
            },
            url: 'https://open.feishu.cn/open-apis/chat/v4/list',
            data: {
              page_token: response.data.data.page_token,
            },
          })
          results.concat(response.data.groups)
          hasmore = response.data.data.has_more
        }
      }
      if (response.data.code === 0) {
        console.info('Successfully get room list!')
      } else {
        console.info(response.data)
      }
      return results
    }

    async roomQRCode (roomId: string): Promise<string> {
      console.info('ERROR: You can not get QR code in lark.')
      return ''
    }

    async roomQuit (roomId: string): Promise<void> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/bot/v4/remove',
        data:
            {
              chat_id: roomId,
            },
      })
      if (response.data.code === 0) {
        console.info('Successfully quit room')
      } else {
        console.info(response.data.msg)
      }
    }

    async roomTopic(roomId: string): Promise<string>;
    async roomTopic(roomId: string, topic: string): Promise<void>;
    async roomTopic (roomId: any, topic?: any): Promise<any> {
      if (topic != null) {
        const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
        const response = await axios({
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + _token,
            'Content-Type': 'application/json',
          },
          url: 'https://open.feishu.cn/open-apis/chat/v4/update/',
          data: {
            chat_id: roomId,
            name: topic,
          },
        })
        console.info(response.data)
      } else {
        const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
        const response = await axios({
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + _token,
          },
          url: 'https://open.feishu.cn/open-apis/chat/v4/info',
          data: {
            chat_id: roomId,
          },
        })
        return response.data.data.i18n_names
      }

    }

    protected roomRawPayload (roomId: string): Promise<any> {
      throw new Error('Method not implemented.')
    }

    protected roomRawPayloadParser (rawPayload: any): Promise<import('wechaty-puppet').RoomPayload> {
      throw new Error('Method not implemented.')
    }

    roomAnnounce(roomId: string): Promise<string>
    roomAnnounce(roomId: string, text: string): Promise<void>
    async roomAnnounce (roomId: any, text?: any): Promise<string | void> {
      console.info('ERROR: You can not send room announce in lark.')
    }

    async roomMemberList (roomId: string): Promise<string[]> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/chat/v4/info',
        data: {
          chat_id: roomId,
        },
      })
      return response.data.data.members
    }

    protected roomMemberRawPayload (roomId: string, contactId: string): Promise<any> {
      throw new Error('Method not implemented.')
    }

    protected roomMemberRawPayloadParser (rawPayload: any): Promise<import('wechaty-puppet').RoomMemberPayload> {
      throw new Error('Method not implemented.')
    }

    private async getTenantAccessToken (appId: string, appSecret: string): Promise<string> {
      const response = await axios({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        url: 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/',
        data:
            {
              app_id: appId,
              app_secret: appSecret,
            },
      })
      const tenantAccessToken = response.data.tenant_access_token
      return tenantAccessToken
    }

    private async uploadImage (_token: string, image: FileBox): Promise<string> {
      const _image = await image.toStream()
      const formData = new FormData()
      formData.append('image', _image)
      formData.append('image_type', 'message')
      const boundary = await formData.getBoundary()
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
          'Content-Type': 'multipart/form-data;boundary=' + boundary,
        },
        url: 'https://open.feishu.cn/open-apis/image/v4/put/',
        data: formData,
      })
      if (response.data.code === 0) {
        return response.data.data.image_key
      } else {
        console.info(response.data)
        return ''
      }
    }

    private async getEmployeeList (employeeIds: string[]): Promise<string[]> {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/user/batch_get',
        data: {
          employee_ids: employeeIds,
        },
      })
      let employeeList: string[] = []
      if (response.data.code === 0) {
        employeeList = response.data.data.user_infos
        return employeeList
      } else {
        return employeeList
      }
    }

    private async getDepartmentList (departmentIdList: string[]): Promise<string[]> {
      const results = []
      let _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      for (let i = 0; i < departmentIdList.length; i++) {
        const response = await axios({
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + _token,
          },
          url: 'https://open.feishu.cn/open-apis/contact/v1/department/info/',
          data: {
            open_department_id: departmentIdList,
          },
        })
        if (response.data.code === 0) {
          results.push(response.data.data.department_info)
        } else {
          _token = await this.getTenantAccessToken(this.appId, this.appSecret)
        }
      }
      return results
    }

    private async infomationInit () {
      const _token = await this.getTenantAccessToken(this.appId, this.appSecret)
      const response = await axios({
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + _token,
        },
        url: 'https://open.feishu.cn/open-apis/contact/v1/scope/get',
      })
      if (response.data.code === 0) {
        const authedEmployeeIdList = response.data.data.authed_open_ids
        this.contacts = await this.getEmployeeList(authedEmployeeIdList)
        const authedOpenDepartmentList = response.data.data.authed_open_departments
        this.departments = await this.getDepartmentList(authedOpenDepartmentList)
      }
    }

}

export { PuppetLark }
export default PuppetLark

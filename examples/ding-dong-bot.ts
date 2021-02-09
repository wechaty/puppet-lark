import {
  EventMessagePayload,
  MessageType,
  FileBox,
}                           from 'wechaty-puppet'

import { PuppetLark } from '../src/puppet-lark'

const puppet = new PuppetLark({
  larkServer: {
    port: 1234,
  },
})

puppet.start().catch(async e => {
  console.error('Bot start() fail:', e)
  // await puppet.stop()
  process.exit(-1)
})

puppet.on('message', onMessage)

async function onMessage (payload: EventMessagePayload) {
  const msgPayload = await puppet.messagePayload(payload.messageId)
  // console.info(msgPayload)
  if (msgPayload.type === MessageType.Image) {
    const image = await puppet.messageImage(msgPayload.id)
    await image.toFile('download.png', true)
    const myfile = FileBox.fromFile('download.png')
    await puppet.messageSendFile(msgPayload.fromId!, myfile).catch(console.error)
  } else if (msgPayload.type === MessageType.Attachment) {
    const file = await puppet.messageFile(msgPayload.id)
    await file.toFile('download.pdf', true)
    console.info('Download finished!')
  } else if (/ding/i.test(msgPayload.text || '')) {
    await puppet.messageSendText(msgPayload.id!, 'dong')
  } else if (/获取企业所有成员/i.test(msgPayload.text || '')) {
    const _contactList = await puppet.contactList().catch(console.error)
    if (_contactList != null) {
      for (const i in _contactList) {
        const obj = await eval(_contactList[i])
        console.info(obj.open_id) // email, mobile, open_id,
        await puppet.messageSendText(msgPayload.id!, obj.open_id + ':' + obj.name)
      }
    }
  } else if (/创建新的群/i.test(msgPayload.text || '')) {
    const _contactList = await puppet.contactList().catch(console.error)
    if (_contactList != null) {
      const ids = []
      for (const i in _contactList) {
        const obj = await eval(_contactList[i])
        console.info(obj.name) // email, mobile, open_id,
        ids.push(obj.open_id)
      }
      await puppet.roomCreate(ids, 'testRoom')
      console.info('Create room successfully!')
    }
  } else if (/获取群列表/i.test(msgPayload.text || '')) {
    const roomList = await puppet.roomList().catch(console.error)
    if (roomList != null) {
      for (const i in roomList) {
        const obj = await eval(roomList[i])
        // console.info(obj.chat_id) //"avatar","chat_id","description","name","owner_open_id","owner_user_id"
        await puppet.messageSendText(msgPayload.id!, obj.open_id + ':' + obj.name)
      }
    } else {
      console.info('没有群聊')
    }
  } else if (/删除成员测试/i.test(msgPayload.text || '')) {
    await puppet.roomDel(msgPayload.id!, 'ou_7ebb5c46bb6792a456e5e6dc01f4a64f')
  } else if (/修改群名/i.test(msgPayload.text || '')) {
    const roomList = await puppet.roomList().catch(console.error)
    if (roomList != null) {
      for (const i in roomList) {
        const obj = await eval(roomList[i])
        // console.info(obj.chat_id) //"avatar","chat_id","description","name","owner_open_id","owner_user_id"
        await puppet.messageSendText(msgPayload.id!, obj.open_id + ':' + obj.name)
        await puppet.roomTopic(obj.chat_id, '新群名')
      }
    }
  } else if (/contactSelfQRCode/i.test(msgPayload.text || '')) {
    console.info(await puppet.contactSelfQRCode())
  } else {
    console.info('Nothing')
  }

  process.on('unhandledRejection', (reason, p) => {
    console.info('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })
}

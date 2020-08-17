import {
    EventMessagePayload,
    MessageType,
    FileBox,
} from 'wechaty-puppet'

let fs = require('fs');

import { PuppetLark } from '../src/puppet-lark'

let puppet = new PuppetLark({
    larkServer: {
        port: 1234,
    },
    larkAppConfig: {
        appId: "cli_9fbf8aea53ab100d",
        appSecret: "oTD9gzRb7VpJBWdbNuUUwhuLWsSR4Wct",
        appVerificationToken: "IidvREGFgCsQSeoECXU4ebPsstmQMvzD",
    }
})

puppet.start().catch(async e => {
    console.error('Bot start() fail:', e)
    // await puppet.stop()
    process.exit(-1)
})

puppet.on('message', onMessage)

async function onMessage(payload: EventMessagePayload) {
    const msgPayload = await puppet.messagePayload(payload.messageId)

    if(msgPayload.type==MessageType.Image){
        console.log('收到图片消息')
        let _image = FileBox.fromFile('D:/Projects/Wechaty/lark/examples/test_image.png')
        await puppet.messageSendFile(msgPayload.fromId!,_image).catch(console.error)
    }
    else if (/ding/i.test(msgPayload.text || '')) {
        await puppet.messageSendText(msgPayload.fromId!, "dong")
    }
    process.on('unhandledRejection', (reason, p) => {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
}


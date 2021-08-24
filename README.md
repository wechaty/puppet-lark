# WECHATY PUPPET LARK (飞书)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-brightgreen.svg)](https://wechaty.js.org)

[![NPM Version](https://badge.fury.io/js/wechaty-puppet-lark.svg)](https://badge.fury.io/js/wechaty-puppet-lark)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-puppet-lark/next.svg)](https://www.npmjs.com/package/wechaty-puppet-lark?activeTab=versions)

## 运行方法

### 配置系统环境变量

1. `WECHATY_PUPPET_LARK_APPID`：飞书应用的App ID

2. `WECHATY_PUPPET_LARK_APPSECRET`：飞书应用的App Secret

3. `WECHATY_PUPPET_LARK_TOKEN`：飞书事件订阅平台提供的Verification Token

### 安装依赖

将代码clone到本地，执行`npm install`

### 飞书平台配置

在飞书平台获取功能权限，具体参考：[飞书开放平台-应用权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)

### 运行示例代码

`ts-node .\examples\ding-dong-bot.ts`

按照提示完成URL配置，即可运行示例机器人

## Getting Started with Wechaty

```sh
export WECHATY_PUPPET=wechaty-puppet-lark
npm start
```

Learn more for building your first Wechaty bot at <https://github.com/wechaty/wechaty-getting-started>

- ## 项目介绍

  “开源软件供应链点亮计划-暑期2021”（以下简称 暑期2021）是由中科院软件所与 openEuler 社区共同举办的一项面向高校学生的暑期活动。旨在鼓励在校学生积极参与开源软件的开发维护，促进国内优秀开源软件社区的蓬勃发展。活动联合各大开源社区，针对重要开源软件的开发与维护提供项目，并向全球高校学生开放报名。 学生可自主选择感兴趣的项目进行申请，并在中选后获得该软件资深维护者（社区导师）亲自指导的机会。 根据项目的难易程度和完成情况，参与者还可获取“开源软件供应链点亮计划-暑期2021”活动奖金和奖杯。

  官网：[https://summer.iscas.ac.cn](https://summer.iscas.ac.cn/)

  往期回顾：[https://wechaty.js.org/2020/07/20/wechaty-soc-kick-off-meeting](https://wechaty.js.org/2020/07/20/wechaty-soc-kick-off-meeting)

  本项目 [基于开放 API 封装 Wechaty 接口下的飞书聊天机器人] 系 暑期2021 支持的开源项目。

## [基于开放 API 封装 Wechaty 接口下的飞书聊天机器人]具体计划

- 导师：范蕊

- 学生：马田慧

- 项目链接：[wechaty/summer-of-wechaty#38](https://github.com/wechaty/summer-of-wechaty/issues/38)

- 模块列表

  - [x] 更新api版本，熟悉飞书api和wechaty。
  - [x] 实现之前未实现的函数
  - [ ] 连接Contact、Message、Room等类，尝试实现复用
  - [ ] 撰写文档、example
  - [ ] 发布npm包

- 计划安排

  - 熟悉wechaty
    - 7.14 - 7.17
    - 使用wechaty
    - 了解飞书api
  - 更新api版本
    - 7.18 - 7.24
  - 实现之前未实现的函数阶段
    - 7.25 - 8.8
    - 分两阶段完成，期间注重与导师交流
  - 连接Contact、Message、Room等类
    - 8.9 - 8.21
  - 撰写文档，examples
    - 8.22 - 8.28
  - 项目完善
    - 8.29 - 9.5
    - 代码重构
    - 发布npm包

- 项目链接：

  [https://github.com/remember00000/wechaty-puppet-lark](https://github.com/remember00000/wechaty-puppet-lark)

- 联系方式：+86 18660817606|email：2741102314@qq.com

## 相关链接

- [飞书开放平台](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)
- [Wechaty](https://wechaty.js.org/v/zh/)
- [Express](https://www.runoob.com/nodejs/nodejs-express-framework.html)
- [TypeScripts中文手册](https://www.tslang.cn/docs/handbook/basic-types.html)

## History

### master

### v0.5(July 14,2021)

1.Update API and methods implement

2.Blog:[基于开放 API 封装 Wechaty 接口下的飞书聊天机器人：期初](https://wechaty.js.org/2021/07/14/ospp-plan-wechaty-puppet-lark/)

### v0.4 (Feb 10, 2021)

1. Fix linting
1. Clean & Upgrade dependencies
1. Fix CI/CD

### v0.3 (Oct 2020)

1. Move Repo to Wechaty Organization
1. Blog: [基于开放 API 封装 Wechaty 接口下的飞书聊天机器人：期末](https://wechaty.js.org/2020/09/30/wechaty-puppet-lark-final-blog/)

### v0.0.1 (Jul 29, 2020)

1. Init version.
1. Blog: [基于开放 API 封装 Wechaty 接口下的飞书聊天机器人：期初](https://wechaty.js.org/2020/07/29/wechaty-puppet-lark-plan-blog/)

## Author

[Fairy FAN](https://github.com/Roxanne718) (范蕊), study NAS (Neural Architecture Search) in Nankai University

## Maintainer

- [Huan LI](https://github.com/huan) ([李卓桓](http://linkedin.com/in/zixia)), Tencent TVP of Chatbot, \<zixia@zixia.net\>

## Copyright & License

- Code & Docs © 2020-2021 Fairy FAN and Wechaty Contributors
- Code released under the Apache-2.0 License
- Docs released under Creative Commons

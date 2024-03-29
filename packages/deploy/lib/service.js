/**
 * 命令服务
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const log = require('./log')

module.exports = class Service {

  // 配置
  constructor(params = []) {
    const home = process.env.HOME || process.env.USERPROFILE
    const serverConfigDir = home + '/.config/jz-deploy'
    this.startDate = new Date()
    this.tplConfigUrl = path.join(__dirname, './', 'template/config.js')
    this.tplConfigDefault = require(path.join(__dirname, './', 'template/config-default.js'))
    this.serverConfigDir = serverConfigDir
    this.serverConfigUrl = serverConfigDir + '/server.config.js'
    this.deployConfigUrl = path.resolve('./deploy.config.js')
    this.devConfigUrl = path.resolve('./dev.config.js')
    this.vueConfig = path.resolve('./vue.config.js')
    this.packageJson = path.resolve('./package.json')
    this.params = params
    this.deployConfig = this.checkDeployConfig()
    this.serverConfig = this.checkServerConfig()
  }

  // 检测项目端配置，errorTips 为 true 则输出报错信息
  checkDeployConfig(errorTips = false) {
    try {
      const config = require(this.deployConfigUrl)
      if (Object.keys(config).length) {
        return config
      } else {
        if (errorTips) {
          log.error(`请检查 ${log.cyan('deploy.config.js')} 文件是否配置正确。`)
        }
        return false
      }
    } catch (error) {
      if (errorTips) {
        log.error(`没有找到 ${log.cyan('deploy.config.js')} 配置文件，请在项目中运行 ${log.green('jz-deploy init -c')} 命令生成该文件。`)
      }
      return false
    }
  }

  // 检测服务端配置，errorTips 为 true 则输出报错信息
  checkServerConfig(errorTips = false) {
    try {
      const config = require(this.serverConfigUrl)
      if (Object.keys(config).length) {
        return config
      } else {
        if (errorTips) {
          log.error(`请检查 ${log.cyan('~/.config/jz-deploy/server.config.js')} 文件是否配置正确。`)
        }
        return false
      }
    } catch (error) {
      if (errorTips) {
        log.error(`没有找到 ${log.cyan('~/.config/jz-deploy/server.config.js')} 配置文件，请在项目中运行 ${log.green('jz-deploy init -r')} 命令生成该文件。`)
      }
      return false
    }
  }

  // 补零
  addZero(n) {
    let num = parseInt(n)
    return num < 10 ? 0 + '' + num : num
  }

  // 返回 YYYY-MM-DD HH:mm:ss
  formatDate(second) {
    const date = this.startDate
    return `${date.getFullYear()}-` +
      `${this.addZero(date.getMonth() + 1)}-` +
      `${this.addZero(date.getDate())} ` +
      `${this.addZero(date.getHours())}:` +
      `${this.addZero(date.getMinutes())}:` +
      `${this.addZero(date.getSeconds())}`
  }

  // 获取执行耗时
  getExecTime() {
    const second = Math.floor((new Date().getTime() - this.startDate.getTime()) / 1000)
    return `${this.addZero(Math.floor(((second % 86400) % 3600) / 60))}分` +
      `${this.addZero(Math.floor(((second % 86400) % 3600) % 60))}秒`
  }

  // 环境
  env() {
    const type = os.type()
    let str = type === 'Linux' ? 'server' : 'client'
    return str
  }

  // 获取代码提示
  getCodeTips(code) {
    const error = {
      200: '任务执行成功',
      201: '依赖安装错误',
      202: '代码检测错误',
      203: '自动测试错误',
      204: '应用构建错误',
      205: '资源部署错误',
      206: '应用分发错误',
      207: '指令参数错误'
    }
    return code && error[code] ? error[code] : ''
  }

  // 任务环境
  getTaskEnv(type) {
    const env = {
      test: '测试',
      pre: '预发布',
      prod: '生产'
    }
    return env[type] || '未知'
  }

  // 命令
  cmd(name, options = {}) {
    require(`./command/${name}`)(this, options)
  }
}

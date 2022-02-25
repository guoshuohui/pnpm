/**
 * 初始化配置
 */

const fs = require('fs')
const { EOL, type } = require('os')
const log = require('../log')

module.exports = (service) => {

  // 校验
  const args = service.params[0]
  const argsLength = Object.keys(args).length
  if (argsLength === 0) {
    log.warn('请带上参数，可通过 -h 查看帮助')
    return
  }
  if (argsLength > 1) {
    log.warn('不允许同时初始化服务端和客户端配置')
    return
  }

  const env = service.env()

  // 服务端
  if (args.server) {
    if (env === 'server') {
      let obj = {}
      args.server.forEach(item => {
        obj[item.split('=')[0]] = item.split('=')[1]
      })
      let serverConfig = Object.assign(service.serverConfig || {}, obj)
      fs.writeFileSync(service.serverConfigUrl, `module.exports=${JSON.stringify(serverConfig)}`, {
        encoding: 'utf-8'
      })
    } else {
      log.warn('不允许在客户端运行该命令')
    }
  }

  // 客户端
  if (args.client) {
    if (env === 'client') {
      const config = service.checkDeployConfig()
      if (config) {
        log.warn(`${log.green('deploy.config.js')} 文件已经存在。`)
      } else {
        const tplConfig = fs.readFileSync(service.tplConfig, {
          encoding: 'utf-8'
        })
        const lines = tplConfig.split(/\r?\n/g)
        fs.writeFileSync(service.deployConfig, lines.join(EOL), {
          encoding: 'utf-8'
        })
        log.info('配置初始化成功~')
      }
    } else {
      log.warn('不允许在服务端允许该命令')
    }
  }
}
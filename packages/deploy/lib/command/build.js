/**
 * 应用构建
 */

const shell = require('shelljs')
const log = require('../log')

module.exports = (service) => {
  const options = Object.assign(service.tplConfigDefault.build, service.deployConfig.build || {})

  shell.echo(log.green('--- 环境信息 ---'))

  if (shell.exec('node -v').code || shell.exec('npm -v').code) {
    shell.exit(1)
  }

  shell.echo(log.green('--- 安装依赖 ---'))

  const execInstall = shell.exec('npm install')
  if (execInstall.code) {
    service.cmd('robot', {
      code: 201,
      exec: execInstall
    })
    shell.exit(1)
  }

  shell.echo(log.green('--- 代码检测 ---'))

  const execLint = shell.exec('npx vue-cli-service lint')
  if (execLint.code) {
    service.cmd('robot', {
      code: 202,
      exec: execLint
    })
    shell.exit(1)
  }

  // 非必须
  if (options && options.test) {
    shell.echo(log.green('--- 自动测试 ---'))

    const execTest = shell.exec('npm run test')
    if (execTest.code) {
      service.cmd('robot', {
        code: 203,
        exec: execTest
      })
      shell.exit(1)
    }
  }

  shell.echo(log.green('--- 应用构建 ---'))

  let report = ''
  let clean = ''
  if (options.report === 'html') {
    report = ' --report'
  } else if (options.report === 'json') {
    report = ' --report-json'
  }
  if (!options.clean) {
    clean = ' --no-clean'
  }

  const execBuild = shell.exec(`npx vue-cli-service build${report}${clean}`)
  if (execBuild.code) {
    service.cmd('robot', {
      code: 204,
      exec: execBuild
    })
    shell.exit(1)
  }
}
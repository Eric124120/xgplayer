import Plugin from '../../plugin'

const { Events, Util, Sniffer, POSITIONS } = Plugin
export default class DefinitionIcon extends Plugin {
  static get pluginName () {
    return 'definition'
  }

  // 默认配置信息
  static get defaultConfig () {
    return {
      position: POSITIONS.CONTROLS_RIGTH,
      index: 3,
      list: null,
      disable: false,
      hideMobile: true // 是否在移动端竖屏状态下隐藏
    }
  }

  constructor (args) {
    super(args)
    // 记录切换的时候的播放器状态
    this.curTime = 0
    this.isPaused = true
  }

  afterCreate () {
    this.once(Events.CANPLAY, () => {
      if (this.config.list && this.config.list.length > 0) {
        this.renderItemList()
        this.show()
      }
    })
    this.once('resourceReady', (list) => {
      this.changeDefinitionList(list)
    })
    if (Sniffer.device === 'mobile') {
      this.activeEvent = 'touchend'
    } else {
      this.activeEvent = 'mouseenter'
    }
    this.onToggle = this.onToggle.bind(this)
    this.onItemClick = this.onItemClick.bind(this)
    this.bind(this.activeEvent, this.onToggle)
    this.bind('mouseleave', this.onToggle)
    this.bind('.option-list li', ['touchend', 'click'], this.onItemClick)
  }

  renderItemList () {
    const {player} = this
    const {list} = this.config
    let src = player.config.url;
    const a = document.createElement('a')
    if (player.switchURL) {
      this.switchUrl()
    } else {
      const currentSrc = player.currentSrc || player.src;
      src = /^http/.test(currentSrc) ? currentSrc : src;
    }
    if (player['hls']) {
      a.href = player['hls'].url
      src = a.href
    }

    const liList = list.map(item => {
      a.href = item.url
      const className = player.dash ? (item.selected ? 'selected' : '') : (a.href === src ? 'selected' : '')
      return `<li class="${className}" cname="${item.name}" url="${item.url}">${item.name}</li>`
    })
    let cursrc = list.filter(item => {
      a.href = item.url
      if (player.dash) {
        return item.selected === true
      } else {
        return a.href === src
      }
    })
    this.find('.icon-text').innerHTML = (cursrc[0] || {name: '清晰度'}).name
    this.find('.option-list').innerHTML = liList.join('')
  }

  onCanplayChangeDefinition () {
    const {player} = this
    player.currentTime = this.curTime
    if (!this.isPaused) {
      let playPromise = player.play()
      if (playPromise !== undefined && playPromise) {
        // eslint-disable-next-line handle-callback-err
        playPromise.catch(err => {})
      }
    }
    player.emit(Events.AFTER_DEFINITION_CHANGE)
  }

  onToggle (e) {
    // e.preventDefault()
    // e.stopPropagation()
    const ulDom = this.find('.option-list')
    if (Util.hasClass(ulDom, 'active')) {
      this.player.controls.unFocus()
      Util.removeClass(ulDom, 'active')
    } else {
      this.player.controls.focus()
      Util.addClass(ulDom, 'active')
    }
  }

  switchUrl (lastATag) {
    const {player} = this
    let curRUL = document.createElement('a');
    ['mp4', 'hls', '__flv__', 'dash'].every(item => {
      if (player[item]) {
        if (player[item].url) {
          curRUL.href = player[item].url
        }
        if (item === '__flv__') {
          if (player[item]._options) {
            curRUL.href = player[item]._options.url
          } else {
            curRUL.href = player[item]._mediaDataSource.url
          }
        }
        return false
      } else {
        return true
      }
    })
    if (lastATag && curRUL.href !== lastATag.href && !player.ended) {
      player.switchURL(lastATag.href)
    }
  }

  // 对外暴露 切换清晰度
  changeDefinitionList (list) {
    this.config.list = list
    this.renderItemList()
    this.show()
  }

  onItemClick (e) {
    const {player} = this
    const {list} = this.config
    e.preventDefault()
    e.stopPropagation()
    if (e.target && e.target.className === 'selected') {
      return false
    }
    const a = document.createElement('a')
    player.emit(Events.BEFORE_DEFINITION_CHANGE, a.href)
    if (player.dash) {
      list.forEach(item => {
        item.selected = false
        if (item.name === e.target.innerHTML) {
          item.selected = true
        }
      })
    }
    const curlSelected = this.find('.selected')
    Util.addClass(e.target, 'selected')
    curlSelected && Util.removeClass(curlSelected, 'selected')
    const from = curlSelected ? curlSelected.getAttribute('cname') : ''
    const to = e.target.getAttribute('cname')
    a.href = e.target.getAttribute('url')
    this.curTime = player.currentTime;
    this.isPaused = player.paused
    if (player.switchURL) {
      this.switchUrl(a)
    } else {
      // if (player['hls']) {
      //   let curRUL = document.createElement('a')
      //   curRUL = player['hls'].url
      // }
      if (a.href !== player.currentSrc) {
        if (!player.ended) {
          player.src = a.href
          this.once('canplay', () => {
            this.onCanplayChangeDefinition()
          })
        }
      }
    }
    this.find('.icon-text').innerHTML = to
    player.emit(Events.DEFINITION_CHANGE, {from, to})
    if (Sniffer.device === 'mobile') {
      Util.removeClass(this.find('.option-list'), 'active')
    }
  }

  render () {
    const text = '清晰度'
    return `<xg-icon class="xgplayer-definition">
    <div class="xgplayer-icon btn-text"><span class="icon-text">${text}</span></div>
    <ul class="option-list">
    </ul>
   </xg-icon>`
  }
}

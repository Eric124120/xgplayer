import Plugin from '../../../plugin'
import RotateIcon from '../../assets/rotate.svg'
import './index.scss'

class Rotate extends Plugin {
  static get pluginName () {
    return 'rotate'
  }

  afterCreate () {
    this.updateRotateDeg = this.updateRotateDeg.bind(this)
    this.rotate = this.rotate.bind(this);
    this.bind('.xgplayer-icon', ['click', 'touchend'], this.rotate)
  }

  destroy () {
    this.unbind('.xgplayer-icon', ['click', 'touchend'], this.rotate)
  }

  updateRotateDeg () {
    let player = this.player;
    if (!player.rotateDeg) {
      player.rotateDeg = 0
    }

    let width = player.root.offsetWidth
    let height = player.root.offsetHeight
    let targetWidth = player.video.videoWidth
    let targetHeight = player.video.videoHeight

    if (!this.config.innerRotate) {
      // player.root.style.width = height + 'px'
      // player.root.style.height = width + 'px'
    }

    let scale
    if (player.rotateDeg === 0.25 || player.rotateDeg === 0.75) {
      if (this.config.innerRotate) {
        if ((targetWidth / targetHeight) > (height / width)) { // 旋转后纵向撑满
          let videoWidth = 0
          if ((targetHeight / targetWidth) > (height / width)) { // 旋转前是纵向撑满
            videoWidth = height * targetWidth / targetHeight
          } else {
            // 旋转前是横向撑满
            videoWidth = width
          }
          scale = height / videoWidth
        } else { // 旋转后横向撑满
          let videoHeight = 0
          if ((targetHeight / targetWidth) > (height / width)) { // 旋转前是纵向撑满
            videoHeight = height
          } else { // 旋转前是横向撑满
            videoHeight = width * targetHeight / targetWidth
          }
          scale = width / videoHeight
        }
      } else {
        if (width >= height) {
          scale = width / height
        } else {
          scale = height / width
        }
      }
      scale = parseFloat(scale.toFixed(5))
    } else {
      scale = 1
    }

    if (this.config.innerRotate) {
      player.video.style.transformOrigin = 'center center'
      player.video.style.transform = `rotate(${player.rotateDeg}turn) scale(${scale})`
      player.video.style.webKitTransform = `rotate(${player.rotateDeg}turn) scale(${scale})`
    } else {
      player.root.style.transformOrigin = 'center center'
      player.root.style.transform = `rotate(${player.rotateDeg}turn) scale(${1})`
      player.root.style.webKitTransform = `rotate(${player.rotateDeg}turn) scale(${1})`
    }
  }

  rotate (clockwise = false, innerRotate = true, times = 1) {
    let player = this.player;
    if (!player.rotateDeg) {
      player.rotateDeg = 0
    }
    let factor = clockwise ? 1 : -1

    player.rotateDeg = (player.rotateDeg + 1 + factor * 0.25 * times) % 1
    this.updateRotateDeg()

    player.emit('rotate', player.rotateDeg * 360)
  }

  registerIcons () {
    return {
      'rotate': RotateIcon
    }
  }

  // 扩展语言
  registerLangauageTexts () {
    return {
      'rotate': {
        jp: '日文text',
        en: 'rotate',
        zh: '旋转屏幕'
      }
    }
  }

  render () {
    return `
    <xg-icon class="xgplayer-rotate">
      <div class="xgplayer-icon">
        ${RotateIcon}
      </div>
      <div class="xg-tips">
      ${this.text.rotate}
      </div>
    </xg-icon>`
  }
}

export default Rotate

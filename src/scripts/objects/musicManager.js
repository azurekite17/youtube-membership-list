import sponsors from '../../assets/memberlist.json'
import moment from 'moment'
export default class MusicManager {
  audio
  scene
  sponsors = sponsors
  showSponsorsAt = 27.1
  endShowSponsorAt = 322
  showSponsorDuration = this.endShowSponsorAt - this.showSponsorsAt
  showSponsors = false
  endShowSponsors = false
  currentSponsers = []
  events = []
  virtualTime
  virtualTimeSeek = 0.1
  virtualTimeDurationInSeconds
  virtualTimeStartAt
  virtualTimeEndAt = moment(sponsors[sponsors.length - 1][3])
  debugMsg
  nextSponsor
  constructor (scene) {
    this.scene = scene
    scene.pauseOnBlur = false
    this.music = scene.sound.add('music')

    if (window.DEBUG) {
      this.debugMsg = scene.add.text(10, 40, '', {
        color: 'black',
        fontSize: '20px'
      })
    }
  }

  onSeek (e) {
    console.log(e)
  }

  on (event, listener) {
    switch (event) {
      case 'sponsorJoin':
      case 'endShowSponsors':
        this.addEvent(event, listener)
        break
      default:
        this.music.on(event, listener)
        break
    }
  }

  addEvent (event, listener) {
    this.events.push([
      event, listener
    ])
  }

  emitEvent (event, data) {
    this.events.filter(e => {
      return e[0] === event
    }).forEach(e => {
      e[1](data)
    })
  }

  play (config) {
    var seek = 0
    if (window.DEBUG) {
      // seek = this.showSponsorsAt - 2
      seek = this.endShowSponsorAt - 5
    }

    var a = this.music

    console.log(a)

    this.music.play({
      ...config,
      seek
    })
  }

  showFirstSponsor () {
    const s = this.sponsors.shift()
    this.showSponsors = true
    this.virtualTimeStartAt = moment(s[3])
    this.virtualTimeDurationInSeconds = this.virtualTimeEndAt.diff(this.virtualTimeStartAt, 'seconds')
    console.log('show first sponsor', s)
    this.showSponsor(s)
    this.nextSponsor = this.sponsors.shift()
  }

  showSponsor (s) {
    this.emitEvent('sponsorJoin', s)
  }

  update (time, delta) {
    // console.log('update in music m')
    if (!this.music) return
    const seek = parseFloat(this.music.seek.toFixed(1))
    // console.log(seek, this.showSponsorsAt)
    if (seek >= this.showSponsorsAt && this.showSponsors === false) {
      this.showFirstSponsor()
    } else if (seek >= this.endShowSponsorAt && this.endShowSponsors === false) {
      this.emitEvent('endShowSponsors', {})
      this.endShowSponsors = true
    }
    var showsSeekP = (seek - this.showSponsorsAt) / this.showSponsorDuration
    if (showsSeekP >= 1) {
      showsSeekP = 1
    }
    const secsToAdd = showsSeekP * this.virtualTimeDurationInSeconds
    this.virtualTime = moment(this.virtualTimeStartAt).add(secsToAdd, 'seconds')

    if (this.nextSponsor && this.virtualTime >= moment(this.nextSponsor[3])) {
      this.showSponsor(this.nextSponsor)
      this.nextSponsor = sponsors.shift()
    }

    if (window.DEBUG) {
      try {
        var texts = [
          'seek: ' + seek.toFixed(1) + ' total:' + this.music.duration,
          'msuic_seek_p: ' + seek / this.music.duration,
          'showsSeekP: ' + (showsSeekP * 100).toFixed(2) + ' %',
          // 'secsToAdd: ' + secsToAdd,
          // 'showSponsorDuration: ' + this.showSponsorDuration,
          // 'vTimeDuration:' + this.virtualTimeDurationInSeconds,
          'vTime: ' + this.virtualTime.format(),
         `vTimeStart: ${this.virtualTimeStartAt.format()}`,
         `vTimeEnd: ${this.virtualTimeEndAt.format()}`
        ]

        texts.push('nextSponsor:' + moment(this.nextSponsor[3]).format() + ', ' + this.nextSponsor[0])
      } catch (error) {
        // console.error(error)
      }
      this.debugMsg.setText(texts)
    }
  }
}

import { CANVAS } from './Config'
import { FileManager } from './FileManager'

const note = {
  width: 150,
  height: 50,
  gap: 2,
  color: {
    white: '#ffffff',
    blue: '#00dbff',
  },
}

export class Skin {
  static config = {
    fps: {
      right: CANVAS.WIDTH - 10,
      bottom: CANVAS.HEIGHT - 24,
      font: 'bold 24px 微软雅黑',
      fillStyle: '#f00',
    },
    common: {
      number: {
        default: {
          ['default-0']: {
            image: FileManager.loadImage('./skin/default-0.png'),
            width: 35,
            height: 52,
          },
          ['default-1']: {
            image: FileManager.loadImage('./skin/default-1.png'),
            width: 25,
            height: 50,
          },
          ['default-2']: {
            image: FileManager.loadImage('./skin/default-2.png'),
            width: 32,
            height: 51,
          },
          ['default-3']: {
            image: FileManager.loadImage('./skin/default-3.png'),
            width: 32,
            height: 52,
          },
          ['default-4']: {
            image: FileManager.loadImage('./skin/default-4.png'),
            width: 36,
            height: 51,
          },
          ['default-5']: {
            image: FileManager.loadImage('./skin/default-5.png'),
            width: 32,
            height: 51,
          },
          ['default-6']: {
            image: FileManager.loadImage('./skin/default-6.png'),
            width: 34,
            height: 52,
          },
          ['default-7']: {
            image: FileManager.loadImage('./skin/default-7.png'),
            width: 32,
            height: 50,
          },
          ['default-8']: {
            image: FileManager.loadImage('./skin/default-8.png'),
            width: 34,
            height: 52,
          },
          ['default-9']: {
            image: FileManager.loadImage('./skin/default-9.png'),
            width: 34,
            height: 52,
          },
        },
      },
    },
    stage: {
      board: {
        bgColor: 'rgba(0, 0, 0, 1)',
        width: 4 * note.width,
      },
      border: {
        width: 10,
        color: '#fff'
      },
      columnStart: CANVAS.WIDTH / 2.0 - note.width * 2 - 10,
      accuracy: {
        x: CANVAS.WIDTH - 10,
        y: 140,
        font: 'bold 56px 微软雅黑',
        color: '#fff',
        textAlign: 'right',
      },
      ranking: {
        right: 360,
        top: 94,
        scale: 1.44,
      },
      combo: {
        assets: null,
        height: 1,
        top: CANVAS.HEIGHT / 1.5,
      },
      judgement: {
        top: CANVAS.HEIGHT / 3,
        effect: {
          defaultMaxScale: 1.28,
          initScale: 1.25,
          initAlpha: 1,
          growTime: 100,
          backTime: 200,
          fadeTime: 1000,
        },
      },
      note,
      sectionLine: {
        color: '#0f0',
        height: 1,
      },
      hitEffect: {
        speed: {
          rise: 25,
          fall: 10,
        },
        height: Math.min(CANVAS.HEIGHT / 2, 540),
      },
      score: {
        assets: null,
        right: CANVAS.WIDTH - 10,
        top: 10,
      },
      judgementLine: {
        height: 200,
      },
    },
    main: {
      beatmap: {
        item: {
          select: {
            gap: 16,
            extra: 200,
            bgColor: 'hsla(42, 100%, 96%, 0.5)',
            title: {
              color: '#212529',
            },
          },
          hover: {
            extra: 80,
            gap: 16,
            bgColor: 'hsla(30, 100%, 75%, 0.5)',
            title: {
              color: '#212529',
            },
          },
          base: {
            height: 160,
            gap: -16,
            bgColor: 'hsla(30, 100%, 75%, 0.5)',
            title: {
              color: '#212529',
              font: '32px 微软雅黑',
            },
            description: {
              font: '20px 微软雅黑',
            },
            subtitle: {
              font: 'bold 24px 微软雅黑',
            },
          },
          sameGroup: {
            bgColor: 'hsla(195, 80%, 75%, 0.5)'
          },
          neverPlayed: {
            bgColor: 'hsla(195, 80%, 75%, 0.5)'
          },
          baseLeft: CANVAS.WIDTH / 2 + 200,
          width: CANVAS.WIDTH,
        },
      },
    },
  }

  static loadConfig (config) {
    Skin.config = {
      ...Skin.config,
      config,
    }
  }
}

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const rootDir = join(currentDir, '../')

const publicDirectory = join(rootDir, 'public')
const audioDirectory = join(rootDir, 'audio')
const songsDirectory = join(audioDirectory, 'songs')
const fxDirectory = join(audioDirectory, 'fx')

export default {
  dir: {
    rootDir,
    publicDirectory,
    audioDirectory,
    songsDirectory,
    fxDirectory
  },
  port: process.env.PORT || 3000,
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html'
  },
  location: {
    home: '/home'
  },
  constants: {
    CONTENT_TYPE: { 
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css'
    }
  }
}

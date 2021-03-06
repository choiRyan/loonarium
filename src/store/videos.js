import Vuex from 'vuex'
import { fetchVideos } from '../services/api'
import uniq from '../utils/makeUnique'
import { setQueryParams } from '../utils/queryParams'

const state = () => ({
  currentVideo: {},
  videoOptions: []
})

const getters = {
  currentVideo (state) {
    return state.currentVideo
  },
  currentVideoCode (state) {
    return state.currentVideo ? state.currentVideo.code : null
  },
  currentVideoExists (state) {
    return state.currentVideo && state.currentVideo.id
  },
  videoOptions (state) {
    return state.videoOptions.reverse()
  }
}

// define the possible mutations that can be applied to our state
const mutations = {
  SET_CURRENT_VIDEO_BY_ID(state, videoId) {
    const [selectedVid] = state.videoOptions
      .filter(video => video.id === videoId)
    if (selectedVid) state.currentVideo = selectedVid
    else if (state.videoOptions && state.videoOptions.length) {
      state.currentVideo = state.videoOptions[state.videoOptions.length-1]
    }
  },
  SET_CURRENT_VIDEO (state, video={}) {
    state.currentVideo = video
  },
  SET_VIDEO_OPTIONS (state, videos=[]) {
    state.videoOptions = uniq([
      ...state.videoOptions,
      ...videos
    ], 'code')
  },
  ADD_COMMENT_TO_CURRENT_VIDEO (state) {
    state.currentVideo.comment_count += 1
  },
  REMOVE_COMMENT_TO_CURRENT_VIDEO (state) {
    state.currentVideo.comment_count -= 1
  }
}

const actions = {
  async fetchVideoOptions ({ state, commit, dispatch }, { page=1, preselect }) {
    const videos = await fetchVideos(page)
    commit('SET_VIDEO_OPTIONS', videos.results)
    videos.results.forEach(video => {
      video.title = `(Notes: ${video.comment_count}) ` + video.title.trim()
    })
    if (!isNaN(preselect)) {
      commit('SET_CURRENT_VIDEO_BY_ID', preselect)
      console.log(preselect, state.currentVideo)
      dispatch('comments/fetchFirstPage', { code: state.currentVideo.code },
        { root: true })
    } else if (page === 1) {
      commit('SET_CURRENT_VIDEO', videos.results[videos.results.length-1])
      const video = videos.results[videos.results.length-1]
      dispatch('comments/fetchFirstPage', { code: video.code }, { root: true })
    }
  },
  selectVideo ({ commit, dispatch }, video) {
    if (video && video.code) {
      dispatch('comments/fetchFirstPage', { code: video.code }, { root: true })
      commit('SET_CURRENT_VIDEO', video)
      setQueryParams({ v: video.id })
    }
  }
}

export default { namespaced: true, state, getters, mutations, actions }

'use strict'

import { name, version, homepage, description } from '../../package.json'

export function generateMetaInfo() {
  return {
    name,
    version,
    dev: !/^[\d\.]+$/.test(version),
    info: {
      homepage,
      description,
    },
    meta: {
      implementation: 'cf-worker',
      git_commit_hash: '${gitCommitHash}',
      build_at: '${buildDate}',
      wrangler_version: '${wranglerVersion}',
      golang_version: 'none',
    },
    options: {
      instruction: 'https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs',
      supported: ['$realtime', '$page', '$limit'],
    },
  }
}

type MetaInfo = {
  name: string
  version: string
  dev: boolean
  info: {
    homepage: string
    description: string
  }
  meta: {
    implementation: {
      platform: string
      tool: string
      version: string
    }
    git_commit_hash: string
    build_at: string
  }
  options: {
    instruction: string
    supported: string[]
  }
}

type CoreInfo = 'name' | 'version' | 'homepage' | 'description' | 'platform' | 'tool'

export function generateMetaInfo(coreInfo: Record<CoreInfo, string>): MetaInfo {
  return {
    name: coreInfo.name,
    version: coreInfo.version,
    dev: !/^[\d\.]+$/.test(coreInfo.version),
    info: {
      homepage: coreInfo.homepage,
      description: coreInfo.description,
    },
    meta: {
      implementation: {
        platform: coreInfo.platform,
        tool: coreInfo.tool,
        version: '${toolVersion}',
      },
      git_commit_hash: '${gitCommitHash}',
      build_at: '${buildDate}',
    },
    options: {
      instruction: 'https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs',
      supported: ['$realtime', '$page', '$limit'],
    },
  }
}

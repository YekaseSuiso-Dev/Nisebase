export interface SocialEntry {
  type: 'github' | 'twitter' | 'email'
  icon: string
  link: string
}

export interface Creator {
  avatar: string
  name: string
  username?: string
  title?: string
  org?: string
  desc?: string
  links?: SocialEntry[]
  nameAliases?: string[]
  emailAliases?: string[]
}

const getAvatarUrl = (name: string) => `https://github.com/${name}.png`

export const creators: Creator[] = [
  {
    name: '葉加瀨水素',
    avatar: '',
    username: 'YekaseSuiso-Dev',
    title: 'Nísëbase 原始创作者',
    desc: '计算机爱好者，专注于基础设施维护，各种带外管理疑难杂症配置',
    links: [
      { type: 'github', icon: 'github', link: 'https://github.com/YekaseSuiso-Dev' },
      { type: 'twitter', icon: 'twitter', link: 'https://x.com/YekaseSuiso2022' },
    ],
    nameAliases: ['YekaseSuiso-Dev', '葉加瀨水素official', '葉加瀨水素', 'YekaseSuiso'],
    emailAliases: ['hydrogenneko@gmail.com'],
  },
].map<Creator>((c) => {
  c.avatar = c.avatar || getAvatarUrl(c.username);
  return c as Creator;
})

export const creatorNames = creators.map(c => c.name)
export const creatorUsernames = creators.map(c => c.username || '')
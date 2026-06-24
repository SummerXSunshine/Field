<template>
  <div class="antv-test-page">
    <header class="antv-test-page__toolbar">
      <div>
        <h1>AntV 关系图测试页</h1>
        <p>使用 G6 TreeGraph 复刻现有关系树的分组、直线、颜色、箭头和选中逻辑。</p>
      </div>
      <a href="/">返回原页面</a>
    </header>

    <main class="antv-test-page__content">
      <AntvRelationshipGraph :data="graphData" @node-click="selectedNode = $event" />
    </main>

    <aside v-if="selectedNode" class="antv-test-page__selection">
      当前选择：{{ selectedNode.name }}
    </aside>
  </div>
</template>

<script>
import AntvRelationshipGraph from './components/AntvRelationshipGraph.vue'

export default {
  name: 'AntvTestPage',
  components: {
    AntvRelationshipGraph
  },
  data() {
    const relationStyles = {
      contact: {
        stroke: '#ef4444',
        labelBackground: '#fef2f2',
        labelColor: '#b91c1c'
      },
      wechat: {
        stroke: '#06b6d4',
        labelBackground: '#ecfeff',
        labelColor: '#0e7490'
      },
      family: {
        stroke: '#f59e0b',
        labelBackground: '#fffbeb',
        labelColor: '#b45309'
      },
      peer: {
        stroke: '#2563eb',
        labelBackground: '#eff6ff',
        labelColor: '#1d4ed8'
      }
    }

    const createEdge = (type, label, extraStyle = {}) => Object.assign(
      {
        label,
        strokeWidth: 1
      },
      relationStyles[type],
      extraStyle
    )

    const createGroup = (id, name, edge, children) => ({
      id,
      name,
      isTagGroup: true,
      edge,
      children
    })

    return {
      selectedNode: null,
      graphData: {
        id: 'zhang-san',
        name: '张三',
        subtitle: '核心人物',
        variant: 'avatar',
        style: {
          fill: '#ecfdf5',
          color: '#047857',
          stroke: '#6ee7b7'
        },
        children: [
          createGroup('__tag_group__family', '亲属关系', createEdge('family', '亲属'), [
            {
              id: 'father',
              name: '张建国',
              subtitle: '父亲',
              edge: createEdge('family', '父子'),
              children: [
                {
                  id: 'grandfather',
                  name: '张德福',
                  subtitle: '祖父',
                  edge: createEdge('family', '父子')
                },
                {
                  id: 'grandmother',
                  name: '王秀兰',
                  subtitle: '祖母',
                  edge: createEdge('family', '母子')
                }
              ]
            },
            {
              id: 'mother',
              name: '李芳',
              subtitle: '母亲',
              edge: createEdge('family', '母子')
            },
            {
              id: 'son',
              name: '张小明',
              subtitle: '儿子',
              variant: 'avatar',
              edge: createEdge('family', '父子')
            }
          ]),
          createGroup('__tag_group__contact', '通联关系', createEdge('contact', '通联'), [
            {
              id: 'phone-contact-3',
              name: '朝鲜电话（189098789078）',
              subtitle: '夜间高频联系人',
              highlightSignal: 'high',
              edge: createEdge('contact', '通联'),
              children: [
                {
                  id: 'phone-contact-3-helper',
                  name: '吴倩助理',
                  subtitle: '代接电话 4 次',
                  highlightSignal: 'low',
                  edge: createEdge('contact', '代接')
                }
              ]
            },
            {
              id: 'phone-contact-4',
              name: '高亮节点',
              subtitle: '短信往来 12 条',
              highlightSignal: 'medium',
              edge: createEdge('contact', '短信')
            }
          ]),
          createGroup('__tag_group__wechat', '微信好友', createEdge('wechat', '微信'), [
            {
              id: 'wechat-friend',
              name: '陈晨',
              subtitle: '微信好友',
              edge: createEdge('wechat', '微信')
            },
            {
              id: 'wechat-friend-3',
              name: '林凯',
              subtitle: '转账往来 5 笔',
              edge: createEdge('wechat', '微信转账'),
              children: [
                {
                  id: 'wechat-friend-3-group',
                  name: '项目沟通群',
                  subtitle: '共同微信群',
                  edge: createEdge('wechat', '群聊')
                }
              ]
            }
          ]),
          createGroup('__tag_group__peer', '同行关系', createEdge('peer', '同行'), [
            {
              id: 'colleague',
              name: '赵强',
              subtitle: '技术部经理',
              edge: createEdge('peer', '同行')
            },
            {
              id: 'colleague-3',
              name: '郑琳',
              subtitle: '供应商接口人',
              edge: createEdge('peer', '协作'),
              children: [
                {
                  id: 'colleague-3-company',
                  name: '星河科技',
                  subtitle: '合作单位',
                  edge: createEdge('peer', '任职')
                }
              ]
            }
          ])
        ]
      }
    }
  }
}
</script>

<style scoped>
.antv-test-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
  color: #1e293b;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.antv-test-page__toolbar {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid #dbe3ef;
  background: #ffffff;
}

.antv-test-page__toolbar h1 {
  margin: 0;
  font-size: 18px;
}

.antv-test-page__toolbar p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
}

.antv-test-page__toolbar a {
  color: #0f766e;
  font-weight: 700;
  text-decoration: none;
}

.antv-test-page__content {
  flex: 1;
  min-height: 0;
  padding: 16px;
}

.antv-test-page__selection {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
  color: #334155;
}
</style>


const routes = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
    children: [
      {
        path: "",
        name: "TOOL1",
        component: () => import('pages/tools/tool1.vue')
      },
      {
        path: "TOOL2",
        name: "TOOL2",
        component: () => import('pages/tools/tool2.vue')
      },
      {
        path: "TOOL3",
        name: "TOOL3",
        component: () => import('pages/tools/tool3.vue')
      },
      {
        path: "TOOL4",
        name: "TOOL4",
        component: () => import('pages/tools/tool4.vue')
      },
      {
        path: "TOOL5",
        name: "TOOL5",
        component: () => import('pages/tools/tool5.vue')
      },
      {
        path: "TOOL6",
        name: "TOOL6",
        component: () => import('pages/tools/tool6.vue')
      },
      {
        path: "TOOL7",
        name: "TOOL7",
        component: () => import('pages/tools/tool7.vue')
      },
    ]
  },

]

export default routes

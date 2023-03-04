
const routes = [
  {
    path: '/',
    component: () => import('pages/IndexPage.vue'),
    children: [
      {
        path: "",
        name: "Index1",
        component: () => import('pages/tools/Index1.vue')
      },
      {
        path: "Index2",
        name: "Index2",
        component: () => import('pages/tools/Index2.vue')
      },
      {
        path: "Index3",
        name: "Index3",
        component: () => import('pages/tools/Index3.vue')
      },
      {
        path: "Index4",
        name: "Index4",
        component: () => import('pages/tools/Index4.vue')
      },
      {
        path: "Index5",
        name: "Index5",
        component: () => import('pages/tools/Index5.vue')
      },
      {
        path: "Index6",
        name: "Index6",
        component: () => import('pages/tools/Index6.vue')
      },
      {
        path: "Index7",
        name: "Index7",
        component: () => import('pages/tools/Index7.vue')
      },
    ]
  },

]

export default routes

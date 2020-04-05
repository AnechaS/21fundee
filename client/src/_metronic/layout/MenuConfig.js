export default {
  header: {
    self: {},
    items: [
      {
        title: "Dashboards",
        root: true,
        alignment: "left",
        page: "dashboard",
        translate: "MENU.DASHBOARD"
      }
    ]
  },
  aside: {
    self: {},
    items: [
      {
        title: "Dashboard",
        root: true,
        icon: "flaticon2-architecture-and-city",
        page: "dashboard",
        translate: "MENU.DASHBOARD",
        bullet: "dot"
      },
      {
        title: "People",
        root: true,
        icon: "flaticon2-group",
        page: "#"
      },
      {
        title: "Database",
        root: true,
        bullet: "line",
        icon: "flaticon2-cube",
        submenu: [
          {
            title: "Messages",
            root: true,
            page: "#"
          },
          {
            title: "People",
            root: true,
            page: "#"
          },
          {
            title: "Schedule",
            root: true,
            page: "database/schedule"
          },
          {
            title: "Question",
            root: true,
            page: "database/question"
          },
          {
            title: "Quiz",
            root: true,
            page: "#"
          }
        ]
      },
      {
        title: "Bot",
        root: true,
        bullet: "dot",
        icon: "flaticon2-start-up",
        page: "#"
      },
      { section: "Setting" },
      {
        title: "General",
        root: true,
        icon: "flaticon2-gear",
        page: "#"
      }
    ]
  }
};

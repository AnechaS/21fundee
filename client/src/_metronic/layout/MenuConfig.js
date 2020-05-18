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
        icon: "flaticon2-graphic",
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
            title: "Comment",
            root: true,
            page: "database/comment"
          },
          {
            title: "Reply",
            root: true,
            page: "database/reply"
          },
          {
            title: "People",
            root: true,
            page: "database/people"
          },
          {
            title: "Question",
            root: true,
            page: "database/question"
          },
          {
            title: "Progress",
            root: true,
            page: "database/progress"
          },
          {
            title: "Schedule",
            root: true,
            page: "database/schedule"
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

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
      // { section: "Components" },
      // {
      //   title: "Collection",
      //   root: true,
      //   bullet: "dot",
      //   icon: "flaticon2-digital-marketing",
      //   submenu: [
      //     {
      //       title: "User",
      //       page: "react-bootstrap/alert"
      //     }
      //   ]
      // }
    ]
  }
};

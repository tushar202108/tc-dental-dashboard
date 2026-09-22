import { lazy } from "react";

export const ROUTES = [
  {
    key: "dashboard",
    path: '/dashboard',
    component: lazy(
      () =>
        import(
          "../pages/dashboard/dashboard"
        )
    ),
  },

  {
    key: "patients",
    path: "/patients",
    component: lazy(
      () =>
        import(
          "../pages/patients/pateints"
        )
    ),
  },

  //   {
  //     key: "appointments",
  //     path: "/appointments",
  //     component: lazy(
  //       () =>
  //         import(
  //           "../pages/Appointments/Appointments"
  //         )
  //     ),
  //   },

  //   {
  //     key: "reviews",
  //     path: "/reviews",
  //     component: lazy(
  //       () =>
  //         import(
  //           "../pages/Reviews/Reviews"
  //         )
  //     ),
  //   },

    {
      key: "profile",
      path: "/profile",
      component: lazy(
        () =>
          import(
            "../pages/Profile/Profile"
          )
      ),
    },

  //   {
  //     key: "settings",
  //     path: "/settings",
  //     component: lazy(
  //       () =>
  //         import(
  //           "../pages/Settings/Settings"
  //         )
  //     ),
  //   },
];
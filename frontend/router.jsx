import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import NotFound from "./src/pages/NotFound";
import Dashbaord from "./src/pages/Dashboard";
import Playground from "./src/pages/Playground";
import NewDashboard from "./src/pages/NewDashboard";
import Automation from "./src/pages/Automation";
import Home from "./src/pages/Home";
import Posted from "./src/pages/Posted";
import Scheduled from "./src/pages/Scheduled";

const router = createBrowserRouter([
  {
    path: "/company/:company_id",
    element: <Dashbaord/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: 'posted',
        element: <Posted/>
      },
      {
        path: 'scheduled',
        element: <Scheduled/>
      }
    ]
  },
  {
    path: "/playground/:company_id/:item_id",
    element: <Playground/>
  },
  {
    path: "/new",
    element: <NewDashboard/>
  },
  {
    path: "/automate",
    element: <Automation/>
  },
  // {
  //   path: "/company/:company_id/",
  //   element: <App />,
  // },
  {
    path: "/company/:company_id/application/:application_id",
    element: <App />,
  },
  {
    path: "/*", // Fallback route for all unmatched paths
    element: <NotFound />, // Component to render for unmatched paths
  },
]);

export default router;

import { Link, Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
// import { CollapsibleExample } from "./CollapsibleHeader";

const Layout = () => {
  return (
    <>
      <Navbar />
      {/* <CollapsibleExample /> */}
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout
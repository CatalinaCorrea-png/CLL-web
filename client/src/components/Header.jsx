import { Link, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import Footer from "./Footer";
// import { CollapsibleExample } from "./CollapsibleHeader";

const Header = () => {
  return (
    <>
      <Navbar />
      {/* <CollapsibleExample /> */}
      <Outlet />
      <Footer />
    </>
  )
}

export default Header
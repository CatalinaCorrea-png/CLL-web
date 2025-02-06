import { Link, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
// import { CollapsibleExample } from "./CollapsibleHeader";

const Header = () => {
  return (
    <>
      <Navbar />
      {/* <CollapsibleExample /> */}
      <Outlet />
    </>
  )
}

export default Header
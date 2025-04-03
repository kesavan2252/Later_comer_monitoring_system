import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import icon from "/img/image.png";
const Sidebar = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [showImportSubmenu, setShowImportSubmenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="w-[240px] h-auto border border-solid border-black rounded-lg bg-gradient-to-b from-[#6B69CC] to-white p-5 mt-1 ml-1 flex flex-col justify-between">
      <div>
        <div className="text-center mb-6">
          <img src={icon} alt="Logo" className="h-20 w-20 mx-auto rounded-lg" />
          <h2 className="text-[22px] text-white mt-3">MANAGE</h2>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="block bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF]"
          >
            Dashboard
          </Link>

          <div>
            <button
              onClick={() => toggleMenu("report")}
              className="w-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF] flex justify-between items-center"
            >
              Report <span>{activeMenu === "report" ? "▼" : "⮞"}</span>
            </button>
            {activeMenu === "report" && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  to="/reports/student"
                  className="block py-2 px-4 rounded-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] text-[#4d4747] font-bold border border-[#6F00FF]"
                >
                  Student
                </Link>
                <Link
                  to="/reports/department"
                  className="block py-2 px-4 rounded-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] text-[#4d4747] font-bold border border-[#6F00FF]"
                >
                  Department
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/view-data"
            className="block bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF]"
          >
            View Data
          </Link>

          <div>
            <button
              onClick={() => toggleMenu("data-tools")}
              className="w-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF] flex justify-between items-center"
            >
              Data Tools <span>{activeMenu === "data-tools" ? "▼" : "⮞"}</span>
            </button>
            {activeMenu === "data-tools" && (
              <div className="ml-4 mt-1 space-y-1">
                {/* Import with hover submenu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowImportSubmenu(true)}
                  onMouseLeave={() => setShowImportSubmenu(false)}
                >
                  <button className="w-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF] flex justify-between items-center">
                    Import <span>⮞</span>
                  </button>
                  {showImportSubmenu && (
                    <div className="absolute left-full top-0 ml-2 space-y-1 bg-none space-1 rounded-lg shadow-lg z-20 w-[180px] p-2 duration-500">
                      <Link
                        to="/data-tools/import/individual"
                        className="block py-2 px-4 bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] rounded-full text-[#4d4747] font-bold border border-[#6F00FF]  hover:opacity-90 "
                      >
                        Individual
                      </Link>
                      <Link
                        to="/data-tools/import/batch"
                        className="block py-2 px-4 bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] rounded-full text-[#4d4747] font-bold border border-[#6F00FF] hover:opacity-90"
                      >
                        Batch
                      </Link>
                    </div>
                  )}
                </div>

                {/* Edit */}
                <Link
                  to="/data-tools/edit"
                  className="block w-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF]"
                >
                  Edit
                </Link>

                {/* Delete with hover submenu */}
                <div className="group relative">
                  <button className="w-full bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] py-2 px-4 rounded-full text-[#4d4747] font-bold border border-[#6F00FF] flex justify-between items-center">
                    Delete <span>⮞</span>
                  </button>
                  <div className="hidden group-hover:block absolute left-full top-0 ml-2 space-y-1 bg-none rounded-lg shadow-lg z-20 w-[180px] p-2">
                    <Link
                      to="/data-tools/delete/individual"
                      className="block py-2 px-4 bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] rounded-full text-[#4d4747] font-bold border border-[#6F00FF] hover:opacity-90"
                    >
                      Individual
                    </Link>
                    <Link
                      to="/data-tools/delete/batch"
                      className="block py-2 px-4 bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] rounded-full text-[#4d4747] font-bold border border-[#6F00FF] hover:opacity-90"
                    >
                      Batch
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Admin Profile */}
      <div className="relative z-50 bg-gradient-to-r from-[#BF8DFF] to-[#1482B9] rounded-lg p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-[#6c5ce7] w-8 h-8 rounded-full flex items-center justify-center text-white">
            S
          </div>
          <span className="text-white font-bold">SCE ADMIN</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-white text-black py-1 px-4 rounded-full hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

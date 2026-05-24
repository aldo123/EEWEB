import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Cpu,
  Boxes,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  UserCircle2,
  LogOut,

  FolderKanban,
  ClipboardList,
  AlertTriangle,
  User,
  GitBranch,
  Workflow,
  MapPinned,
  PackageSearch,

} from "lucide-react";

import { supabase }
  from "../supabase/supabase";

import ProjectList
  from "./engineering/ProjectList";

import UserManagement
  from "./configuration/UserManagement";

import SiteManagement
  from "./configuration/SiteManagement";

import LineManagement
  from "./configuration/LineManagement";

import WorkflowManagement
  from "./configuration/WorkflowManagement";

import RequestList
  from "./engineering/RequestList";

export default function Dashboard() {

  const [user, setUser] =
    useState(null);

  const [openEngineering, setOpenEngineering] =
    useState(true);

  const [openSystemConfig,
    setOpenSystemConfig] =
    useState(false);

  const [selectedPage, setSelectedPage] =
    useState("project-list");

  const [openPartsDevice,
    setOpenPartsDevice] =
    useState(false);


  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {

      window.location.href = "/";

      return;

    }

    setUser(JSON.parse(savedUser));

  }, []);

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {

    localStorage.removeItem("user");

    window.location.reload();

  };

  if (!user) {

    return null;

  }

  return (

    <div className="flex h-screen bg-[#020617] text-white overflow-hidden">

      {/* SIDEBAR */}
      <div className="
fixed left-0 top-0
w-[320px]
h-screen
z-50
bg-black/40
border-r border-green-500/10
backdrop-blur-3xl
flex flex-col">

        {/* GLOW */}
        <div className="absolute top-[-120px] left-[-120px]
        w-[260px] h-[260px]
        bg-green-500/10
        blur-[120px]
        rounded-full"></div>

        {/* LOGO */}
        <div className="relative px-8 pt-10 pb-8 border-b border-white/5">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-[26px]
            bg-gradient-to-br from-green-400 to-emerald-600
            flex items-center justify-center
            shadow-[0_0_40px_rgba(34,197,94,.45)]">

              <Cpu className="text-white w-8 h-8" />

            </div>

            <div>

              <h1 className="text-3xl font-black tracking-tight">

                WIK BT

              </h1>

              <p className="text-green-400 text-sm tracking-[3px] mt-1">

                TPM SYSTEM

              </p>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}
        <div className="flex-1 p-5 space-y-3 overflow-y-auto">

          {/* DATA DASHBOARD */}
          <button
            className="group relative w-full h-[72px]
            rounded-3xl
            border border-white/5
            bg-white/[0.03]
            hover:bg-green-500/10
            hover:border-green-500/20
            transition-all duration-300
            px-6 flex items-center justify-between"
          >

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-2xl
              bg-black/30 border border-white/5
              flex items-center justify-center
              text-green-400">

                <LayoutDashboard size={20} />

              </div>

              <div className="text-left">

                <p className="font-semibold text-[15px]">

                  Data Dashboard

                </p>

                <p className="text-xs text-slate-500 mt-1">

                  Overview & KPI

                </p>

              </div>

            </div>

          </button>

          {/* ENGINEERING */}
          <div>

            <button
              onClick={() =>
                setOpenEngineering(
                  !openEngineering
                )
              }
              className={`group relative w-full min-h-[72px]
              rounded-3xl
              border
              transition-all duration-300
              px-6 py-4 flex items-center justify-between

              ${openEngineering
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-white/[0.03] border-white/5"
                }`}
            >

              <div className="flex items-center gap-5">

                <div className="w-12 h-12 rounded-2xl
                bg-black/30 border border-white/5
                flex items-center justify-center
                text-green-400">

                  <Cpu size={20} />

                </div>

                <div className="text-left">

                  <p className="font-semibold text-[15px]">

                    Engineering Management

                  </p>

                  <p className="text-xs text-slate-500 mt-1">

                    Engineering Module

                  </p>

                </div>

              </div>

              <ChevronDown
                size={20}
                className={`transition-all duration-300
                ${openEngineering
                    ? "rotate-180 text-green-400"
                    : "text-slate-500"
                  }`}
              />

            </button>

            {/* SUBMENU */}
            <div
              className={`overflow-hidden transition-all duration-500
              ${openEngineering
                  ? "max-h-[500px] mt-4"
                  : "max-h-0"
                }`}
            >

              <div className="ml-6 pl-6 border-l border-green-500/20 space-y-3">

                {/* PROJECT LIST */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "project-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage === "project-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <FolderKanban
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Project List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Project Monitoring

                    </p>

                  </div>

                </button>

                {/* REQUEST LIST */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "request-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage === "request-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <ClipboardList
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Request List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Request Tracking

                    </p>

                  </div>

                </button>

                {/* OPEN LIST */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "open-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage === "open-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <AlertTriangle
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Open List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Delay Monitoring

                    </p>

                  </div>

                </button>

                {/* ASSETS LIST */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "assets-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage === "assets-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <PackageSearch
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Assets List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Equipment & Asset Data

                    </p>

                  </div>

                </button>

              </div>

            </div>

          </div>

          {/* PARTS & DEVICE */}
          <div>

            <button
              onClick={() =>
                setOpenPartsDevice(
                  !openPartsDevice
                )
              }
              className={`group relative w-full min-h-[72px]
              rounded-3xl
              border
              transition-all duration-300
              px-6 py-4 flex items-center justify-between

              ${openPartsDevice
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-white/[0.03] border-white/5"
                }`}
            >

              <div className="flex items-center gap-5">

                <div className="w-12 h-12 rounded-2xl
                bg-black/30 border border-white/5
                flex items-center justify-center
                text-green-400">

                  <Boxes size={20} />

                </div>

                <div className="text-left">

                  <p className="font-semibold text-[15px]">

                    Parts & Device Management

                  </p>

                  <p className="text-xs text-slate-500 mt-1">

                    Inventory System

                  </p>

                </div>

              </div>

              <ChevronDown
                size={20}
                className={`transition-all duration-300
                ${openPartsDevice
                    ? "rotate-180 text-green-400"
                    : "text-slate-500"
                  }`}
              />

            </button>

            {/* SUBMENU */}
            <div
              className={`overflow-hidden transition-all duration-500
              ${openPartsDevice
                  ? "max-h-[900px] mt-4"
                  : "max-h-0"
                }`}
            >

              <div className="ml-6 pl-6 border-l border-green-500/20 space-y-3">

                {/* PART LIST */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "part-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "part-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <PackageSearch
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Part List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Spare part inventory

                    </p>

                  </div>

                </button>

                {/* IN OUT STOCK */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "in-out-stock"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "in-out-stock"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <ClipboardList
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      In/Out Stock

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Inventory movement

                    </p>

                  </div>

                </button>

                {/* STORAGE */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "storage"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "storage"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <Boxes
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Storage

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Rack & storage area

                    </p>

                  </div>

                </button>

                {/* EQUIPMENT */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "equipment-list"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "equipment-list"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <Cpu
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Equipment List

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Machine & device data

                    </p>

                  </div>

                </button>

                {/* CALIBRATION */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "calibration-plan"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "calibration-plan"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <Settings
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Calibration Plan

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Calibration schedule

                    </p>

                  </div>

                </button>

                {/* MAINTENANCE */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "maintenance-plan"
                    )
                  }
                  className={`group w-full h-[60px]
                  rounded-2xl
                  border
                  transition-all
                  px-5 flex items-center gap-4

                  ${selectedPage ===
                      "maintenance-plan"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <Workflow
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Maintenance Plan

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      PM & maintenance planning

                    </p>

                  </div>

                </button>

              </div>

            </div>

          </div>

          {/* ANALYTICAL */}
          <button
            className="group relative w-full h-[72px]
            rounded-3xl
            border border-white/5
            bg-white/[0.03]
            hover:bg-green-500/10
            hover:border-green-500/20
            transition-all duration-300
            px-6 flex items-center justify-between"
          >

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-2xl
              bg-black/30 border border-white/5
              flex items-center justify-center
              text-green-400">

                <BarChart3 size={20} />

              </div>

              <div className="text-left">

                <p className="font-semibold text-[15px]">

                  Analytical Tools

                </p>

                <p className="text-xs text-slate-500 mt-1">

                  Analytics

                </p>

              </div>

            </div>

          </button>


          {/* SYSTEM CONFIG */}
          <div>

            <button
              onClick={() =>
                setOpenSystemConfig(
                  !openSystemConfig
                )
              }
              className={`group relative w-full min-h-[72px]
    rounded-3xl
    border
    transition-all duration-300
    px-6 py-4 flex items-center justify-between

    ${openSystemConfig
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-white/[0.03] border-white/5"
                }`}
            >

              <div className="flex items-center gap-5">

                <div className="w-12 h-12 rounded-2xl
      bg-black/30 border border-white/5
      flex items-center justify-center
      text-green-400">

                  <Settings size={20} />

                </div>

                <div className="text-left">

                  <p className="font-semibold text-[15px]">

                    System Configuration

                  </p>

                  <p className="text-xs text-slate-500 mt-1">

                    Enterprise Settings

                  </p>

                </div>

              </div>

              <ChevronDown
                size={20}
                className={`transition-all duration-300
      ${openSystemConfig
                    ? "rotate-180 text-green-400"
                    : "text-slate-500"
                  }`}
              />

            </button>

            {/* SUBMENU */}
            <div
              className={`overflow-hidden transition-all duration-500
    ${openSystemConfig
                  ? "max-h-[500px] mt-4"
                  : "max-h-0"
                }`}
            >

              <div className="ml-6 pl-6 border-l border-green-500/20 space-y-3">

                {/* USER MANAGEMENT */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "user-management"
                    )
                  }
                  className={`group w-full h-[60px]
        rounded-2xl
        border
        transition-all
        px-5 flex items-center gap-4

        ${selectedPage ===
                      "user-management"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <User
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      User & Role Management

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      User access control

                    </p>

                  </div>

                </button>

                {/* SITE MANAGEMENT */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "site-management"
                    )
                  }
                  className={`group w-full h-[60px]
        rounded-2xl
        border
        transition-all
        px-5 flex items-center gap-4

        ${selectedPage ===
                      "site-management"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <MapPinned
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Site Management

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Factory site setup

                    </p>

                  </div>

                </button>

                {/* LINE MANAGEMENT */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "line-management"
                    )
                  }
                  className={`group w-full h-[60px]
        rounded-2xl
        border
        transition-all
        px-5 flex items-center gap-4

        ${selectedPage ===
                      "line-management"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <GitBranch
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Line Management

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Production line setup

                    </p>

                  </div>

                </button>

                {/* WORKFLOW */}
                <button
                  onClick={() =>
                    setSelectedPage(
                      "workflow-management"
                    )
                  }
                  className={`group w-full h-[60px]
        rounded-2xl
        border
        transition-all
        px-5 flex items-center gap-4

        ${selectedPage ===
                      "workflow-management"
                      ? "bg-green-500/15 border-green-500/30"
                      : "bg-white/[0.03] border-white/5 hover:bg-green-500/10 hover:border-green-500/20"
                    }`}
                >

                  <Workflow
                    size={18}
                    className="text-green-400"
                  />

                  <div className="text-left">

                    <p className="font-medium text-sm">

                      Workflow Management

                    </p>

                    <p className="text-xs text-slate-500 mt-1">

                      Automation flow setup

                    </p>

                  </div>

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/5">

          <div className="rounded-3xl border border-green-500/10 bg-white/[0.03] p-5">

            <div className="flex items-center gap-4">

              <UserCircle2 className="text-green-400 w-12 h-12" />

              <div>

                <p className="font-bold">

                  {user.name}

                </p>

                <p className="text-sm text-slate-500">

                  {user.role}

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div className=" flex-1 ml-[320px] flex flex-col h-screen overflow-hidden">

        {/* TOP NAVBAR */}
        <div className="
        sticky top-0 z-40
        h-[90px]
        border-b border-green-500/10
        bg-[#020617]/85
        backdrop-blur-3xl
        px-10
        flex items-center justify-between">

          <div>

          </div>

          <div className="flex items-center gap-5">

            {/* SEARCH */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search system..."
                className="w-[320px] h-14 rounded-2xl
                bg-white/[0.04]
                border border-white/5
                pl-14 pr-5
                text-white
                placeholder:text-slate-500
                outline-none"
              />

            </div>

            {/* NOTIF */}
            <button
              className="relative w-14 h-14 rounded-2xl
              bg-white/[0.04]
              border border-white/5
              flex items-center justify-center"
            >

              <Bell className="text-green-400" />

            </button>

            {/* USER */}
            <div className="flex items-center gap-4">

              <div className="text-right">

                <p className="font-bold">
                  {user.name}
                </p>

                <p className="text-sm text-slate-500">
                  {user.role}
                </p>

              </div>

              <div className="w-14 h-14 rounded-2xl
              bg-gradient-to-br from-green-400 to-emerald-600
              flex items-center justify-center
              font-black text-xl">

                {user.name?.charAt(0)}

              </div>

            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="w-14 h-14 rounded-2xl
              bg-red-500/10
              border border-red-500/20
              flex items-center justify-center"
            >

              <LogOut className="text-red-400" />

            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="relative flex-1 overflow-auto p-8">

          {/* GRID */}
          <div className="absolute inset-0 opacity-[0.04]
          bg-[linear-gradient(to_right,#22c55e_1px,transparent_1px),
          linear-gradient(to_bottom,#22c55e_1px,transparent_1px)]
          bg-[size:70px_70px]"></div>

          <div className="relative z-10">


            {/* DYNAMIC PAGE */}
            {selectedPage ===
              "project-list" && (
                <ProjectList />
              )}

            {selectedPage ===
              "request-list" && (
                <RequestList />
              )}

            {selectedPage ===
              "open-list" && (

                <div className="h-[500px]
              rounded-[36px]
              border border-white/5
              bg-white/[0.03]
              backdrop-blur-2xl
              flex items-center justify-center">

                  <div className="text-center">

                    <h1 className="text-5xl font-black text-white">

                      Open List

                    </h1>

                    <p className="text-slate-500 mt-4">

                      Module coming soon

                    </p>

                  </div>

                </div>

              )}

            {selectedPage ===
              "assets-list" && (

                <div className="h-[500px] rounded-[36px] border border-white/5 bg-white/[0.03] backdrop-blur-2xl flex items-center justify-center">

                  <div className="text-center">

                    <h1 className="text-5xl font-black text-white">

                      Assets List

                    </h1>

                    <p className="text-slate-500 mt-4">

                      Module coming soon

                    </p>

                  </div>

                </div>

              )}

            {selectedPage ===
              "user-management" && (
                <UserManagement />
              )}

            {selectedPage ===
              "site-management" && (
                <SiteManagement />
              )}

            {selectedPage ===
              "line-management" && (
                <LineManagement />
              )}

            {selectedPage ===
              "workflow-management" && (
                <WorkflowManagement />
              )}

              {/* PART LIST */}
              {selectedPage ===
                "part-list" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        Part List

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

              {/* IN OUT */}
              {selectedPage ===
                "in-out-stock" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        In / Out Stock

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

              {/* STORAGE */}
              {selectedPage ===
                "storage" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        Storage

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

              {/* EQUIPMENT */}
              {selectedPage ===
                "equipment-list" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        Equipment List

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

              {/* CALIBRATION */}
              {selectedPage ===
                "calibration-plan" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        Calibration Plan

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

              {/* MAINTENANCE */}
              {selectedPage ===
                "maintenance-plan" && (

                  <div className="h-[500px]
                  rounded-[36px]
                  border border-white/5
                  bg-white/[0.03]
                  backdrop-blur-2xl
                  flex items-center justify-center">

                    <div className="text-center">

                      <h1 className="text-5xl font-black text-white">

                        Maintenance Plan

                      </h1>

                      <p className="text-slate-500 mt-4">

                        Module coming soon

                      </p>

                    </div>

                  </div>

              )}

          </div>

        </div>

      </div>

    </div>

  );

}
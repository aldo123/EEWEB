import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Papa from "papaparse";


import {
  Search,
  Plus,
  Upload,
  Download,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function MaintenancePlan() {

  const [pmData,
    setPmData] = useState([]);

  const [search,
    setSearch] = useState("");

  const [weekFilter,
    setWeekFilter] =
    useState("All");

  const [machineFilter,
    setMachineFilter] =
    useState("All");

  const [responsibleFilter,
    setResponsibleFilter] =
    useState("All");

  const [statusFilter,
    setStatusFilter] =
    useState("All");

  // =========================
  // LOAD CSV
  // =========================
  useEffect(() => {

    fetch("/preventive-maintenance_rows (2).csv")
      .then((res) => res.text())
      .then((csvText) => {

        Papa.parse(csvText, {

          header: true,

          skipEmptyLines: true,

          complete: (result) => {

            setPmData(
              result.data || []
            );

          },

        });

      });

  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredData =
    useMemo(() => {

      return pmData.filter(
        (item) => {

          const matchSearch =

            (
              item["Machine #"] || ""
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            (
              item["Equipment Type"] ||
              ""
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            (
              item["Responsible"] ||
              ""
            )
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchWeek =

            weekFilter === "All" ||

            String(item["Week"]) ===
            weekFilter;

          const matchMachine =

            machineFilter === "All" ||

            item["Machine #"] ===
            machineFilter;

          const matchResponsible =

            responsibleFilter ===
              "All" ||

            item["Responsible"] ===
            responsibleFilter;

          const matchStatus =

            statusFilter === "All" ||

            item["Status"] ===
            statusFilter;

          return (
            matchSearch &&
            matchWeek &&
            matchMachine &&
            matchResponsible &&
            matchStatus
          );

        }
      );

    }, [
      pmData,
      search,
      weekFilter,
      machineFilter,
      responsibleFilter,
      statusFilter,
    ]);

  // =========================
  // KPI
  // =========================
  const overdueCount =
    filteredData.filter(
      (x) =>
        x.Status === "Overdue"
    ).length;

  const ongoingCount =
    filteredData.filter(
      (x) =>
        x.Status === "Ongoing"
    ).length;

  const doneCount =
    filteredData.filter(
      (x) =>
        x.Status === "Done"
    ).length;

  const rejectCount =
    filteredData.filter(
      (x) =>
        x.Status === "Reject"
    ).length;

  // =========================
  // UNIQUE
  // =========================
  const weeks = [
    "All",
    ...new Set(
      pmData.map(
        (x) => x["Week"]
      )
    ),
  ];

  const machines = [
    "All",
    ...new Set(
      pmData.map(
        (x) => x["Machine #"]
      )
    ),
  ];

  const responsibles = [
    "All",
    ...new Set(
      pmData.map(
        (x) => x["Responsible"]
      )
    ),
  ];

  return (

    <div className="
    space-y-6
    pb-10">

      {/* ========================= */}
      {/* TOP SECTION */}
      {/* ========================= */}

      <div className="
      grid grid-cols-12
      gap-5">

        {/* TECH PERFORMANCE */}
        <div className="
        col-span-5
        rounded-[32px]
        border border-emerald-500/10
        bg-gradient-to-br
        from-[#071b11]
        to-[#08131f]
        p-5">

          <div className="
          flex items-center gap-3
          mb-5">

            <BarChart3
              className="
              text-emerald-400"
            />

            <h1 className="
            text-lg font-bold
            text-white">

              Technician Performance

            </h1>

          </div>

          <div className="
          space-y-3">

            {[
              "Aulia",
              "Panggih",
              "Tri",
              "Alif",
              "Faiz",
              "Widhi",
              "Budi",
            ].map(
              (
                tech,
                index
              ) => (

                <div
                  key={index}
                  className="
                  flex items-center gap-4">

                  <div className="
                  w-[70px]
                  text-sm text-slate-300">

                    {tech}

                  </div>

                  <div className="
                  flex-1
                  h-3 rounded-full
                  bg-white/5
                  overflow-hidden">

                    <div
                      className="
                      h-full rounded-full
                      bg-gradient-to-r
                      from-emerald-400
                      to-yellow-400"
                      style={{
                        width: `${90 - index}%`,
                      }}
                    />

                  </div>

                  <div className="
                  text-sm font-bold
                  text-emerald-300">

                    {90 - index}%

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* MONTH CHART */}
        <div className="
        col-span-4
        rounded-[32px]
        border border-cyan-500/10
        bg-gradient-to-br
        from-[#081421]
        to-[#071b11]
        p-5">

          <div className="
          flex items-center gap-3
          mb-6">

            <ShieldCheck
              className="
              text-cyan-400"
            />

            <h1 className="
            text-lg font-bold">

              % Execution by Month

            </h1>

          </div>

          <div className="
          flex items-end
          justify-between
          h-[170px]">

            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
            ].map(
              (
                month,
                index
              ) => (

                <div
                  key={index}
                  className="
                  flex flex-col
                  items-center gap-2">

                  <div
                    className="
                    w-10 rounded-xl
                    bg-gradient-to-t
                    from-cyan-500
                    to-emerald-400"
                    style={{
                      height:
                        index < 4
                          ? "110px"
                          : "70px",
                    }}
                  />

                  <span className="
                  text-[11px]
                  text-slate-400">

                    {month}

                  </span>

                </div>

              )
            )}

          </div>

        </div>

        {/* SUMMARY */}
        <div className="
        col-span-3
        grid grid-cols-2 gap-4">

          {/* OVERDUE */}
          <div className="
          rounded-[24px]
          border border-red-500/20
          bg-[#1a0d0d]
          p-5">

            <div className="
            flex items-center gap-2
            text-red-400
            text-sm">

              <AlertTriangle size={16} />

              PM Overdue

            </div>

            <h1 className="
            text-4xl font-black
            mt-5">

              {overdueCount}

            </h1>

          </div>

          {/* ONGOING */}
          <div className="
          rounded-[24px]
          border border-yellow-500/20
          bg-[#1a170b]
          p-5">

            <div className="
            flex items-center gap-2
            text-yellow-400
            text-sm">

              <Clock3 size={16} />

              PM Ongoing

            </div>

            <h1 className="
            text-4xl font-black
            mt-5">

              {ongoingCount}

            </h1>

          </div>

          {/* DONE */}
          <div className="
          rounded-[24px]
          border border-emerald-500/20
          bg-[#071b11]
          p-5">

            <div className="
            flex items-center gap-2
            text-emerald-400
            text-sm">

              <CheckCircle2 size={16} />

              PM Done

            </div>

            <h1 className="
            text-4xl font-black
            mt-5">

              {doneCount}

            </h1>

          </div>

          {/* REJECT */}
          <div className="
          rounded-[24px]
          border border-purple-500/20
          bg-[#1a1020]
          p-5">

            <div className="
            flex items-center gap-2
            text-purple-400
            text-sm">

              <XCircle size={16} />

              PM Reject

            </div>

            <h1 className="
            text-4xl font-black
            mt-5">

              {rejectCount}

            </h1>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* MAIN TABLE */}
      {/* ========================= */}

      <div className="
      rounded-[34px]
      border border-cyan-500/10
      bg-[#08111f]
      overflow-hidden">

        {/* HEADER */}
        <div className="
        px-7 py-6
        border-b border-white/5
        flex items-center justify-between">

          <div className="
          flex items-center gap-4">

            <div className="
            w-14 h-14 rounded-2xl
            bg-emerald-500/15
            flex items-center justify-center">

              <Wrench
                className="
                text-emerald-400"
              />

            </div>

            <div>

              <h1 className="
              text-3xl font-black">

                Preventive Maintenance

              </h1>

              <p className="
              text-slate-400 mt-1">

                Equipment maintenance management

              </p>

            </div>

          </div>

          {/* ACTION */}
          <div className="
          flex items-center gap-3">

            <button className="
            h-12 px-5 rounded-xl
            bg-emerald-500
            flex items-center gap-2
            font-semibold">

              <Plus size={16} />

              Add

            </button>

            <button className="
            h-12 px-5 rounded-xl
            border border-white/10
            bg-white/[0.03]
            flex items-center gap-2">

              <Download size={16} />

              Export

            </button>

            <button className="
            h-12 px-5 rounded-xl
            border border-white/10
            bg-white/[0.03]
            flex items-center gap-2">

              <Upload size={16} />

              Import

            </button>

          </div>

        </div>

        {/* FILTER */}
        <div className="
        p-6
        border-b border-white/5
        grid grid-cols-5 gap-4">

          {/* SEARCH */}
          <div className="
          col-span-2
          h-14 rounded-2xl
          border border-white/5
          bg-white/[0.03]
          px-5
          flex items-center gap-3">

            <Search
              size={18}
              className="
              text-slate-500"
            />

            <input
              type="text"
              placeholder="Search maintenance..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
              bg-transparent
              outline-none
              w-full
              text-white"
            />

          </div>

          {/* WEEK */}
          <select
            value={weekFilter}
            onChange={(e) =>
              setWeekFilter(
                e.target.value
              )
            }
            className="
            h-14 rounded-2xl
            border border-white/5
            bg-white/[0.03]
            px-4
            outline-none">

            {weeks.map((week) => (

              <option
                key={week}
                value={week}>

                {week}

              </option>

            ))}

          </select>

          {/* MACHINE */}
          <select
            value={machineFilter}
            onChange={(e) =>
              setMachineFilter(
                e.target.value
              )
            }
            className="
            h-14 rounded-2xl
            border border-white/5
            bg-white/[0.03]
            px-4
            outline-none">

            {machines.map((m) => (

              <option
                key={m}
                value={m}>

                {m}

              </option>

            ))}

          </select>

          {/* RESPONSIBLE */}
          <select
            value={
              responsibleFilter
            }
            onChange={(e) =>
              setResponsibleFilter(
                e.target.value
              )
            }
            className="
            h-14 rounded-2xl
            border border-white/5
            bg-white/[0.03]
            px-4
            outline-none">

            {responsibles.map((r) => (

              <option
                key={r}
                value={r}>

                {r}

              </option>

            ))}

          </select>

        </div>

        {/* TABLE */}
        <div className="
        overflow-auto">

          <table className="
          w-full text-sm">

            {/* HEADER */}
            <thead className="
            bg-cyan-500/[0.04]
            text-cyan-300">

              <tr>

                <th className="
                px-6 py-5 text-left">

                  No

                </th>

                <th className="
                px-6 py-5 text-left">

                  Equipment

                </th>

                <th className="
                px-6 py-5 text-left">

                  Machine

                </th>

                <th className="
                px-6 py-5 text-left">

                  Item

                </th>

                <th className="
                px-6 py-5 text-left">

                  Criteria

                </th>

                <th className="
                px-6 py-5 text-left">

                  Responsible

                </th>

                <th className="
                px-6 py-5 text-left">

                  Status

                </th>

                <th className="
                px-6 py-5 text-left">

                  Week

                </th>

                <th className="
                px-6 py-5 text-left">

                  Month

                </th>

                <th className="
                px-6 py-5 text-left">

                  Action

                </th>

              </tr>

            </thead>

            {/* BODY */}
            <tbody>

              {filteredData.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={index}
                    className="
                    border-b border-white/5
                    hover:bg-cyan-500/[0.03]
                    transition-all">

                    <td className="
                    px-6 py-5">

                      {index + 1}

                    </td>

                    <td className="
                    px-6 py-5">

                      {
                        item[
                          "Equipment Type"
                        ]
                      }

                    </td>

                    <td className="
                    px-6 py-5">

                      {
                        item[
                          "Machine #"
                        ]
                      }

                    </td>

                    <td className="
                    px-6 py-5">

                      {item["Item"]}

                    </td>

                    <td className="
                    px-6 py-5">

                      {
                        item[
                          "Criteria"
                        ]
                      }

                    </td>

                    <td className="
                    px-6 py-5">

                      {
                        item[
                          "Responsible"
                        ]
                      }

                    </td>

                    <td className="
                    px-6 py-5">

                      <span className={`
                      px-3 py-1 rounded-xl
                      text-xs font-bold

                      ${item["Status"] === "Done"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-yellow-500/15 text-yellow-400"
                        }
                      `}>

                        {
                          item[
                            "Status"
                          ]
                        }

                      </span>

                    </td>

                    <td className="
                    px-6 py-5">

                      {item["Week"]}

                    </td>

                    <td className="
                    px-6 py-5">

                      {item["Month"]}

                    </td>

                    <td className="
                    px-6 py-5">

                      <button className="
                      w-10 h-10 rounded-xl
                      bg-cyan-500/10
                      border border-cyan-500/20
                      flex items-center justify-center">

                        <Wrench
                          size={16}
                          className="
                          text-cyan-400"
                        />

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}
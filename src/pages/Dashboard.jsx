import {
  useState,
  useEffect,
} from "react";

import {
  db,
  ref,
  push,
  onValue,
  update,
} from "../firebase/firebase";

export default function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [filter, setFilter] =
    useState("Total");

  const [overviewType, setOverviewType] =
    useState("All");

  const [taskView, setTaskView] =
    useState("My Task");

  const [page, setPage] =
    useState("Tasks");

  const [showModal, setShowModal] =
    useState(false);

  const [tasks, setTasks] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [showTaskModal, setShowTaskModal] =
    useState(false);

  const [taskReport, setTaskReport] =
    useState({
      rca: "",
      action: "",
    });

  const [taskPhotos, setTaskPhotos] =
    useState({
      before: "",
      after: "",
    });

  const [reviseTask, setReviseTask] =
    useState({
      machine: "",
      issue: "",
      assignTo: "",
      targetDate: "",
      targetTime: "",
    });

  const [newTask, setNewTask] =
    useState({
      type: "DT",
      machine: "",
      issue: "",
      assignTo: "",
      targetDate: "",
      targetTime: "",
      status: "Open",
    });

  // LOAD TASKS
  useEffect(() => {

    const taskRef = ref(
      db,
      "task-mobile"
    );

    onValue(taskRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        const array = Object.keys(data).map(
          (key) => ({
            id: key,
            ...data[key],
          })
        );

        setTasks(array);

      } else {

        setTasks([]);

      }

    });

  }, []);

  // LOAD USERS
  useEffect(() => {

    const userRef = ref(
      db,
      "users"
    );

    onValue(userRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        const array = Object.keys(data).map(
          (key) => ({
            id: key,
            ...data[key],
          })
        );

        setUsers(array);

      } else {

        setUsers([]);

      }

    });

  }, []);

  // UNIQUE ROLES
  const uniqueRoles = [
    ...new Set(
      users.map(
        (user) => user.role
      )
    ),
  ];

  // FILTER MY TASK / ALL TASK
  const baseTasks =
    taskView === "My Task"
      ? tasks.filter((task) => {

        // TASK CREATED BY ME
        if (
          task.createdBy ===
          user.name
        ) {
          return true;
        }

        // DT BASED ROLE
        if (task.type === "DT") {

          return (
            task.assignTo ===
            user.role
          );

        }

        // PROJECT / TPM BASED USER
        return (
          task.assignTo ===
          user.name
        );

      })
      : tasks;

  // FILTER OVERVIEW
  const filteredOverviewTasks =
    overviewType === "All"
      ? baseTasks
      : baseTasks.filter(
        (task) =>
          task.type === overviewType
      );

  // FILTER TASK LIST
  const filteredTasks =
    filter === "Total"
      ? filteredOverviewTasks
      : filteredOverviewTasks.filter(
        (task) =>

          filter === "Progress"
            ? (
              task.status === "Progress" ||
              task.status === "Waiting Approval"
            )

            : task.status === filter
      );
  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem(
      "user"
    );

    window.location.href = "/";

  };

  // OPEN TASK
  const handleOpenTask = (task) => {

    setSelectedTask(task);

    setTaskReport({
      rca: task.rca || "",
      action: task.action || "",
    });

    setTaskPhotos({
      before:
        task.beforePhoto || "",

      after:
        task.afterPhoto || "",
    });

    setReviseTask({
      machine:
        task.machine || "",

      issue:
        task.issue || "",

      assignTo:
        task.assignTo || "",

      targetDate:
        task.targetDate || "",

      targetTime:
        task.targetTime || "",
    });

    setShowTaskModal(true);

  };

  // ACCEPT TASK
  const handleAcceptTask = async () => {

    try {

      await update(
        ref(
          db,
          `task-mobile/${selectedTask.id}`
        ),
        {
          status: "Progress",

          acceptedBy: user.name,

          acceptedAt:
            new Date().toLocaleString(),
        }
      );

      // CLOSE MODAL
      setShowTaskModal(false);

    } catch (error) {

      console.log(error);

      alert("Failed accept task");

    }

  };

  // REVISE PROJECT / TPM
  const handleReviseTask = async () => {

    try {

      await update(
        ref(
          db,
          `task-mobile/${selectedTask.id}`
        ),
        {
          machine:
            reviseTask.machine,

          issue:
            reviseTask.issue,

          assignTo:
            reviseTask.assignTo,

          targetDate:
            reviseTask.targetDate,

          targetTime:
            reviseTask.targetTime,

          status: "Open",

          acceptedBy: "",

          acceptedAt: "",
        }
      );

      setShowTaskModal(false);

    } catch (error) {

      console.log(error);

      alert("Failed revise task");

    }

  };

  // CONVERT IMAGE
  const handleImageUpload = (
    e,
    type
  ) => {

    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onloadend = () => {

      setTaskPhotos(
        (prev) => ({
          ...prev,
          [type]:
            reader.result,
        })
      );

    };

    reader.readAsDataURL(file);

  };

  // SUBMIT TASK
  const handleSubmitTask = async () => {

    if (
      selectedTask.type === "DT" &&
      (
        !taskReport.rca ||
        !taskReport.action
      )
    ) {
      alert("Complete RCA & Action");
      return;
    }

    try {

      await update(
        ref(
          db,
          `task-mobile/${selectedTask.id}`
        ),
        {
          rca: taskReport.rca,

          action: taskReport.action,

          closedBy:
            selectedTask.closedBy ||
            user.name,

          closedAt:
            selectedTask.closedAt ||
            new Date().toLocaleString(),

          status:
            (
              selectedTask.type ===
              "Project" ||

              selectedTask.type ===
              "TPM"
            )
              ? "Waiting Approval"
              : "Done",

          beforePhoto:
            taskPhotos.before,

          afterPhoto:
            taskPhotos.after,
        }
      );

      setShowTaskModal(false);

    } catch (error) {

      console.log(error);

      alert("Failed submit task");

    }

  };
  // APPROVE TASK
  const handleApproveTask =
    async () => {

      try {

        await update(
          ref(
            db,
            `task-mobile/${selectedTask.id}`
          ),
          {
            status: "Done",

            approvedBy:
              user.name,

            approvedAt:
              new Date().toLocaleString(),
          }
        );

        setShowTaskModal(false);

      } catch (error) {

        console.log(error);

        alert("Failed approve");

      }

    };
  // ADD TASK
  const handleAddTask = async () => {

    if (
      !newTask.machine ||
      !newTask.issue ||
      !newTask.assignTo
    ) {
      alert("Complete all fields");
      return;
    }

    const now = new Date();

    const taskData = {
      ...newTask,

      createdBy: user.name,

      createdAt:
        now.toLocaleDateString() +
        " " +
        now.toLocaleTimeString(),
    };

    try {

      await push(
        ref(db, "task-mobile"),
        taskData
      );

      setNewTask({
        type: "DT",
        machine: "",
        issue: "",
        assignTo: "",
        targetDate: "",
        targetTime: "",
        status: "Open",
      });

      setShowModal(false);

    } catch (error) {

      console.log(error);

      alert("Failed save task");

    }

  };

  // CAN ACCEPT
  const canAccept =
    selectedTask &&
    (
      (
        selectedTask.type === "DT" &&
        selectedTask.assignTo ===
        user.role
      ) ||

      (
        (
          selectedTask.type ===
          "Project" ||

          selectedTask.type ===
          "TPM"
        ) &&

        selectedTask.assignTo ===
        user.name
      )
    );
  // CAN REVISE ASSIGN
  const canReviseAssign =
    selectedTask &&
    (
      selectedTask.type ===
      "Project" ||

      selectedTask.type ===
      "TPM"
    ) &&
    selectedTask.createdBy ===
    user.name;

  const canRevise =
    selectedTask &&
    (
      selectedTask.createdBy ===
      user.name ||

      selectedTask.closedBy ===
      user.name
    );
  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 flex justify-center p-4">

      <div className="w-full max-w-[430px] bg-white min-h-screen rounded-[42px] overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,.18)] relative">

        {/* HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#14532d] via-[#166534] to-[#22c55e] px-6 pt-7 pb-10 text-white rounded-b-[40px] shadow-[0_10px_30px_rgba(22,101,52,.35)]">

          {/* LIGHT EFFECT */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>

          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20"></div>

          {/* HEADER CONTENT */}
          <div className="relative z-10 flex items-start justify-between">

            <div>

              <h1 className="text-5xl tracking-tight font-black tracking-tight leading-none">
                WIK-TPM
              </h1>

              <p className="text-white/70 text-sm mt-2 font-medium">
                Enterprise Maintenance System
              </p>

            </div>

            {/* FACTORY ICON */}
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">

              <span className="text-2xl">
                🏭
              </span>

            </div>

          </div>

        </div>

        {/* USER CARD */}
        <div className="px-5 -mt-5">

          <div className="bg-white rounded-[30px] p-5 shadow-[0_10px_30px_rgba(15,23,42,.12)] mx-5 -mt-5 relative z-20">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#166534] to-[#22c55e] text-white text-xl font-black flex items-center justify-center shadow-lg">

                {user.name.charAt(0)}

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  {user.name}
                </h2>

                <p className="text-slate-500 text-sm">
                  {user.role}
                </p>

                <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full mt-2">

                  <div className="w-2 h-2 rounded-full bg-green-500"></div>

                  Online

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* HOME PAGE */}
        {page === "Home" && (

          <div className="px-5 mt-6 pb-28">

            <h3 className="text-xl font-black text-slate-800 mb-5">
              Navigation
            </h3>

            <div className="space-y-4">

              {[
                "DT Dashboard",
                "History",
                "Task Record",
                "System",
                "Analytics",
              ].map((item) => (

                <button
                  key={item}
                  className="w-full bg-white rounded-3xl p-5 shadow-lg flex items-center justify-between active:scale-[0.98] transition"
                >

                  <div className="font-bold text-slate-700">
                    {item}
                  </div>

                  <div className="text-slate-400 text-xl">
                    ›
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* TASK PAGE */}
        {page === "Tasks" && (

          <>
            {/* OVERVIEW */}
            <div className="px-5 mt-6">

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-bold text-lg text-slate-800">
                  Today Overview
                </h3>

                <div className="flex bg-white rounded-2xl p-1 shadow">

                  <button
                    onClick={() =>
                      setTaskView("My Task")
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${taskView === "My Task"
                      ? "bg-[#166534] text-white"
                      : "text-slate-500"
                      }`}
                  >
                    My Task
                  </button>

                  <button
                    onClick={() =>
                      setTaskView("All Task")
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${taskView === "All Task"
                      ? "bg-[#166534] text-white"
                      : "text-slate-500"
                      }`}
                  >
                    All Task
                  </button>

                </div>

              </div>

              {/* FILTER */}
              <div className="flex gap-3 mb-5 overflow-x-auto pb-1">

                {["All", "DT", "Project", "TPM"].map(
                  (item) => (

                    <button
                      key={item}
                      onClick={() =>
                        setOverviewType(item)
                      }
                      className={`px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                        overviewType === item
                          ? "bg-gradient-to-br from-[#166534] to-[#22c55e] text-white border-green-700 shadow-[0_6px_18px_rgba(22,101,52,.25)] scale-[1.02]"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

              {/* OVERVIEW CARD */}
              <div className="grid grid-cols-2 gap-4">

                <Card
                  title="Total"
                  value={
                    filteredOverviewTasks.length
                  }
                  color="blue"
                  active={filter === "Total"}
                  onClick={() =>
                    setFilter("Total")
                  }
                />

                <Card
                  title="Open"
                  value={
                    filteredOverviewTasks.filter(
                      (t) =>
                        t.status === "Open"
                    ).length
                  }
                  color="blue"
                  active={
                    filter === "Open"
                  }
                  onClick={() =>
                    setFilter("Open")
                  }
                />

                <Card
                  title="Progress"
                  value={
                    filteredOverviewTasks.filter(
                      (t) =>
                        t.status === "Progress" || t.status === "Waiting Approval"
                    ).length
                  }
                  color="orange"
                  active={
                    filter === "Progress"
                  }
                  onClick={() =>
                    setFilter("Progress")
                  }
                />

                <Card
                  title="Done"
                  value={
                    filteredOverviewTasks.filter(
                      (t) =>
                        t.status === "Done"
                    ).length
                  }
                  color="green"
                  active={
                    filter === "Done"
                  }
                  onClick={() =>
                    setFilter("Done")
                  }
                />

                {overviewType !== "DT" && (

                  <Card
                    title="Delay"
                    value={
                      filteredOverviewTasks.filter(
                        (t) =>
                          t.status === "Delay"
                      ).length
                    }
                    color="red"
                    active={
                      filter === "Delay"
                    }
                    onClick={() =>
                      setFilter("Delay")
                    }
                  />

                )}

                {overviewType !== "Project" &&
                  overviewType !== "TPM" && (

                    <Card
                      title="Urgent"
                      value={
                        filteredOverviewTasks.filter(
                          (t) =>
                            t.status === "Urgent"
                        ).length
                      }
                      color="red"
                      active={
                        filter === "Urgent"
                      }
                      onClick={() =>
                        setFilter("Urgent")
                      }
                    />

                  )}

              </div>

            </div>

            {/* TASK LIST */}
            <div className="px-5 mt-8 pb-28">

              <div className="flex items-center justify-between mb-4">

                <h3 className="font-bold text-lg text-slate-800">
                  {filter} Tasks
                </h3>

              </div>

              <div className="space-y-4">

                {filteredTasks.length === 0 && (

                  <div className="text-center text-slate-400 py-10">
                    No Tasks
                  </div>

                )}

                {filteredTasks.map(
                  (task, index) => (

                    <TaskCard
                      key={index}
                      task={task}
                      onClick={() =>
                        handleOpenTask(task)
                      }
                    />

                  )
                )}

              </div>

            </div>

          </>

        )}
        {/* BOTTOM NAV */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-5px_20px_rgba(15,23,42,.06)] p-4">

          <div className="flex items-center justify-around">

            <button
              onClick={() =>
                setPage("Home")
              }
            >
              <NavItem
                icon="🏠"
                label="Home"
                active={page === "Home"}
              />
            </button>

            <button
              onClick={() =>
                setPage("Tasks")
              }
            >
              <NavItem
                icon="📋"
                label="Tasks"
                active={page === "Tasks"}
              />
            </button>

            <button
              onClick={() =>
                setShowModal(true)
              }
              className="w-16 h-16 rounded-full bg-gradient-to-br from-[#166534] to-[#22c55e] text-white text-3xl -mt-10 shadow-[0_10px_30px_rgba(22,101,52,.35)] border-4 border-white active:scale-95 transition-all"
            >
              +
            </button>

            <NavItem
              icon="📊"
              label="Reports"
            />

            <button
              onClick={handleLogout}
            >
              <NavItem
                icon="🚪"
                label="Logout"
              />
            </button>

          </div>

        </div>

        {/* ADD TASK MODAL */}
        {showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">

            <div className="bg-white rounded-3xl p-5 w-full max-w-[420px] max-h-[90vh] overflow-y-auto overflow-x-hidden">

              <h2 className="text-2xl font-bold text-slate-800 mb-5">
                Add Task
              </h2>

              <div className="space-y-4">

                {/* TYPE */}
                <select
                  value={newTask.type}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      type: e.target.value,
                      assignTo: "",
                    })
                  }
                  className="w-full min-w-0 border border-slate-300 rounded-2xl p-4 bg-white"
                >

                  <option value="DT">
                    DT
                  </option>

                  <option value="Project">
                    Project
                  </option>

                  <option value="TPM">
                    TPM
                  </option>

                </select>

                {/* MACHINE */}
                <input
                  type="text"
                  placeholder="Machine"
                  value={newTask.machine}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      machine: e.target.value,
                    })
                  }
                  className="w-full min-w-0 box-border border border-slate-300 rounded-2xl p-4 bg-white"
                />

                {/* ISSUE */}
                <textarea
                  placeholder="Issue"
                  value={newTask.issue}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      issue: e.target.value,
                    })
                  }
                  className="w-full min-w-0 border border-slate-300 rounded-2xl p-4 h-24 resize-none bg-white"
                />

                {/* ASSIGN TO */}
                <select
                  value={newTask.assignTo}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      assignTo: e.target.value,
                    })
                  }
                  className="w-full min-w-0 box-border border border-slate-300 rounded-2xl p-4 bg-white"
                >

                  <option value="">
                    Assign To
                  </option>

                  {newTask.type === "DT"
                    ? uniqueRoles.map((role) => (

                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>

                    ))
                    : users.map((user) => (

                      <option
                        key={user.id}
                        value={user.name}
                      >
                        {user.name}
                      </option>

                    ))}

                </select>

                {/* TARGET */}
                {(newTask.type === "Project" ||
                  newTask.type === "TPM") && (

                    <>

                      <input
                        type="date"
                        value={newTask.targetDate}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            targetDate:
                              e.target.value,
                          })
                        }
                        className="w-full min-w-0 max-w-full box-border border border-slate-300 rounded-2xl p-3 bg-white appearance-none"
                      />

                      <input
                        type="time"
                        value={newTask.targetTime}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            targetTime:
                              e.target.value,
                          })
                        }
                        className="w-full min-w-0 max-w-full box-border border border-slate-300 rounded-2xl p-3 bg-white appearance-none"
                      />

                    </>

                  )}

                {/* BUTTON */}
                <div className="flex gap-3 pt-2">

                  <button
                    onClick={() =>
                      setShowModal(false)
                    }
                    className="flex-1 border rounded-2xl p-4 font-bold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-[#166534] text-white rounded-2xl p-4 font-bold"
                  >
                    Save
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

        {/* TASK DETAIL MODAL */}
        {showTaskModal && selectedTask && (

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-5 z-50">

            <div className="bg-white rounded-3xl p-5 w-full max-h-[90vh] overflow-auto">

              <div className="flex items-center justify-between mb-5">

                <h2 className="text-2xl font-bold text-slate-800">
                  Task Detail
                </h2>

                <button
                  onClick={() =>
                    setShowTaskModal(false)
                  }
                  className="text-slate-400 text-xl"
                >
                  ✕
                </button>

              </div>

              <div className="space-y-4 pb-2">

                <div>

                  <div className="text-sm text-slate-500 leading-6">
                    Machine
                  </div>

                  <div className="font-bold text-slate-800">
                    {selectedTask.machine}
                  </div>

                </div>

                <div>

                  <div className="text-xs text-slate-400">
                    Issue
                  </div>

                  <div className="font-bold text-slate-800">
                    {selectedTask.issue}
                  </div>

                </div>

                {/* REVISE TASK */}
                {canReviseAssign && (

                  <div className="space-y-3 border rounded-2xl p-4 bg-orange-50">

                    <div className="font-bold text-orange-600">
                      Revise Assignment
                    </div>

                    <input
                      type="text"
                      placeholder="Machine"
                      value={reviseTask.machine}
                      onChange={(e) =>
                        setReviseTask({
                          ...reviseTask,
                          machine:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-2xl p-3"
                    />

                    <textarea
                      placeholder="Issue"
                      value={reviseTask.issue}
                      onChange={(e) =>
                        setReviseTask({
                          ...reviseTask,
                          issue:
                            e.target.value,
                        })
                      }
                      className="w-full min-w-0 box-border border border-slate-300 rounded-2xl p-4 h-24 resize-none bg-white"
                    />

                    <select
                      value={reviseTask.assignTo}
                      onChange={(e) =>
                        setReviseTask({
                          ...reviseTask,
                          assignTo:
                            e.target.value,
                        })
                      }
                      className="w-full min-w-0 box-border border border-slate-300 rounded-2xl p-4 bg-white"
                    >

                      <option value="">
                        Select User
                      </option>

                      {users.map((user) => (

                        <option
                          key={user.id}
                          value={user.name}
                        >
                          {user.name}
                        </option>

                      ))}

                    </select>

                    <input
                      type="date"
                      value={reviseTask.targetDate}
                      onChange={(e) =>
                        setReviseTask({
                          ...reviseTask,
                          targetDate:
                            e.target.value,
                        })
                      }
                      className="w-full min-w-0 max-w-full box-border border border-slate-300 rounded-2xl p-3 bg-white appearance-none"
                    />

                    <input
                      type="time"
                      value={reviseTask.targetTime}
                      onChange={(e) =>
                        setReviseTask({
                          ...reviseTask,
                          targetTime:
                            e.target.value,
                        })
                      }
                      className="w-full min-w-0 max-w-full box-border border border-slate-300 rounded-2xl p-3 bg-white appearance-none"
                    />

                    <button
                      onClick={handleReviseTask}
                      className="w-full bg-orange-500 text-white rounded-2xl p-3 font-bold"
                    >
                      Revise Task
                    </button>

                  </div>

                )}

                {/* ACCEPT BUTTON */}
                {selectedTask.status === "Open" && canAccept && (

                  <button
                    onClick={handleAcceptTask}
                    className="w-full bg-[#166534] text-white rounded-2xl p-4 font-bold"
                  >
                    Accept Task
                  </button>

                )}
                {selectedTask.type === "DT" && (selectedTask.status === "Progress" || selectedTask.status === "Done") && (
                  <>

                    <textarea
                      placeholder="Root Cause Analysis (RCA)"
                      value={taskReport.rca}
                      onChange={(e) =>
                        setTaskReport({
                          ...taskReport,
                          rca: e.target.value,
                        })
                      }
                      className="w-full border rounded-2xl p-4 h-28"
                    />

                    <textarea
                      placeholder="Action Taken"
                      value={taskReport.action}
                      onChange={(e) =>
                        setTaskReport({
                          ...taskReport,
                          action:
                            e.target.value,
                        })
                      }
                      className="w-full border rounded-2xl p-4 h-28"
                    />

                    {(
                      selectedTask.status !== "Done" ||
                      canRevise
                    ) && (

                        <button
                          onClick={
                            handleSubmitTask
                          }
                          className={`w-full text-white rounded-2xl p-4 font-bold ${selectedTask.status === "Done"
                            ? "bg-orange-500"
                            : "bg-green-600"
                            }`}
                        >

                          {selectedTask.status === "Done"
                            ? "Revise Report"
                            : "Close Task"}

                        </button>

                      )}

                  </>

                )}

                {/* PROJECT / TPM PHOTO */}
                {(
                  selectedTask.type === "Project" ||
                  selectedTask.type === "TPM"
                ) &&
                  selectedTask.status === "Progress" && (

                    <div className="space-y-4">

                      <div>

                        <div className="text-sm font-semibold mb-2">
                          Before Photo
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e,
                              "before"
                            )
                          }
                        />

                        {taskPhotos.before && (

                          <img
                            src={taskPhotos.before}
                            className="mt-3 rounded-2xl"
                          />

                        )}

                      </div>

                      <div>

                        <div className="text-sm font-semibold mb-2">
                          After Photo
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageUpload(
                              e,
                              "after"
                            )
                          }
                        />

                        {taskPhotos.after && (

                          <img
                            src={taskPhotos.after}
                            className="mt-3 rounded-2xl"
                          />

                        )}

                      </div>

                    </div>

                  )}

                {/* SHOW PROJECT / TPM PHOTO */}
                {(
                  selectedTask.type === "Project" ||
                  selectedTask.type === "TPM"
                ) && (

                    <div className="space-y-4">

                      {selectedTask.beforePhoto && (

                        <div>

                          <div className="text-sm font-bold text-slate-700 mb-2">
                            Before Photo
                          </div>

                          <img
                            src={selectedTask.beforePhoto}
                            className="w-full rounded-2xl border"
                          />

                        </div>

                      )}

                      {selectedTask.afterPhoto && (

                        <div>

                          <div className="text-sm font-bold text-slate-700 mb-2">
                            After Photo
                          </div>

                          <img
                            src={selectedTask.afterPhoto}
                            className="w-full rounded-2xl border"
                          />

                        </div>

                      )}

                    </div>

                  )}

                {/* PROJECT / TPM CLOSE */}
                {(
                  (
                    selectedTask.type === "Project" ||
                    selectedTask.type === "TPM"
                  ) &&
                  selectedTask.status === "Progress" && taskPhotos.before && taskPhotos.after) && (
                    <button
                      onClick={handleSubmitTask}
                      className="w-full bg-green-600 text-white rounded-2xl p-4 font-bold"
                    >
                      Close Task
                    </button>

                  )}

                {/* APPROVE BUTTON */}
                {selectedTask.status ===
                  "Waiting Approval" &&
                  selectedTask.createdBy ===
                  user.name && (

                    <button
                      onClick={
                        handleApproveTask
                      }
                      className="w-full bg-[#166534] text-white rounded-2xl p-4 font-bold"
                    >
                      Approve Task
                    </button>

                  )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

function Card({
  title,
  value,
  color,
  active,
  onClick,
}) {

  const colors = {
    blue: "bg-blue-100 text-blue-700",
    orange:
      "bg-orange-100 text-orange-700",
    green:
      "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };


  return (

    <div
      onClick={onClick}
      className={`rounded-[30px] p-5 transition-all duration-300 cursor-pointer border border-slate-200 shadow-[0_6px_18px_rgba(15,23,42,.08)] active:scale-[0.98] ${
        active
          ? "bg-gradient-to-br from-[#166534] to-[#16a34a] text-white"
          : "bg-white hover:bg-slate-50"
      }`}
    >

      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${active
        ? "bg-white text-black"
        : colors[color]
        }`}>
        {title}
      </div>

      <div className={`mt-4 text-3xl font-black ${active
        ? "text-white"
        : "text-slate-800"
        }`}>
        {value}
      </div>

    </div>
  );
}

function TaskCard({
  task,
  onClick,
}) {

  const statusColor = {

    Open:
      "bg-blue-100 text-blue-700",

    Progress:
      "bg-orange-100 text-orange-700",

    Done:
      "bg-green-100 text-green-700",

    Delay:
      "bg-red-100 text-red-700",

    Urgent:
      "bg-pink-100 text-pink-700",
  };

  return (

    <div
      onClick={onClick}
      className="bg-white rounded-[30px] p-5 border border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,.08)] cursor-pointer active:scale-[0.98] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(15,23,42,.12)] hover:-translate-y-[2px]"
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <div className="flex items-center gap-2">

            <h4 className="font-bold text-slate-800">
              {task.machine}
            </h4>

            <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${task.type === "Project"
              ? "bg-purple-100 text-purple-700"
              : task.type === "TPM"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
              }`}>

              {task.type}

            </div>

          </div>

          <p className="text-sm text-slate-500 mt-2">
            {task.issue}
          </p>

        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[task.status]}`}>
          {task.status}
        </div>

      </div>

      {/* TASK INFO */}
      <div className="mt-5 space-y-1 text-xs text-slate-400">

        <div>
          Assigned To: {task.assignTo}
        </div>

        {(task.type === "Project" ||
          task.type === "TPM") && (

            <div>
              Target:
              {" "}
              {task.targetDate}
              {" "}
              {task.targetTime}
            </div>

          )}

        <div>
          Created By: {task.createdBy}
        </div>

        <div>
          Time: {task.createdAt}
        </div>

        {task.acceptedBy && (
          <div className="text-blue-600 font-semibold">
            Accepted By: {task.acceptedBy}
          </div>
        )}

        {task.closedBy && (
          <>
            <div className="text-green-600 font-semibold">
              Closed By: {task.closedBy}
            </div>

            {task.rca && (

              <div className="mt-2">

                <span className="font-semibold text-slate-500">
                  RCA:
                </span>

                <div className="text-slate-600">
                  {task.rca}
                </div>

              </div>

            )}

            {task.action && (

              <div className="mt-2">

                <span className="font-semibold text-slate-500">
                  Action:
                </span>

                <div className="text-slate-600">
                  {task.action}
                </div>

              </div>

            )}
          </>
        )}

      </div>

    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
}) {

  return (

    <div className={`flex flex-col items-center gap-1 text-xs ${active
      ? "text-blue-600 font-bold"
      : "text-slate-400"
      }`}>

      <div className="text-lg">
        {icon}
      </div>

      <span>
        {label}
      </span>

    </div>
  );
}
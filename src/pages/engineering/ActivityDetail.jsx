import {
    useEffect,
    useState,
    useRef,
} from "react";

import {
    ArrowLeft,
    Plus,
    FolderKanban,
    Trash2,
    Pencil,
    ChevronDown,
    ChevronRight,
    Search,
} from "lucide-react";

import { supabase }
    from "../../supabase/supabase";

export default function ActivityDetail({

    project,
    onBack,
    refreshProjects,

}) {

    // =========================
    // STATE
    // =========================

    const [loading,
        setLoading] =
        useState(true);

    const [showAddTask,
        setShowAddTask] =
        useState(false);

    const [showAddSubTask,
        setShowAddSubTask] =
        useState(false);

    const [selectedHeader,
        setSelectedHeader] =
        useState(null);

    const ganttScrollRef =
        useRef(null);

    // =========================
    // DATA
    // =========================

    const [taskHeaders,
        setTaskHeaders] =
        useState([]);

    const [subTaskList,
        setSubTaskList] =
        useState([]);

    // =========================
    // FORM
    // =========================

    const [taskHeader,
        setTaskHeader] =
        useState({

            title: "",
            assigned_to: "",
            start_date: "",
            end_date: "",

        });

    const [subTask,
        setSubTask] =
        useState({

            activity: "",
            assigned_to: "",
            start_date: "",
            end_date: "",

        });

    const workflowOptions = [

        "RFQ",
        "Design",
        "PR",
        "PO",
        "Shipping",
        "Installation",
        "Debugging",
        "Validation",
        "Pilot Run",
        "SOP"

    ];

    const [selectedWorkflow,
        setSelectedWorkflow] =
        useState([]);

    const [editingSubTask,
        setEditingSubTask] =
        useState(null);

    // =========================
    // AUTO SELECT PR & SOP
    // =========================

    useEffect(() => {

        if (
            !showAddSubTask ||
            !selectedHeader ||
            editingSubTask
        ) return;

        const existingActivities =
            subTaskList
                .filter(
                    (x) =>
                        x.header_id ===
                        selectedHeader.id
                )
                .map(
                    (x) => x.activity
                );

        const autoSelect = [];

        // AUTO PR
        if (
            !existingActivities.includes("Pilot Run")
        ) {

            autoSelect.push("Pilot Run");

        }
        if (
            !existingActivities.includes("Validation")
        ) {

            autoSelect.push("Validation");

        }

        // AUTO SOP
        if (
            !existingActivities.includes("SOP")
        ) {

            autoSelect.push("SOP");

        }

        setSelectedWorkflow(
            autoSelect
        );

    }, [

        showAddSubTask,
        selectedHeader,
        editingSubTask

    ]);



    const [collapsedHeaders,
        setCollapsedHeaders] =
        useState([]);

    const [editingHeader,
        setEditingHeader] =
        useState(null);

    const [userList,
        setUserList] =
        useState([]);

    const [searchTask,
        setSearchTask] =
        useState("");

    const [statusFilter,
        setStatusFilter] =
        useState([

            "OPEN",
            "PROGRESS",
            "DELAY"

        ]);

    const [showStatusDropdown,
        setShowStatusDropdown] =
        useState(false);

    // =========================
    // CURRENT USER
    // =========================

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    // =========================
    // LOAD TASK HEADER
    // =========================

    const loadTaskHeaders =
        async () => {

            try {

                setLoading(true);

                const {
                    data,
                    error
                } = await supabase
                    .from("task_headers")
                    .select("*")
                    .eq(
                        "project_id",
                        project.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );

                if (error) {

                    console.log(error);

                    return;

                }

                setTaskHeaders(
                    data || []
                );

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

    // =========================
    // LOAD SUB TASK
    // =========================

    const loadSubTasks =
        async () => {

            try {

                const {
                    data,
                    error
                } = await supabase
                    .from("sub_tasks")
                    .select("*")
                    .eq(
                        "project_id",
                        project.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );

                if (error) {

                    console.log(error);

                    return;

                }

                setSubTaskList(
                    data || []
                );

            } catch (error) {

                console.log(error);

            }

        };

    useEffect(() => {

        loadTaskHeaders();
        loadSubTasks();
        loadUsers();

        // ======================
        // AUTO SCROLL CURRENT WEEK
        // ======================

        setTimeout(() => {

            if (!ganttScrollRef.current)
                return;

            const currentWeek =
                getWeekNumber(
                    new Date()
                );

            const scrollPosition =
                (currentWeek - 3) * 80;

            ganttScrollRef.current.scrollLeft =
                scrollPosition;

        }, 300);

    }, []);

    const loadUsers =
        async () => {

            try {

                const {
                    data,
                    error
                } = await supabase
                    .from("users")
                    .select("*")
                    .neq(
                        "role",
                        "Manager"
                    )
                    .neq(
                        "role",
                        "Production"
                    )
                    .order(
                        "name",
                        {
                            ascending: true
                        }
                    );

                if (error) {

                    console.log(error);

                    return;

                }

                console.log(data);

                setUserList(
                    data || []
                );

            } catch (error) {

                console.log(error);

            }

        };
    // =========================
    // SAVE TASK HEADER
    // =========================

    const handleSaveTaskHeader =
        async () => {

            try {

                if (
                    !taskHeader.title
                ) {

                    alert(
                        "Task title required"
                    );

                    return;

                }

                // ======================
                // EDIT MODE
                // ======================

                if (
                    editingHeader
                ) {

                    const {
                        error
                    } = await supabase
                        .from("task_headers")
                        .update({

                            title:
                                taskHeader.title,

                            assigned_to:
                                taskHeader.assigned_to,

                            start_date:
                                taskHeader.start_date || null,

                            end_date:
                                taskHeader.end_date || null,

                        })
                        .eq(
                            "id",
                            editingHeader.id
                        );

                    if (error) {

                        console.log(error);

                        alert(error.message);

                        return;

                    }

                } else {

                    const payload = {

                        project_id:
                            project.id,

                        title:
                            taskHeader.title,

                        assigned_to:
                            taskHeader.assigned_to,

                        start_date:
                            taskHeader.start_date,

                        end_date:
                            taskHeader.end_date,

                    };

                    const {
                        error
                    } = await supabase
                        .from("task_headers")
                        .insert([
                            payload
                        ]);

                    if (error) {

                        console.log(error);

                        alert(
                            error.message
                        );

                        return;

                    }

                }

                setEditingHeader(
                    null
                );

                setTaskHeader({

                    title: "",
                    assigned_to: "",
                    start_date: "",
                    end_date: "",

                });

                setShowAddTask(
                    false
                );

                await loadTaskHeaders();

                if (refreshProjects) {

                    await refreshProjects();

                }

            } catch (error) {

                console.log(error);

            }

        };



    // =========================
    // SAVE SUB TASK
    // =========================

    const handleSaveSubTask =
        async () => {

            try {

                if (
                    !editingSubTask &&
                    selectedWorkflow.length === 0
                ) {

                    alert(
                        "Sub task required"
                    );

                    return;

                }

                // ======================
                // HEADER END DATE LIMIT
                // ======================

                if (
                    selectedHeader?.end_date &&

                    (
                        editingSubTask?.remark === "PLAN" ||
                        !editingSubTask
                    )
                ) {

                    const headerEnd =
                        new Date(
                            selectedHeader.end_date
                        );

                    headerEnd.setHours(
                        0,
                        0,
                        0,
                        0
                    );

                    // START DATE VALIDATION
                    if (
                        subTask.start_date
                    ) {

                        const startDate =
                            new Date(
                                subTask.start_date
                            );

                        startDate.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        if (
                            startDate >
                            headerEnd
                        ) {

                            alert(
                                "Start date cannot exceed task header end date"
                            );

                            return;

                        }

                    }

                    // END DATE VALIDATION
                    if (
                        subTask.end_date
                    ) {

                        const endDate =
                            new Date(
                                subTask.end_date
                            );

                        endDate.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        if (
                            endDate >
                            headerEnd
                        ) {

                            alert(
                                "End date cannot exceed task header end date"
                            );

                            return;

                        }

                    }

                }

                // ======================
                // EDIT MODE
                // ======================

                if (
                    editingSubTask
                ) {

                    // UPDATE BOTH PLAN & ACTUAL
                    const {
                        error: updateError
                    } = await supabase
                        .from("sub_tasks")
                        .update({

                            activity:
                                subTask.activity,

                            assigned_to:
                                subTask.assigned_to,

                        })
                        .eq(
                            "header_id",
                            selectedHeader.id
                        )
                        .eq(
                            "activity",
                            editingSubTask.activity
                        );

                    if (updateError) {

                        console.log(
                            updateError
                        );

                        alert(
                            updateError.message
                        );

                        return;

                    }

                    // UPDATE DATE ONLY SELECTED ROW
                    const {
                        error: dateError
                    } = await supabase
                        .from("sub_tasks")
                        .update({

                            start_date:
                                subTask.start_date || null,

                            end_date:
                                subTask.end_date || null,

                        })
                        .eq(
                            "id",
                            editingSubTask.id
                        );

                    if (dateError) {

                        console.log(
                            dateError
                        );

                        alert(
                            dateError.message
                        );

                        return;

                    }

                } else {

                    // ======================
                    // DUPLICATE VALIDATION
                    // ======================

                    const existingActivities =
                        subTaskList
                            .filter(
                                (x) =>
                                    x.header_id ===
                                    selectedHeader.id
                            )
                            .map(
                                (x) => x.activity
                            );

                    const duplicated =
                        selectedWorkflow.filter(
                            (item) =>
                                existingActivities.includes(
                                    item
                                )
                        );

                    if (duplicated.length > 0) {

                        alert(
                            `${duplicated.join(", ")} already exists`
                        );

                        return;

                    }

                    // ======================
                    // CREATE PLAN + ACTUAL
                    // ======================

                    const payload = [];

                    selectedWorkflow.forEach(
                        (activity) => {

                            payload.push(

                                // PLAN
                                {

                                    project_id:
                                        project.id,

                                    header_id:
                                        selectedHeader.id,

                                    activity,

                                    remark:
                                        "PLAN",

                                    assigned_to:
                                        "",

                                    start_date:
                                        null,

                                    end_date:
                                        null,

                                },

                                // ACTUAL
                                {

                                    project_id:
                                        project.id,

                                    header_id:
                                        selectedHeader.id,

                                    activity,

                                    remark:
                                        "ACTUAL",

                                    assigned_to:
                                        "",

                                    start_date:
                                        null,

                                    end_date:
                                        null,

                                }

                            );

                        }
                    );

                    const {
                        error: insertError
                    } = await supabase
                        .from("sub_tasks")
                        .insert(
                            payload
                        );

                    if (insertError) {

                        console.log(
                            insertError
                        );

                        alert(
                            insertError.message
                        );

                        return;

                    }

                }

                // CLOSE MODAL
                setShowAddSubTask(
                    false
                );

                // RESET EDIT MODE
                setEditingSubTask(
                    null
                );

                // RESET FORM
                setSubTask({

                    activity: "",
                    assigned_to: "",
                    start_date: "",
                    end_date: "",

                });
                setSelectedWorkflow([]);

                // RELOAD
                await loadSubTasks();

                if (refreshProjects) {

                    refreshProjects();

                }

            } catch (error) {

                console.log(error);

            }

        };

    // =========================
    // EDIT TASK HEADER
    // =========================

    const handleEditHeader =
        (
            header
        ) => {

            setEditingHeader(
                header
            );

            setTaskHeader({

                title:
                    header.title || "",

                assigned_to:
                    header.assigned_to || "",

                start_date:
                    header.start_date || "",

                end_date:
                    header.end_date || "",

            });

            setShowAddTask(
                true
            );

        };

    // =========================
    // DELETE TASK HEADER
    // =========================

    const handleDeleteHeader =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this task?"
                );

            if (
                !confirmDelete
            ) return;

            try {

                const {
                    error
                } = await supabase
                    .from("task_headers")
                    .delete()
                    .eq(
                        "id",
                        id
                    );

                if (error) {

                    console.log(error);

                    return;

                }

                await loadTaskHeaders();

                if (refreshProjects) {

                    await refreshProjects();

                }

            } catch (error) {

                console.log(error);

            }

        };

    // =========================
    // EDIT SUB TASK
    // =========================

    // =========================
    // EDIT SUB TASK
    // =========================

    const handleEditSubTask =
        (
            sub
        ) => {

            // IMPORTANT
            const headerData =
                taskHeaders.find(
                    (x) =>
                        x.id ===
                        sub.header_id
                );

            setSelectedHeader(
                headerData
            );

            // SET EDIT MODE
            setEditingSubTask(
                sub
            );

            // FILL FORM
            setSubTask({

                activity:
                    sub.activity,

                assigned_to:
                    sub.assigned_to,

                start_date:
                    sub.start_date || "",

                end_date:
                    sub.end_date || "",

            });

            // OPEN MODAL
            setShowAddSubTask(
                true
            );

        };

    // =========================
    // DELETE SUB TASK
    // =========================

    const handleDeleteSubTask =
        async (
            sub
        ) => {

            const confirmDelete =
                window.confirm(
                    "Delete this sub task?"
                );

            if (
                !confirmDelete
            ) return;

            try {

                const {
                    error
                } = await supabase
                    .from("sub_tasks")
                    .delete()
                    .eq(
                        "header_id",
                        sub.header_id
                    )
                    .eq(
                        "activity",
                        sub.activity
                    );

                if (error) {

                    console.log(error);

                    return;

                }

                await loadSubTasks();

                if (refreshProjects) {

                    refreshProjects();

                }

            } catch (error) {

                console.log(error);

            }

        };

    // =========================
    // TOGGLE COLLAPSE
    // =========================

    const handleToggleCollapse =
        (
            headerId
        ) => {

            setCollapsedHeaders(
                (prev) => {

                    // COLLAPSED
                    if (
                        prev.includes(
                            headerId
                        )
                    ) {

                        return prev.filter(
                            (x) =>
                                x !==
                                headerId
                        );

                    }

                    // EXPANDED
                    return [
                        ...prev,
                        headerId
                    ];

                }
            );

        };

    // =========================
    // CALCULATE HEADER PROGRESS
    // =========================

    const calculateHeaderProgress =
        (
            headerId
        ) => {

            const actualTasks =
                subTaskList.filter(
                    (x) =>

                        x.header_id ===
                        headerId &&

                        x.remark ===
                        "ACTUAL"
                );

            if (
                actualTasks.length === 0
            ) {

                return 0;

            }

            const completed =
                actualTasks.filter(
                    (x) =>
                        x.end_date
                ).length;

            return Math.round(
                (
                    completed /
                    actualTasks.length
                ) * 100
            );

        };

    const getHeaderProgressInfo =
        (headerId) => {

            const actualTasks =
                subTaskList.filter(
                    (x) =>

                        x.header_id ===
                        headerId &&

                        x.remark ===
                        "ACTUAL"
                );

            const planTasks =
                subTaskList.filter(
                    (x) =>

                        x.header_id ===
                        headerId &&

                        x.remark ===
                        "PLAN"
                );



            if (
                actualTasks.length === 0
            ) {

                return {

                    progress: 0,
                    color:
                        "from-cyan-500 to-blue-500",
                    shadow:
                        "shadow-[0_0_20px_rgba(0,255,255,0.35)]"

                };

            }

            const completed =
                actualTasks.filter(
                    (x) =>
                        x.end_date
                ).length;

            const progress =
                Math.round(
                    (
                        completed /
                        actualTasks.length
                    ) * 100
                );

            // ======================
            // CHECK DELAY
            // ======================

            let delayed = false;

            actualTasks.forEach(
                (actual) => {

                    const plan =
                        planTasks.find(
                            (x) =>
                                x.activity ===
                                actual.activity
                        );

                    if (
                        plan &&
                        plan.end_date &&
                        actual.end_date
                    ) {

                        const planDate =
                            new Date(
                                plan.end_date
                            );

                        const actualDate =
                            new Date(
                                actual.end_date
                            );

                        if (
                            actualDate >
                            planDate
                        ) {

                            delayed = true;

                        }

                    }

                }
            );

            // ======================
            // COLOR
            // ======================

            if (delayed) {

                return {

                    progress,
                    color:
                        "from-red-500 to-red-700",
                    shadow:
                        "shadow-[0_0_20px_rgba(255,0,0,0.35)]"

                };

            }

            if (progress >= 100) {

                return {

                    progress,
                    color:
                        "from-green-500 to-emerald-600",
                    shadow:
                        "shadow-[0_0_20px_rgba(0,255,120,0.35)]"

                };

            }

            if (progress > 0) {

                return {

                    progress,
                    color:
                        "from-amber-400 to-orange-500",
                    shadow:
                        "shadow-[0_0_20px_rgba(255,180,0,0.35)]"

                };

            }

            return {

                progress,
                color:
                    "from-cyan-500 to-blue-500",
                shadow:
                    "shadow-[0_0_20px_rgba(0,255,255,0.35)]"

            };

        };

    const calculateHeaderDelay =
        (header) => {

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            // ======================
            // HEADER DELAY
            // ======================

            let headerDelay = 0;

            // ======================
            // GET ACTUAL TASKS
            // ======================

            const actualTasks =
                subTaskList.filter(
                    (x) =>

                        x.header_id ===
                        header.id &&

                        x.remark ===
                        "ACTUAL"
                );

            // ======================
            // FIND LAST ACTUAL END
            // ======================

            const completedActual =
                actualTasks.filter(
                    (x) => x.end_date
                );

            let lastActualEnd =
                null;

            if (
                completedActual.length > 0
            ) {

                lastActualEnd =
                    completedActual
                        .map(
                            (x) =>
                                new Date(
                                    x.end_date
                                )
                        )
                        .sort(
                            (a, b) =>
                                b - a
                        )[0];

                lastActualEnd.setHours(
                    0,
                    0,
                    0,
                    0
                );

            }

            // ======================
            // HEADER END DATE CHECK
            // ======================

            if (
                header.end_date
            ) {

                const endDate =
                    new Date(
                        header.end_date
                    );

                endDate.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const progress =
                    calculateHeaderProgress(
                        header.id
                    );

                // ======================
                // NOT DONE & OVERDUE
                // ======================

                if (
                    progress < 100 &&
                    today > endDate
                ) {

                    headerDelay =
                        Math.floor(
                            (
                                today -
                                endDate
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );

                }

                // ======================
                // DONE BUT LATE
                // ======================

                else if (
                    progress >= 100 &&
                    lastActualEnd &&
                    lastActualEnd > endDate
                ) {

                    headerDelay =
                        Math.floor(
                            (
                                lastActualEnd -
                                endDate
                            ) /
                            (
                                1000 *
                                60 *
                                60 *
                                24
                            )
                        );

                }

            }

            // ======================
            // ACTUAL VS PLAN DELAY
            // ======================

            let subTaskDelay = 0;

            actualTasks.forEach(
                (actual) => {

                    const plan =
                        subTaskList.find(
                            (x) =>

                                x.header_id ===
                                actual.header_id &&

                                x.activity ===
                                actual.activity &&

                                x.remark ===
                                "PLAN"
                        );

                    if (
                        plan?.end_date
                    ) {

                        const planEnd =
                            new Date(
                                plan.end_date
                            );

                        planEnd.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        let actualEnd =
                            today;

                        if (
                            actual.end_date
                        ) {

                            actualEnd =
                                new Date(
                                    actual.end_date
                                );

                            actualEnd.setHours(
                                0,
                                0,
                                0,
                                0
                            );

                        }

                        if (
                            actualEnd >
                            planEnd
                        ) {

                            const diff =
                                Math.floor(
                                    (
                                        actualEnd -
                                        planEnd
                                    ) /
                                    (
                                        1000 *
                                        60 *
                                        60 *
                                        24
                                    )
                                );

                            subTaskDelay +=
                                diff;

                        }

                    }

                }
            );

            // ======================
            // RETURN BOTH
            // ======================

            return {

                headerDelay,
                subTaskDelay

            };

        };

    // =========================
    // WEEK HELPER
    // =========================

    const weeks =
        Array.from(
            { length: 52 },
            (_, i) => i + 1
        );

    const getWeekNumber =
        (dateString) => {

            if (!dateString)
                return 1;

            const date =
                new Date(dateString);

            const start =
                new Date(
                    date.getFullYear(),
                    0,
                    1
                );

            const diff =
                (
                    date - start
                ) / 86400000;

            return Math.ceil(
                (
                    diff +
                    start.getDay() +
                    1
                ) / 7
            );

        };

    const getHeaderStatus =
        (header) => {

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            // ======================
            // ALL SUBTASK
            // ======================

            const headerSubTasks =
                subTaskList.filter(
                    (x) =>
                        x.header_id ===
                        header.id
                );

            // ======================
            // PLAN TASKS
            // ======================

            const planTasks =
                headerSubTasks.filter(
                    (x) =>
                        x.remark ===
                        "PLAN"
                );

            // ======================
            // ALL ACTUAL TASK
            // ======================

            const actualTasks =
                headerSubTasks.filter(
                    (x) =>
                        x.remark === "ACTUAL"
                );

            // ======================
            // HAS PROGRESS
            // ======================

            const hasPlanProgress =
                planTasks.some(
                    (x) =>

                        x.start_date &&
                        x.end_date
                ) ||

                actualTasks.some(
                    (x) =>

                        x.start_date &&
                        x.end_date
                );

            // ======================
            // DONE
            // ALL ACTUAL MUST COMPLETE
            // ======================

            const allActualDone =
                actualTasks.length > 0 &&

                actualTasks.every(
                    (x) =>

                        x.start_date &&
                        x.end_date
                );

            if (allActualDone) {

                return "DONE";

            }

            // ======================
            // DELAY
            // ======================

            if (
                header.end_date
            ) {

                const endDate =
                    new Date(
                        header.end_date
                    );

                endDate.setHours(
                    0,
                    0,
                    0,
                    0
                );

                if (
                    today > endDate &&
                    !allActualDone
                ) {

                    return "DELAY";

                }

            }

            // ======================
            // PROGRESS
            // ======================

            if (
                hasPlanProgress
            ) {

                return "PROGRESS";

            }

            // ======================
            // OPEN
            // ======================

            return "OPEN";

        };

    const handleToggleStatus =
        (status) => {

            setStatusFilter(
                (prev) => {

                    // REMOVE
                    if (
                        prev.includes(
                            status
                        )
                    ) {

                        return prev.filter(
                            (x) =>
                                x !== status
                        );

                    }

                    // ADD
                    return [
                        ...prev,
                        status
                    ];

                }
            );

        };

    const filteredHeaders =
        taskHeaders.filter((header) => {

            const keyword =
                searchTask.toLowerCase();

            // HEADER TITLE
            const matchHeader =
                header.title
                    ?.toLowerCase()
                    .includes(keyword);

            // ASSIGNED
            const matchAssigned =
                header.assigned_to
                    ?.toLowerCase()
                    .includes(keyword);

            // SUB TASK
            const matchSubTask =
                subTaskList.some(

                    (sub) =>

                        sub.header_id ===
                        header.id &&

                        sub.activity
                            ?.toLowerCase()
                            .includes(keyword)

                );

            const searchMatch = (

                matchHeader ||
                matchAssigned ||
                matchSubTask

            );

            const status =
                getHeaderStatus(
                    header
                );

            const statusMatch =
                statusFilter.includes(
                    status
                );

            return (
                searchMatch &&
                statusMatch
            );

        });

    // =========================
    // SUMMARY CARD
    // =========================

    const totalHeader =
        taskHeaders.length;

    const doneHeader =
        taskHeaders.filter(
            (x) =>
                getHeaderStatus(x) === "DONE"
        ).length;

    const delayHeader =
        taskHeaders.filter(
            (x) =>
                getHeaderStatus(x) === "DELAY"
        ).length;

    const ongoingHeader =
        taskHeaders.filter(
            (x) =>
                getHeaderStatus(x) === "PROGRESS"
        ).length;

    const openHeader =
        taskHeaders.filter(
            (x) =>
                getHeaderStatus(x) === "OPEN"
        ).length;

    return (

        <div className="space-y-6">

            {/* HEADER */}
            <div className="relative overflow-visible
            rounded-[36px]
            border border-cyan-500/10
            bg-gradient-to-br
            from-[#07111f]
            via-[#081426]
            to-[#020617]
            p-8">

                {/* GLOW */}
                <div className="absolute
                top-[-120px]
                right-[-120px]
                w-[260px]
                h-[260px]
                rounded-full
                bg-cyan-500/10
                blur-[120px]" />

                <div className="absolute
                bottom-[-120px]
                left-[-120px]
                w-[260px]
                h-[260px]
                rounded-full
                bg-green-500/10
                blur-[120px]" />

                <div className="relative z-10
                flex items-start
                justify-between">

                    {/* LEFT */}
                    <div>

                        <div className="inline-flex
                        items-center
                        gap-3
                        px-4 py-2
                        rounded-2xl
                        bg-cyan-500/10
                        border border-cyan-500/20
                        text-cyan-400
                        text-sm font-bold">

                            <FolderKanban
                                size={18}
                            />

                            ENGINEERING ACTIVITY

                        </div>

                        <h1 className="mt-5
                        text-5xl
                        font-black
                        text-white">

                            {project.title}

                        </h1>

                        <p className="mt-3
                        text-slate-400">

                            Project activity structure management

                        </p>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">
                        <div className="
                            relative
                            w-[420px]
                            ">

                            <Search
                                size={18}
                                className="
                                absolute
                                left-5
                                top-1/2
                                -translate-y-1/2
                                text-cyan-400
                                "
                            />

                            <input
                                type="text"
                                placeholder="
                                Search task / owner / sub task...
                                "
                                value={searchTask}
                                onChange={(e) =>
                                    setSearchTask(
                                        e.target.value
                                    )
                                }
                                className="
                                w-full
                                h-14
                                rounded-2xl
                                border
                                border-cyan-500/20
                                bg-white/5
                                backdrop-blur-xl
                                pl-14
                                pr-5
                                text-white
                                placeholder:text-slate-500
                                outline-none
                                focus:border-cyan-400
                                focus:shadow-[0_0_25px_rgba(0,255,255,0.25)]
                                transition-all
                                "
                            />

                        </div>

                        

                        <button
                            onClick={() =>
                                setShowAddTask(true)
                            }
                            className="h-14
                            px-6
                            rounded-2xl
                            bg-cyan-500/10
                            border border-cyan-500/20
                            text-cyan-400
                            flex items-center gap-3
                            hover:bg-cyan-500/20
                            hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]
                            transition-all"
                        >

                            <Plus size={18} />

                            Add Task

                        </button>

                        <button
                            onClick={onBack}
                            className="h-14
                            px-6
                            rounded-2xl
                            bg-white/5
                            border border-white/10
                            text-white
                            flex items-center gap-3"
                        >

                            <ArrowLeft
                                size={18}
                            />

                            Back

                        </button>

                    </div>

                    {/* =========================
                    SUMMARY CARD
                    ========================= */}

                    <div className="
                            absolute
                            right-8
                            bottom-[-18px]
                            flex
                            items-center
                            gap-3
                            z-20
                        ">


                        {/* DONE */}
                        <div
                            onClick={() =>
                                handleToggleStatus("DONE")
                            }
                            className={`
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            px-4
                            py-3
                            min-w-[95px]
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-105
                            active:scale-95

                            ${statusFilter.includes("DONE")

                                    ? `
                                border-green-400
                                bg-gradient-to-br
                                from-green-500/20
                                to-emerald-500/10
                                shadow-[0_0_25px_rgba(0,255,120,0.35)]
                                `

                                    : `
                                border-green-500/20
                                bg-gradient-to-br
                                from-green-500/10
                                to-emerald-500/5
                                opacity-50
                                `
                                }
                            `}
                        >

                            <p className="
                                    text-[10px]
                                    text-green-300
                                    font-bold
                                    tracking-wider
                                ">
                                DONE
                            </p>

                            <h1 className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    text-white
                                ">
                                {doneHeader}
                            </h1>

                        </div>

                        {/* DELAY */}
                        <div
                            onClick={() =>
                                handleToggleStatus("DELAY")
                            }
                            className={`
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            px-4
                            py-3
                            min-w-[95px]
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-105
                            hover:-translate-y-1
                            active:scale-95

                            ${statusFilter.includes("DELAY")

                                    ? `
                                border-red-400
                                bg-gradient-to-br
                                from-red-500/20
                                to-pink-500/10
                                shadow-[0_0_25px_rgba(255,0,90,0.35)]
                                `

                                    : `
                                border-red-500/20
                                bg-gradient-to-br
                                from-red-500/10
                                to-pink-500/5
                                opacity-50
                                `
                                }
                        `}
                        >

                            <p className="
                                text-[10px]
                                text-red-300
                                font-bold
                                tracking-wider
                            ">
                                DELAY
                            </p>

                            <h1 className="
                                mt-1
                                text-2xl
                                font-black
                                text-white
                            ">
                                {delayHeader}
                            </h1>

                        </div>

                        {/* ONGOING */}
                        <div
                            onClick={() =>
                                handleToggleStatus("PROGRESS")
                            }
                            className={`
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            px-4
                            py-3
                            min-w-[95px]
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-105
                            hover:-translate-y-1
                            active:scale-95

                            ${statusFilter.includes("PROGRESS")

                                    ? `
                                border-yellow-400
                                bg-gradient-to-br
                                from-yellow-500/20
                                to-orange-500/10
                                shadow-[0_0_25px_rgba(255,180,0,0.35)]
                                `

                                    : `
                                border-yellow-500/20
                                bg-gradient-to-br
                                from-yellow-500/10
                                to-orange-500/5
                                opacity-50
                                `
                                }
                        `}
                        >

                            <p className="
                                text-[10px]
                                text-yellow-300
                                font-bold
                                tracking-wider
                            ">
                                ONGOING
                            </p>

                            <h1 className="
                                mt-1
                                text-2xl
                                font-black
                                text-white
                            ">
                                {ongoingHeader}
                            </h1>

                        </div>

                        {/* OPEN */}
                        <div
                            onClick={() =>
                                handleToggleStatus("OPEN")
                            }
                            className={`
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            px-4
                            py-3
                            min-w-[95px]
                            cursor-pointer
                            transition-all
                            duration-300
                            hover:scale-105
                            hover:-translate-y-1
                            active:scale-95

                            ${statusFilter.includes("OPEN")

                                    ? `
                                border-cyan-400
                                bg-gradient-to-br
                                from-cyan-500/20
                                to-blue-500/10
                                shadow-[0_0_25px_rgba(0,200,255,0.35)]
                                `

                                    : `
                                border-cyan-500/20
                                bg-gradient-to-br
                                from-cyan-500/10
                                to-blue-500/5
                                opacity-50
                                `
                                }
                        `}
                        >

                            <p className="
                                text-[10px]
                                text-cyan-300
                                font-bold
                                tracking-wider
                            ">
                                OPEN
                            </p>

                            <h1 className="
                                mt-1
                                text-2xl
                                font-black
                                text-white
                            ">
                                {openHeader}
                            </h1>

                        </div>

                        {/* TOTAL */}
                        <div
                            onClick={() =>
                                setStatusFilter([
                                    "OPEN",
                                    "PROGRESS",
                                    "DELAY",
                                    "DONE"
                                ])
                            }
                            className="
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-violet-500/20
                                bg-gradient-to-br
                                from-violet-500/10
                                to-indigo-500/5
                                px-4
                                py-3
                                min-w-[95px]
                                cursor-pointer
                                transition-all
                                duration-300
                                hover:scale-105
                                hover:-translate-y-1
                                active:scale-95
                            "
                        >

                            <p className="
                                    text-[10px]
                                    text-violet-300
                                    font-bold
                                    tracking-wider
                                ">
                                TOTAL
                            </p>

                            <h1 className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    text-white
                                ">
                                {totalHeader}
                            </h1>

                        </div>

                    </div>

                </div>

            </div>

            <div className="flex gap-6 items-start">

                {/* LEFT TABLE */}
                <div className=" min-w-0">

                    {/* TASK TABLE */}
                    <div className="relative
        rounded-[36px]
            border border-cyan-500/10
            bg-gradient-to-br
            from-[#07111f]
            via-[#081526]
            to-[#020617]
            overflow-hidden
            shadow-[0_0_60px_rgba(0,255,255,0.05)]">

                        {/* GLOW */}
                        <div className="absolute
                top-[-120px]
                left-[20%]
                w-[300px]
                h-[300px]
                rounded-full
                bg-cyan-500/10
                blur-[140px]" />

                        <div
                            ref={ganttScrollRef}
                            className="
                            overflow-x-auto
                            overflow-y-auto
                            scrollbar-hide
                            gantt-main-scroll
                            max-h-[62vh]
                        "
                        >
                            <div className="min-w-[5500px]">
                                {/* TOP SCROLLBAR */}
                                <div
                                    className="
                                        overflow-x-auto
                                        overflow-y-hidden
                                        h-[18px]
                                        gantt-top-scroll
                                    "
                                >

                                    <div className="w-[5400px] h-[1px]" />

                                </div>
                                {/* TABLE HEADER */}
                                <div
                                    className="
                                    flex
                                    min-w-[5500px]
                                    sticky
                                    top-0
                                    z-50
                                    h-[42px]
                                    "
                                >
                                    <div
                                        className="
                                            grid
                                            grid-cols-[70px_300px_140px_180px_120px_120px_120px_120px_180px]
                                            shrink-0
                                            sticky
                                            left-0
                                            z-20
                                            bg-[#111827]
                                        ">

                                        <div className="px-4 h-full flex items-center">
                                            No
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Task
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Remark
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Assigned To
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Status
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Total Delay
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Start Date
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            End Date
                                        </div>

                                        <div className="px-4 h-full flex items-center">
                                            Action
                                        </div>
                                    </div>

                                    <div className="
                                        border-l
                                        border-white/10
                                        overflow-hidden
                                        shrink-0
                                        w-[4160px]
                                    ">

                                        <div className="flex h-full w-[4160px]">

                                            {weeks.map((week) => {

                                                const currentWeek =
                                                    getWeekNumber(
                                                        new Date()
                                                    );

                                                const isCurrentWeek =
                                                    week === currentWeek;

                                                return (

                                                    <div
                                                        key={week}
                                                        className={`
                                                        w-[80px]
                                                        shrink-0
                                                        border-r
                                                        border-white/10
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-[11px]
                                                        font-bold

                                                        ${isCurrentWeek

                                                                ? "text-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(0,255,120,0.25)]"

                                                                : "text-cyan-400"
                                                            }
                                                        `}
                                                    >

                                                        W{week}

                                                    </div>

                                                );

                                            })}

                                        </div>

                                    </div>
                                </div>

                                {/* EMPTY */}
                                {!loading &&
                                    taskHeaders.length === 0 && (

                                        <div className="p-16
                    text-center
                    text-slate-500">

                                            No task created yet

                                        </div>

                                    )}

                                {/* TASK HEADER ROW */}
                                {filteredHeaders.map(
                                    (
                                        header,
                                        index
                                    ) => (

                                        <div
                                            key={header.id}
                                        >

                                            {/* HEADER ROW */}
                                            <div
                                                className="
                                                flex
                                                min-w-[5500px]
                                                sticky
                                                top-[42px]
                                                z-30
                                                bg-gradient-to-r
                                                from-[#0f172a]
                                                to-[#111827]
                                                backdrop-blur-xl
                                                shadow-[0_0_30px_rgba(0,255,170,0.08)]
                                                border-b border-white/10
                                                text-white font-bold
                                                hover:brightness-110
                                                transition-all
                                            "
                                            >
                                                <div
                                                    className="
                                                    grid
                                                    grid-cols-[70px_300px_140px_180px_120px_120px_120px_120px_180px]
                                                    shrink-0
                                                    sticky
                                                    left-0
                                                    z-10
                                                    bg-[#0f172a]
                                                ">

                                                    {/* NO */}
                                                    <div className="px-4 h-full flex items-center">

                                                        {index + 1}

                                                    </div>

                                                    {/* TITLE */}
                                                    <div className="p-4
                                                        text-lg
                                                        font-black
                                                        tracking-wide
                                                        text-white
                                                        drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">

                                                        {header.title}

                                                    </div>

                                                    {/* PROGRESS */}
                                                    <div className="px-4 h-full flex items-center">

                                                        {(() => {

                                                            const {
                                                                progress,
                                                                color,
                                                                shadow
                                                            } = getHeaderProgressInfo(
                                                                header.id
                                                            );

                                                            return (

                                                                <div className="w-full">

                                                                    {/* MODERN BIG PROGRESS BAR */}
                                                                    <div className="
                                                            relative
                                                            w-full
                                                            h-7
                                                            rounded-2xl
                                                            bg-black/30
                                                            overflow-hidden
                                                            border border-white/10
                                                            shadow-inner
                                                            backdrop-blur-xl">

                                                                        {/* ACTIVE BAR */}
                                                                        <div
                                                                            className="
                                                                absolute
                                                                left-0
                                                                top-0
                                                                h-full
                                                                rounded-2xl
                                                                bg-gradient-to-r
                                                                from-[#3b82f6]
                                                                via-[#6366f1]
                                                                to-[#8b5cf6]
                                                                transition-all
                                                                duration-700
                                                                flex
                                                                items-center
                                                                justify-center
                                                                shadow-[0_0_20px_rgba(99,102,241,0.35)]"
                                                                            style={{
                                                                                width: `${progress}%`
                                                                            }}
                                                                        >

                                                                            {/* PERCENT TEXT INSIDE */}
                                                                            <span className="
                                                                    text-[11px]
                                                                    font-black
                                                                    tracking-wide
                                                                    text-white
                                                                    drop-shadow-lg">

                                                                                {progress}%

                                                                            </span>

                                                                        </div>

                                                                        {/* EMPTY STATE */}
                                                                        {progress === 0 && (

                                                                            <div className="
                                                                    absolute
                                                                    inset-0
                                                                    flex
                                                                    items-center
                                                                    justify-center">

                                                                                <span className="
                                                                        text-[11px]
                                                                        font-bold
                                                                        text-slate-500">

                                                                                    0%

                                                                                </span>

                                                                            </div>

                                                                        )}

                                                                    </div>

                                                                </div>

                                                            );

                                                        })()}

                                                    </div>

                                                    {/* ASSIGNED */}
                                                    <div className="px-4 h-full flex items-center">

                                                        {
                                                            header.assigned_to ||
                                                            "-"
                                                        }

                                                    </div>

                                                    <div className="px-4 h-full flex items-center">

                                                        {(() => {

                                                            const status =
                                                                getHeaderStatus(
                                                                    header
                                                                );

                                                            let color =
                                                                "text-cyan-400";

                                                            if (status === "DONE") {

                                                                color =
                                                                    "text-green-400";

                                                            }

                                                            else if (
                                                                status === "DELAY"
                                                            ) {

                                                                color =
                                                                    "text-red-400";

                                                            }

                                                            else if (
                                                                status === "PROGRESS"
                                                            ) {

                                                                color =
                                                                    "text-amber-400";

                                                            }

                                                            return (

                                                                <span className={`font-bold ${color}`}>

                                                                    {status.charAt(0) +
                                                                        status.slice(1).toLowerCase()}

                                                                </span>

                                                            );

                                                        })()}

                                                    </div>

                                                    <div className="px-4 h-full flex items-center">

                                                        {(() => {

                                                            const {
                                                                headerDelay
                                                            } =
                                                                calculateHeaderDelay(
                                                                    header
                                                                );

                                                            return headerDelay > 0 ? (

                                                                <span className="
                                            font-black
                                            text-red-400">

                                                                    {headerDelay} Day

                                                                </span>

                                                            ) : (

                                                                <span className="
                                            text-green-400
                                            font-bold">

                                                                    0 Day

                                                                </span>

                                                            );

                                                        })()}

                                                    </div>

                                                    {/* START */}
                                                    <div className="px-4 h-full flex items-center">

                                                        {
                                                            header.start_date ||
                                                            "-"
                                                        }

                                                    </div>

                                                    {/* END */}
                                                    <div className="px-4 h-full flex items-center">

                                                        {
                                                            header.end_date ||
                                                            "-"
                                                        }

                                                    </div>

                                                    {/* ACTION */}
                                                    <div className="p-4
                                            flex items-center
                                            gap-2">

                                                        {/* HIDE / UNHIDE */}
                                                        <button
                                                            onClick={() =>
                                                                handleToggleCollapse(
                                                                    header.id
                                                                )
                                                            }
                                                            className="h-10
                                                w-10
                                                rounded-xl
                                                bg-white/5
                                                border border-white/10
                                                text-white
                                                flex items-center
                                                justify-center
                                                hover:bg-white/10
                                                transition-all"
                                                        >

                                                            {collapsedHeaders.includes(
                                                                header.id
                                                            ) ? (

                                                                <ChevronRight
                                                                    size={16}
                                                                />

                                                            ) : (

                                                                <ChevronDown
                                                                    size={16}
                                                                />

                                                            )}

                                                        </button>

                                                        <button

                                                            disabled={
                                                                calculateHeaderDelay(
                                                                    header
                                                                ).headerDelay > 0 &&

                                                                currentUser?.role !==
                                                                "Manager"
                                                            }

                                                            onClick={() =>
                                                                handleEditHeader(
                                                                    header
                                                                )
                                                            }

                                                            className={`h-10
                                                w-10
                                                rounded-xl
                                                bg-amber-500/10
                                                border border-amber-500/20
                                                text-amber-400
                                                flex items-center
                                                justify-center
                                                transition-all

                                        ${calculateHeaderDelay(
                                                                header
                                                            ).headerDelay > 0 &&

                                                                    currentUser?.role !==
                                                                    "Manager"

                                                                    ? "opacity-30 cursor-not-allowed"

                                                                    : "hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.35)]"
                                                                }
    `}
                                                        >

                                                            <Pencil
                                                                size={16}
                                                            />

                                                        </button>

                                                        {/* ADD SUB TASK */}
                                                        <button
                                                            onClick={() => {

                                                                setSelectedHeader(
                                                                    header
                                                                );

                                                                setShowAddSubTask(
                                                                    true
                                                                );

                                                            }}
                                                            className="h-10
                                                w-10
                                                rounded-xl
                                                bg-cyan-500/10
                                                border border-cyan-500/20
                                                text-cyan-400
                                                flex items-center
                                                justify-center
                                                hover:bg-cyan-500/20
                                                transition-all"
                                                        >

                                                            <Plus
                                                                size={16}
                                                            />

                                                        </button>

                                                        {/* DELETE */}
                                                        <button


                                                            onClick={() =>
                                                                handleDeleteHeader(
                                                                    header.id
                                                                )
                                                            }
                                                            className="h-10
                                                w-10
                                                rounded-xl
                                                bg-red-500/10
                                                border border-red-500/20
                                                text-red-400
                                                flex items-center
                                                justify-center
                                                hover:bg-red-500/20
                                                hover:shadow-[0_0_15px_rgba(255,0,0,0.35)]
                                                transition-all"
                                                        >

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        </button>

                                                    </div>
                                                </div>

                                                {/* GANTT HEADER */}
                                                <div className="
                                                        relative
                                                        border-l
                                                        border-white/10
                                                        h-[72px]
                                                        overflow-hidden
                                                        shrink-0
                                                        w-[4160px]
                                                    ">

                                                    <div className="
                                                        relative
                                                        w-[4160px]
                                                        h-full
                                                        gantt-body
                                                    ">

                                                        {/* GRID */}
                                                        <div className="
                                                    absolute
                                                    inset-0
                                                    flex
                                                    ">

                                                            {weeks.map((week) => (

                                                                <div
                                                                    key={week}
                                                                    className="
                                                            w-[80px]
                                                            shrink-0
                                                            border-r
                                                            border-white/5
                                                            "
                                                                />

                                                            ))}

                                                        </div>

                                                        {/* BAR */}
                                                        {header.start_date &&
                                                            header.end_date && (() => {

                                                                const startWeek =
                                                                    getWeekNumber(
                                                                        header.start_date
                                                                    );

                                                                const endWeek =
                                                                    getWeekNumber(
                                                                        header.end_date
                                                                    );

                                                                return (

                                                                    <div
                                                                        className="
                                                                absolute
                                                                top-1/2
                                                                -translate-y-1/2
                                                                h-[32px]
                                                                rounded-xl
                                                                bg-gradient-to-r
                                                                from-cyan-500
                                                                to-blue-500
                                                                shadow-[0_0_20px_rgba(0,255,255,0.35)]
                                                                "
                                                                        style={{

                                                                            left:
                                                                                `${(startWeek - 1) * 80}px`,

                                                                            width:
                                                                                `${(endWeek - startWeek + 1) * 80}px`

                                                                        }}
                                                                    />

                                                                );

                                                            })()}

                                                    </div>

                                                </div>
                                            </div>

                                            {!collapsedHeaders.includes(
                                                header.id
                                            ) &&
                                                subTaskList
                                                    .filter(
                                                        (x) =>
                                                            x.header_id ===
                                                            header.id
                                                    )
                                                    .sort((a, b) => {

                                                        // ======================
                                                        // WORKFLOW ORDER
                                                        // ======================

                                                        const workflowOrder = [

                                                            "Design",
                                                            "RFQ",
                                                            "PR",
                                                            "PO",
                                                            "Shipping",
                                                            "Installation",
                                                            "Debugging",
                                                            "Validation",
                                                            "Pilot Run",
                                                            "SOP"

                                                        ];

                                                        const activityA =
                                                            workflowOrder.indexOf(
                                                                a.activity
                                                            );

                                                        const activityB =
                                                            workflowOrder.indexOf(
                                                                b.activity
                                                            );

                                                        // ======================
                                                        // SORT ACTIVITY
                                                        // ======================

                                                        if (activityA !== activityB) {

                                                            return activityA - activityB;

                                                        }

                                                        // ======================
                                                        // PLAN FIRST
                                                        // ======================

                                                        if (
                                                            a.remark === "PLAN" &&
                                                            b.remark === "ACTUAL"
                                                        ) {

                                                            return -1;

                                                        }

                                                        if (
                                                            a.remark === "ACTUAL" &&
                                                            b.remark === "PLAN"
                                                        ) {

                                                            return 1;

                                                        }

                                                        return 0;

                                                    })
                                                    .map(
                                                        (
                                                            sub,
                                                            subIndex
                                                        ) => (

                                                            <div
                                                                key={sub.id}
                                                                className="
                                                                flex
                                                                min-w-[5500px]
                                                                bg-gradient-to-r
                                                                from-[#081018]
                                                                to-[#0b1120]
                                                                hover:from-[#101827]
                                                                hover:to-[#0f172a]
                                                                transition-all
                                                                duration-300
                                                                border-b border-white/5
                                                                text-white
                                                                "
                                                            >
                                                                <div
                                                                    className="
    grid
    grid-cols-[70px_300px_140px_180px_120px_120px_120px_120px_180px]
    shrink-0
    sticky
    left-0
    z-10
    bg-[#081018]
">
                                                                    <div className="p-4
                                                        text-slate-400">

                                                                        {index + 1}.
                                                                        {subIndex + 1}

                                                                    </div>

                                                                    <div className="p-4
                                                pl-14
                                                font-semibold
                                                text-slate-200
                                                tracking-wide">

                                                                        └ {sub.activity}

                                                                    </div>

                                                                    {/* REMARK */}
                                                                    <div className={`p-4 font-bold ${sub.remark === "PLAN"
                                                                        ? "text-cyan-400"
                                                                        : "text-green-400"
                                                                        }`}>

                                                                        {sub.remark}

                                                                    </div>

                                                                    <div className="p-4 text-cyan-400">

                                                                        {
                                                                            sub.assigned_to
                                                                        }

                                                                    </div>

                                                                    <div className="px-4 h-full flex items-center">

                                                                        {(() => {

                                                                            // ======================
                                                                            // PLAN = NO STATUS
                                                                            // ======================

                                                                            if (
                                                                                sub.remark === "PLAN"
                                                                            ) {

                                                                                return (
                                                                                    <span className="text-slate-600">
                                                                                    </span>
                                                                                );

                                                                            }

                                                                            // ======================
                                                                            // FIND PLAN TASK
                                                                            // ======================

                                                                            const planTask =
                                                                                subTaskList.find(
                                                                                    (x) =>

                                                                                        x.header_id ===
                                                                                        sub.header_id &&

                                                                                        x.activity ===
                                                                                        sub.activity &&

                                                                                        x.remark ===
                                                                                        "PLAN"
                                                                                );

                                                                            const today =
                                                                                new Date();

                                                                            today.setHours(
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0
                                                                            );

                                                                            // ======================
                                                                            // DONE
                                                                            // ======================

                                                                            if (
                                                                                sub.end_date
                                                                            ) {

                                                                                return (

                                                                                    <span className="font-bold text-green-400">

                                                                                        Done

                                                                                    </span>

                                                                                );

                                                                            }

                                                                            // ======================
                                                                            // DELAY
                                                                            // ======================

                                                                            if (
                                                                                planTask?.end_date
                                                                            ) {

                                                                                const planEnd =
                                                                                    new Date(
                                                                                        planTask.end_date
                                                                                    );

                                                                                planEnd.setHours(
                                                                                    0,
                                                                                    0,
                                                                                    0,
                                                                                    0
                                                                                );

                                                                                if (
                                                                                    today > planEnd
                                                                                ) {

                                                                                    return (

                                                                                        <span className="font-bold text-red-400">

                                                                                            Delay

                                                                                        </span>

                                                                                    );

                                                                                }

                                                                            }

                                                                            // ======================
                                                                            // PROGRESS
                                                                            // ======================

                                                                            if (
                                                                                sub.start_date
                                                                            ) {

                                                                                return (

                                                                                    <span className="font-bold text-amber-400">

                                                                                        Progress

                                                                                    </span>

                                                                                );

                                                                            }

                                                                            // ======================
                                                                            // OPEN
                                                                            // ======================

                                                                            return (

                                                                                <span className="font-bold text-cyan-400">

                                                                                    Open

                                                                                </span>

                                                                            );

                                                                        })()}

                                                                    </div>

                                                                    {/* TOTAL DELAY */}
                                                                    <div className="px-4 h-full flex items-center">

                                                                        {(() => {

                                                                            // PLAN NO DELAY
                                                                            if (
                                                                                sub.remark === "PLAN"
                                                                            ) {

                                                                                return (
                                                                                    <span className="text-slate-600">

                                                                                    </span>
                                                                                );

                                                                            }

                                                                            const planTask =
                                                                                subTaskList.find(
                                                                                    (x) =>

                                                                                        x.header_id ===
                                                                                        sub.header_id &&

                                                                                        x.activity ===
                                                                                        sub.activity &&

                                                                                        x.remark ===
                                                                                        "PLAN"
                                                                                );

                                                                            if (
                                                                                !planTask?.end_date
                                                                            ) {

                                                                                return (
                                                                                    <span className="text-green-400 font-bold">
                                                                                        0 Day
                                                                                    </span>
                                                                                );

                                                                            }

                                                                            const today =
                                                                                new Date();

                                                                            today.setHours(
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0
                                                                            );

                                                                            const planEnd =
                                                                                new Date(
                                                                                    planTask.end_date
                                                                                );

                                                                            planEnd.setHours(
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0
                                                                            );

                                                                            let actualEnd =
                                                                                today;

                                                                            if (
                                                                                sub.end_date
                                                                            ) {

                                                                                actualEnd =
                                                                                    new Date(
                                                                                        sub.end_date
                                                                                    );

                                                                                actualEnd.setHours(
                                                                                    0,
                                                                                    0,
                                                                                    0,
                                                                                    0
                                                                                );

                                                                            }

                                                                            if (
                                                                                actualEnd >
                                                                                planEnd
                                                                            ) {

                                                                                const diff =
                                                                                    Math.floor(
                                                                                        (
                                                                                            actualEnd -
                                                                                            planEnd
                                                                                        ) /
                                                                                        (
                                                                                            1000 *
                                                                                            60 *
                                                                                            60 *
                                                                                            24
                                                                                        )
                                                                                    );

                                                                                return (

                                                                                    <span className="
                                                                font-black
                                                                text-red-400">

                                                                                        {diff} Day

                                                                                    </span>

                                                                                );

                                                                            }

                                                                            return (

                                                                                <span className="
                                                            text-green-400
                                                            font-bold">

                                                                                    0 Day

                                                                                </span>

                                                                            );

                                                                        })()}

                                                                    </div>

                                                                    <div className="px-4 h-full flex items-center">

                                                                        {
                                                                            sub.start_date
                                                                        }

                                                                    </div>

                                                                    <div className="px-4 h-full flex items-center">

                                                                        {
                                                                            sub.end_date
                                                                        }

                                                                    </div>

                                                                    <div className="p-4
                                                        flex items-center
                                                        gap-2">

                                                                        {/* EDIT */}
                                                                        <button
                                                                            onClick={() =>
                                                                                handleEditSubTask(
                                                                                    sub
                                                                                )
                                                                            }
                                                                            className="h-9
                                                                w-9
                                                                rounded-lg
                                                                bg-amber-500/10
                                                                border border-amber-500/20
                                                                text-amber-400
                                                                flex items-center
                                                                justify-center"
                                                                        >

                                                                            <Pencil
                                                                                size={14}
                                                                            />

                                                                        </button>

                                                                        {/* DELETE */}
                                                                        <button
                                                                            disabled={
                                                                                sub.activity === "Validation" ||
                                                                                sub.activity === "Pilot Run" ||
                                                                                sub.activity === "SOP"
                                                                            }

                                                                            onClick={() =>
                                                                                handleDeleteSubTask(
                                                                                    sub
                                                                                )
                                                                            }
                                                                            className="h-9
                                                                w-9
                                                                rounded-lg
                                                                bg-red-500/10
                                                                border border-red-500/20
                                                                text-red-400
                                                                flex items-center
                                                                justify-center"
                                                                        >

                                                                            <Trash2
                                                                                size={14}
                                                                            />

                                                                        </button>

                                                                    </div>
                                                                </div>
                                                                {/* GANTT SUBTASK */}
                                                                <div className="
                                                                        relative
                                                                        border-l
                                                                        border-white/10
                                                                        h-[64px]
                                                                        overflow-hidden
                                                                        shrink-0
                                                                        w-[4160px]
                                                                    ">

                                                                    <div className="
                                                                            relative
                                                                            w-[4160px]
                                                                            h-full
                                                                            gantt-body
                                                                        ">

                                                                        {/* GRID */}
                                                                        <div className="
                                                                    absolute
                                                                    inset-0
                                                                    flex
                                                                    ">

                                                                            {weeks.map((week) => (

                                                                                <div
                                                                                    key={week}
                                                                                    className="
                                                                            w-[80px]
                                                                            shrink-0
                                                                            border-r
                                                                            border-white/5
                                                                            "
                                                                                />

                                                                            ))}

                                                                        </div>

                                                                        {/* BAR */}
                                                                        {sub.start_date &&
                                                                            sub.end_date && (() => {

                                                                                const startWeek =
                                                                                    getWeekNumber(
                                                                                        sub.start_date
                                                                                    );

                                                                                const endWeek =
                                                                                    getWeekNumber(
                                                                                        sub.end_date
                                                                                    );

                                                                                return (

                                                                                    <div
                                                                                        className={`
                                                                                absolute
                                                                                top-1/2
                                                                                -translate-y-1/2
                                                                                h-[22px]
                                                                                rounded-lg

                                                                                ${sub.remark === "PLAN"
                                                                                                ? "bg-cyan-500"
                                                                                                : "bg-green-500"
                                                                                            }
                                                                                `}
                                                                                        style={{

                                                                                            left:
                                                                                                `${(startWeek - 1) * 80}px`,

                                                                                            width:
                                                                                                `${(endWeek - startWeek + 1) * 80}px`

                                                                                        }}
                                                                                    />

                                                                                );

                                                                            })()}

                                                                    </div>

                                                                </div>
                                                            </div>

                                                        )
                                                    )}

                                        </div>

                                    )
                                )}

                                {/* LOADING */}
                                {loading && (

                                    <div className="p-16
                    text-center
                    text-slate-500">

                                        Loading task...

                                    </div>

                                )}

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ADD SUB TASK MODAL */}
            {
                showAddSubTask && (

                    <div className="fixed inset-0
                z-50
                bg-black/60
                backdrop-blur-sm
                flex items-center
                justify-center
                p-6">

                        <div className="w-full
                    max-w-xl
                    rounded-[32px]
                    border border-cyan-500/10
                    bg-[rgba(7,17,31,0.82)]
                    backdrop-blur-2xl
                    shadow-[0_0_60px_rgba(0,255,255,0.08)]
                    p-8">

                            <h1 className="text-3xl
                        font-black
                        text-white">

                                {editingSubTask
                                    ? "Edit Sub Task"
                                    : "Add Sub Task"}

                            </h1>

                            <div className="mt-8 space-y-5">
                                {
                                    !editingSubTask ? (
                                        <div className="
    grid
    grid-cols-2
    gap-3
">

                                            {workflowOptions.map(
                                                (item) => {

                                                    const checked =
                                                        selectedWorkflow.includes(
                                                            item
                                                        );

                                                    return (

                                                        <button
                                                            key={item}
                                                            type="button"
                                                            onClick={() => {

                                                                // ======================
                                                                // EXISTING ACTIVITY
                                                                // ======================

                                                                const existingActivities =
                                                                    subTaskList
                                                                        .filter(
                                                                            (x) =>
                                                                                x.header_id ===
                                                                                selectedHeader?.id
                                                                        )
                                                                        .map(
                                                                            (x) => x.activity
                                                                        );

                                                                // ======================
                                                                // LOCK PR & SOP
                                                                // ======================

                                                                const isMandatory =
                                                                    (
                                                                        item === "Validation" || item === "Pilot Run" ||
                                                                        item === "SOP"
                                                                    ) &&

                                                                    !existingActivities.includes(item);

                                                                // ======================
                                                                // CANNOT UNCHECK
                                                                // ======================

                                                                if (
                                                                    isMandatory &&
                                                                    selectedWorkflow.includes(item)
                                                                ) {

                                                                    return;

                                                                }

                                                                setSelectedWorkflow(
                                                                    (prev) => {

                                                                        if (
                                                                            prev.includes(item)
                                                                        ) {

                                                                            return prev.filter(
                                                                                (x) => x !== item
                                                                            );

                                                                        }

                                                                        return [
                                                                            ...prev,
                                                                            item
                                                                        ];

                                                                    }
                                                                );

                                                            }}
                                                            className={`
                    h-14
                    rounded-2xl
                    border
                    font-bold
                    transition-all

                    ${checked

                                                                    ? `
                        border-cyan-400
                        bg-cyan-500/20
                        text-cyan-300
                        shadow-[0_0_20px_rgba(0,255,255,0.25)]
                        `

                                                                    : `
                        border-white/10
                        bg-white/5
                        text-slate-400
                        hover:border-cyan-500/30
                        `
                                                                }
                    `}
                                                        >

                                                            {item}

                                                        </button>

                                                    );

                                                }
                                            )}

                                        </div>
                                    ) : (

                                        <>

                                            <div className="
        rounded-2xl
        border border-cyan-500/20
        bg-cyan-500/10
        p-4
    ">

                                                <p className="
            text-cyan-400
            text-sm
        ">
                                                    Activity
                                                </p>

                                                <h1 className="
            text-white
            font-black
            text-2xl
        ">
                                                    {editingSubTask.activity}
                                                </h1>

                                                <p className="
            text-green-400
            font-bold
            mt-2
        ">
                                                    {editingSubTask.remark}
                                                </p>

                                            </div>

                                            <select
                                                value={
                                                    subTask.assigned_to
                                                }
                                                onChange={(e) =>
                                                    setSubTask({

                                                        ...subTask,

                                                        assigned_to:
                                                            e.target.value

                                                    })
                                                }
                                                className="
        w-full
        h-14
        rounded-2xl
        border border-white/10
        bg-white/5
        px-5
        text-white
        outline-none
        "
                                            >

                                                <option value="">
                                                    Select Owner
                                                </option>

                                                {userList.map((user) => (

                                                    <option
                                                        key={user.username}
                                                        value={user.name}
                                                        className="bg-[#07111f]"
                                                    >

                                                        {user.name} - {user.role}

                                                    </option>

                                                ))}

                                            </select>

                                            <input
                                                type="date"
                                                value={subTask.start_date}
                                                onChange={(e) =>
                                                    setSubTask({

                                                        ...subTask,

                                                        start_date:
                                                            e.target.value

                                                    })
                                                }
                                                className="
        w-full
        h-14
        rounded-2xl
        border border-white/10
        bg-white/5
        px-5
        text-white
        "
                                            />

                                            <input
                                                type="date"
                                                value={subTask.end_date}
                                                onChange={(e) =>
                                                    setSubTask({

                                                        ...subTask,

                                                        end_date:
                                                            e.target.value

                                                    })
                                                }
                                                className="
        w-full
        h-14
        rounded-2xl
        border border-white/10
        bg-white/5
        px-5
        text-white
        "
                                            />

                                        </>
                                    )}



                                <div className="mt-8
                        flex justify-end
                        gap-3">

                                    <button
                                        onClick={() => {

                                            setShowAddSubTask(false);

                                            // RESET EDIT
                                            setEditingSubTask(null);

                                            // RESET HEADER
                                            setSelectedHeader(null);

                                            // RESET FORM
                                            setSubTask({

                                                activity: "",
                                                assigned_to: "",
                                                start_date: "",
                                                end_date: "",

                                            });
                                            setSelectedWorkflow([]);

                                        }}
                                        className="h-14
                                px-6
                                rounded-2xl
                                border border-white/10
                                text-white"
                                    >

                                        Cancel

                                    </button>

                                    <button
                                        onClick={
                                            handleSaveSubTask
                                        }
                                        className="h-14
                                px-6
                                rounded-2xl
                                bg-gradient-to-r
                                from-cyan-500
                                to-green-500
                                text-white
                                font-bold"
                                    >

                                        Save Sub Task

                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>
                )
            }

            {/* ADD TASK MODAL */}
            {
                showAddTask && (

                    <div className="fixed inset-0
                z-50
                bg-black/60
                backdrop-blur-sm
                flex items-center
                justify-center
                p-6">

                        <div className="w-full
                    max-w-xl
                    rounded-[32px]
                    border border-cyan-500/10
                    bg-[#07111f]
                    p-8">

                            {/* TITLE */}
                            <h1 className="text-3xl
                        font-black
                        text-white">

                                {
                                    editingHeader
                                        ? "Edit Task Header"
                                        : "Create Task Header"
                                }

                            </h1>

                            {/* FORM */}
                            <div className="mt-8
                        space-y-5">

                                {/* TASK TITLE */}
                                <div>

                                    <label className="text-sm
                                text-slate-400">

                                        Task Title

                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            taskHeader.title
                                        }
                                        onChange={(e) =>
                                            setTaskHeader({

                                                ...taskHeader,

                                                title:
                                                    e.target.value

                                            })
                                        }
                                        className="mt-2
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/5
                                    px-5
                                    text-white
                                    outline-none"
                                        placeholder="Create The Task"
                                    />

                                </div>

                                {/* ASSIGNED */}
                                <div>

                                    <label className="text-sm
                                text-slate-400">

                                        Assigned To

                                    </label>

                                    <select
                                        value={
                                            taskHeader.assigned_to
                                        }
                                        onChange={(e) =>
                                            setTaskHeader({

                                                ...taskHeader,

                                                assigned_to:
                                                    e.target.value

                                            })
                                        }
                                        className="mt-2
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/5
                                    px-5
                                    text-white
                                    outline-none"
                                    >

                                        <option value="">
                                            Select Owner
                                        </option>

                                        {userList.map((user) => (

                                            <option
                                                key={user.username}
                                                value={user.name}
                                                className="bg-[#07111f]"
                                            >

                                                {user.name} - {user.role}

                                            </option>

                                        ))}

                                    </select>

                                </div>

                                {/* START DATE */}
                                <div>

                                    <label className="text-sm
                                text-slate-400">

                                        Start Date

                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            taskHeader.start_date
                                        }
                                        onChange={(e) =>
                                            setTaskHeader({

                                                ...taskHeader,

                                                start_date:
                                                    e.target.value

                                            })
                                        }
                                        className="mt-2
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/5
                                    px-5
                                    text-white
                                    outline-none"
                                    />

                                </div>

                                {/* END DATE */}
                                <div>

                                    <label className="text-sm
                                text-slate-400">

                                        End Date

                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            taskHeader.end_date
                                        }
                                        onChange={(e) =>
                                            setTaskHeader({

                                                ...taskHeader,

                                                end_date:
                                                    e.target.value

                                            })
                                        }
                                        className="mt-2
                                    w-full
                                    h-14
                                    rounded-2xl
                                    border border-white/10
                                    bg-white/5
                                    px-5
                                    text-white
                                    outline-none"
                                    />

                                </div>

                            </div>

                            {/* BUTTON */}
                            <div className="mt-8
                        flex justify-end
                        gap-3">

                                <button
                                    onClick={() => {

                                        setShowAddTask(false);

                                        // RESET EDIT
                                        setEditingHeader(null);

                                        // RESET FORM
                                        setTaskHeader({

                                            title: "",
                                            assigned_to: "",
                                            start_date: "",
                                            end_date: "",

                                        });
                                        setSelectedWorkflow([]);

                                    }}
                                    className="h-14
                                px-6
                                rounded-2xl
                                border border-white/10
                                text-white"
                                >

                                    Cancel

                                </button>

                                <button
                                    onClick={
                                        handleSaveTaskHeader
                                    }
                                    className="h-14
                                px-6
                                rounded-2xl
                                bg-gradient-to-r
                                from-cyan-500
                                to-green-500
                                text-white
                                font-bold"
                                >

                                    {
                                        editingHeader
                                            ? "Update Task"
                                            : "Save Task"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div >

    );

}
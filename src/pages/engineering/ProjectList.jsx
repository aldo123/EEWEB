import {
    useEffect,
    useState,
} from "react";

import {
    Plus,
    Search,
    FileSpreadsheet,
    Upload,
    Pencil,
    Trash2,
    MessageSquare,
    X,
} from "lucide-react";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";

import { supabase }
    from "../../supabase/supabase";

import ActivityDetail
    from "./ActivityDetail";

export default function ProjectList() {

    const [projects, setProjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");


    const [openModal, setOpenModal] =
        useState(false);

    const [editMode, setEditMode] =
        useState(false);

    const [selectedProject, setSelectedProject] =
        useState(null);

    const [siteList, setSiteList] =
        useState([]);


    const [userList, setUserList] =
        useState([]);

    const [taskHeaders, setTaskHeaders] =
        useState([]);

    const [subTasks, setSubTasks] =
        useState([]);

    const [formData, setFormData] =
        useState({
            title: "",
            type: "",
            site: "",
            tpm: "",
            ee: [],
        });

    const [openEngineerSelect,
        setOpenEngineerSelect] =
        useState(false);

    const [selectedProjectActivity,
        setSelectedProjectActivity] =
        useState(null);

    // =========================
    // PROJECT FILTER
    // =========================
    const [projectFilter,
        setProjectFilter] =
        useState("ALL");

    const [trendMode, setTrendMode] =
        useState("PLAN");

    const [dashboardFilter,
        setDashboardFilter] =
        useState("ALL");

    const [selectedEngineer, setSelectedEngineer] =
        useState("ALL");

    const [selectedHeader, setSelectedHeader] =
        useState(null);

    const [selectedProjectType,
        setSelectedProjectType] =
        useState("ALL");

    const [commentModal, setCommentModal] =
        useState(false);

    const [selectedCommentTask,
        setSelectedCommentTask] =
        useState(null);

    const [commentText,
        setCommentText] =
        useState("");

    const handleOpenTask = (header) => {

        const project =
            projects.find(
                p =>
                    String(p.id) ===
                    String(header.project_id)
            );

        if (!project) return;

        setSelectedProjectActivity({
            ...project,
            selectedHeaderId: header.id
        });

    };
    // =========================
    // LOAD PROJECTS
    // =========================
    const loadProjects = async () => {

        try {

            setLoading(true);

            const { data, error } =
                await supabase
                    .from("projects")
                    .select("*")
                    .order("id", {
                        ascending: true,
                    });

            if (error) {

                console.log(error);

                return;

            }

            setProjects(data || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const loadTaskData = async () => {

        try {

            // ======================
            // LOAD TASK HEADER
            // ======================

            const {
                data: headerData,
                error: headerError
            } = await supabase
                .from("task_headers")
                .select("*");

            if (headerError) {

                console.log(headerError);

                return;

            }

            // ======================
            // LOAD SUB TASK
            // ======================

            const {
                data: subData,
                error: subError
            } = await supabase
                .from("sub_tasks")
                .select("*");

            if (subError) {

                console.log(subError);

                return;

            }

            setTaskHeaders(headerData || []);

            setSubTasks(subData || []);

        } catch (error) {

            console.log(error);

        }

    };

    // =========================
    // LOAD SITES
    // =========================
    const loadSites = async () => {

        try {

            const { data, error } =
                await supabase
                    .from("sites")
                    .select("*")
                    .order("site", {
                        ascending: true,
                    });

            if (error) {

                console.log(error);

                return;

            }

            setSiteList(data || []);

        } catch (error) {

            console.log(error);

        }

    };

    // =========================
    // LOAD USERS
    // =========================
    const loadUsers = async () => {

        try {

            const { data, error } =
                await supabase
                    .from("users")
                    .select("*");

            if (error) {

                console.log(error);

                return;

            }

            setUserList(data || []);

        } catch (error) {

            console.log(error);

        }

    };

    useEffect(() => {

        loadProjects();
        loadTaskData();
        loadSites();
        loadUsers();

    }, []);

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
    // FILTER ROLE
    // =========================
    const engineerList =
        userList.filter(
            (u) =>
                u.role === "Engineer"
        );

    const tpmList =
        userList.filter(
            (u) =>
                u.role === "Manager" ||
                u.role === "Admin"
        );

    // =========================
    // ENGINEER WORKLOAD
    // =========================
    const getHeaderStatus = (header) => {

        const relatedSubs =
            subTasks.filter(
                sub =>
                    String(sub.header_id) ===
                    String(header.id)
            );

        const planTasks =
            relatedSubs.filter(
                sub =>
                    String(sub.remark)
                        .toUpperCase() ===
                    "PLAN"
            );

        const actualTasks =
            relatedSubs.filter(
                sub =>
                    String(sub.remark)
                        .toUpperCase() ===
                    "ACTUAL"
            );

        const hasProgress =

            planTasks.some(
                x =>
                    x.start_date &&
                    x.end_date
            )

            ||

            actualTasks.some(
                x =>
                    x.start_date &&
                    x.end_date
            );

        const allActualDone =

            actualTasks.length > 0 &&

            actualTasks.every(
                x =>
                    x.start_date &&
                    x.end_date
            );

        if (allActualDone)
            return "DONE";

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        if (header.end_date) {

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
                today > endDate
            ) {

                return "DELAY";

            }

        }

        if (hasProgress)
            return "PROGRESS";

        return "OPEN";

    };

    const filteredHeaders =
        taskHeaders.filter(
            (header) => {

                const project =
                    projects.find(
                        p =>
                            String(p.id) ===
                            String(header.project_id)
                    );

                const typeMatch =

                    selectedProjectType === "ALL"

                    ||

                    project?.type ===
                    selectedProjectType;

                const statusMatch =

                    dashboardFilter === "ALL"

                    ||

                    getHeaderStatus(header)
                    === dashboardFilter;

                const engineerMatch =

                    selectedEngineer === "ALL"

                    ||

                    String(
                        header.assigned_to || ""
                    )
                        .trim()
                        .toLowerCase()

                    ===

                    String(
                        selectedEngineer || ""
                    )
                        .trim()
                        .toLowerCase();

                return (
                    typeMatch &&
                    statusMatch &&
                    engineerMatch
                );

            }
        );

    const sourceHeaders =
        dashboardFilter === "ALL"
            ? taskHeaders
            : taskHeaders.filter(
                h =>
                    getHeaderStatus(h) ===
                    dashboardFilter
            );

    const workloadHeaders =
        taskHeaders.filter((header) => {

            const project =
                projects.find(
                    p =>
                        String(p.id) ===
                        String(header.project_id)
                );

            const typeMatch =
                selectedProjectType === "ALL"
                ||
                project?.type === selectedProjectType;

            const statusMatch =
                dashboardFilter === "ALL"
                ||
                getHeaderStatus(header) === dashboardFilter;

            return (
                typeMatch &&
                statusMatch
            );

        });

    const engineerWorkload =
        engineerList
            .map((eng) => {

                const taskCount =
                    workloadHeaders.filter(
                        header =>
                            String(header.assigned_to || "")
                                .trim()
                                .toLowerCase()
                            ===
                            String(eng.name || "")
                                .trim()
                                .toLowerCase()
                    ).length;

                return {
                    name: eng.name,
                    taskCount
                };

            })

            .sort(
                (a, b) =>
                    b.taskCount - a.taskCount
            );



    const maxWorkload =
        engineerWorkload[0]?.taskCount || 1;

    // =========================
    // SAVE PROJECT
    // =========================
    const handleSaveProject = async () => {

        try {

            if (
                !formData.title ||
                !formData.type ||
                !formData.site ||
                !formData.tpm ||
                !formData.ee
            ) {

                alert(
                    "Please complete all fields"
                );

                return;

            }

            if (editMode) {

                const { error } =
                    await supabase
                        .from("projects")
                        .update({

                            title:
                                formData.title,

                            type:
                                formData.type,

                            site:
                                formData.site,

                            tpm:
                                formData.tpm,

                            ee:
                                formData.ee,

                        })
                        .eq(
                            "id",
                            selectedProject.id
                        );

                if (error) throw error;

            } else {

                const { error } =
                    await supabase
                        .from("projects")
                        .insert([
                            {

                                id: Date.now(),

                                title:
                                    formData.title,

                                type:
                                    formData.type,

                                site:
                                    formData.site,

                                tpm:
                                    formData.tpm,

                                ee:
                                    formData.ee,

                            },
                        ]);

                if (error) throw error;

            }

            // =========================
            // RESET
            // =========================
            setOpenModal(false);

            setEditMode(false);

            setSelectedProject(null);

            setFormData({
                title: "",
                type: "",
                site: "",
                tpm: "",
                ee: [],
            });

            // =========================
            // RELOAD
            // =========================
            loadProjects();

        } catch (error) {

            console.log(error);

            alert(error.message);

        }

    };

    // =========================
    // DELETE PROJECT
    // =========================
    const handleDeleteProject =
        async (projectId) => {

            const confirmDelete =
                window.confirm(
                    "Delete this project and all activities?"
                );

            if (!confirmDelete) return;

            try {

                // =====================
                // GET HEADER TASK
                // =====================

                const {
                    data: headers,
                    error: headerError
                } = await supabase
                    .from("task_headers")
                    .select("id")
                    .eq(
                        "project_id",
                        projectId
                    );

                if (headerError)
                    throw headerError;

                const headerIds =
                    (headers || [])
                        .map(x => x.id);

                // =====================
                // DELETE SUB TASK
                // =====================

                if (
                    headerIds.length > 0
                ) {

                    const {
                        error: subError
                    } = await supabase
                        .from("sub_tasks")
                        .delete()
                        .in(
                            "header_id",
                            headerIds
                        );

                    if (subError)
                        throw subError;

                }

                // =====================
                // DELETE HEADER TASK
                // =====================

                const {
                    error: deleteHeaderError
                } = await supabase
                    .from("task_headers")
                    .delete()
                    .eq(
                        "project_id",
                        projectId
                    );

                if (
                    deleteHeaderError
                )
                    throw deleteHeaderError;

                // =====================
                // DELETE PROJECT
                // =====================

                const {
                    error: projectError
                } = await supabase
                    .from("projects")
                    .delete()
                    .eq(
                        "id",
                        projectId
                    );

                if (projectError)
                    throw projectError;

                // =====================
                // REFRESH
                // =====================

                await loadProjects();

                await loadTaskData();

                alert(
                    "Project deleted successfully"
                );

            } catch (error) {

                console.log(error);

                alert(
                    error.message
                );

            }

        };


    // =========================
    // VIEW ACTIVITY
    // =========================
    const handleViewActivity =
        (project) => {

            setSelectedProjectActivity(
                project
            );

        };


    // =========================
    // FILTER PROJECT
    // =========================
    const filteredProjects =
        projects.filter((item) => {

            const keyword =
                search.toLowerCase();

            // ======================
            // SEARCH FILTER
            // ======================

            const matchEngineer =

                Array.isArray(item.ee)

                    ? item.ee.some(
                        (name) =>
                            name
                                ?.toLowerCase()
                                .includes(keyword)
                    )

                    : item.ee
                        ?.toLowerCase()
                        .includes(keyword);

            const matchSearch = (

                item.title
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.site
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                matchEngineer

                ||

                item.tpm
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.type
                    ?.toLowerCase()
                    .includes(keyword)

            );

            // ======================
            // MY PROJECT FILTER
            // ======================

            let matchProject = true;

            if (
                projectFilter === "MY"
            ) {

                const matchEngineerProject =

                    Array.isArray(item.ee)

                        ? item.ee.includes(currentUser?.name)

                        : item.ee === currentUser?.name;

                matchProject = (

                    item.tpm === currentUser?.name

                    ||

                    matchEngineerProject

                );

            }

            return (
                matchSearch &&
                matchProject
            );

        });


    if (selectedProjectActivity) {

        return (

            <ActivityDetail
                project={selectedProjectActivity}

                onBack={() =>
                    setSelectedProjectActivity(null)
                }

                refreshProjects={async () => {

                    await loadProjects();

                    await loadTaskData();

                }}
            />

        );

    }

    const getProjectProgress =
        (projectId) => {

            // ======================
            // GET ALL HEADER TASK
            // ======================

            const headers =
                taskHeaders.filter((header) => {

                    return (
                        String(header.project_id) ===
                        String(projectId)
                    );

                });

            // ======================
            // TOTAL HEADER
            // ======================

            const totalHeaders =
                headers.length;

            // ======================
            // DONE HEADER COUNTER
            // ======================

            let completedHeaders = 0;

            // ======================
            // LOOP HEADER
            // ======================

            headers.forEach((header) => {

                // ======================
                // GET SUB TASK
                // ======================

                const headerSubTasks =
                    subTasks.filter((sub) => {

                        return (
                            String(sub.header_id) ===
                            String(header.id)
                        );

                    });

                // ======================
                // GET ACTUAL ONLY
                // ======================

                const actualSubTasks =
                    headerSubTasks.filter((sub) => {

                        return (
                            String(sub.remark)
                                .toUpperCase() ===
                            "ACTUAL"
                        );

                    });

                // ======================
                // NO ACTUAL
                // ======================

                if (actualSubTasks.length === 0) {

                    return;

                }

                // ======================
                // CHECK ALL DONE
                // ======================

                const allActualDone =
                    actualSubTasks.every((sub) => {

                        return (
                            sub.end_date !== null &&
                            sub.end_date !== ""
                        );

                    });

                // ======================
                // HEADER COMPLETE
                // ======================

                if (allActualDone) {

                    completedHeaders++;

                }

            });

            // ======================
            // PROGRESS
            // ======================

            const progress =
                totalHeaders > 0
                    ? Math.round(
                        (
                            completedHeaders /
                            totalHeaders
                        ) * 100
                    )
                    : 0;

            return {

                progress,

                done:
                    completedHeaders,

                total:
                    totalHeaders

            };

        };

    const typeSourceHeaders =
        taskHeaders.filter((header) => {

            const statusMatch =

                dashboardFilter === "ALL"

                ||

                getHeaderStatus(header) ===
                dashboardFilter;

            const engineerMatch =

                selectedEngineer === "ALL"

                ||

                String(
                    header.assigned_to || ""
                )
                    .trim()
                    .toLowerCase()

                ===

                String(
                    selectedEngineer || ""
                )
                    .trim()
                    .toLowerCase();

            return (
                statusMatch &&
                engineerMatch
            );

        });
    // =========================
    // SUMMARY CARD
    // =========================
    const totalNPI =
        typeSourceHeaders.filter((x) => {

            const project =
                projects.find(
                    (p) =>
                        String(p.id) ===
                        String(x.project_id)
                );

            return (
                project?.type === "NPI"
            );

        }).length;

    const totalKaizen =
        typeSourceHeaders.filter((x) => {

            const project =
                projects.find(
                    (p) =>
                        String(p.id) ===
                        String(x.project_id)
                );

            return (
                project?.type === "KAIZEN"
            );

        }).length;

    const totalDT =
        typeSourceHeaders.filter((x) => {

            const project =
                projects.find(
                    (p) =>
                        String(p.id) ===
                        String(x.project_id)
                );

            return (
                project?.type ===
                "Downtime and Finding"
            );

        }).length;

    const totalVAVE =
        typeSourceHeaders.filter((x) => {

            const project =
                projects.find(
                    (p) =>
                        String(p.id) ===
                        String(x.project_id)
                );

            return (
                project?.type === "VAVE"
            );

        }).length;

    const totalProject =
        filteredHeaders.length;

    const getHeaderSummary = (
        headers = filteredHeaders
    ) => {

        let doneCount = 0;
        let progressCount = 0;
        let openCount = 0;
        let delayCount = 0;

        headers.forEach((header) => {

            const relatedSubs =
                subTasks.filter(
                    sub =>
                        String(sub.header_id) ===
                        String(header.id)
                );

            const planTasks =
                relatedSubs.filter(
                    sub =>
                        String(sub.remark)
                            .toUpperCase() ===
                        "PLAN"
                );

            const actualTasks =
                relatedSubs.filter(
                    sub =>
                        String(sub.remark)
                            .toUpperCase() ===
                        "ACTUAL"
                );

            const hasPlanProgress =

                planTasks.some(
                    x =>
                        x.start_date &&
                        x.end_date
                )

                ||

                actualTasks.some(
                    x =>
                        x.start_date &&
                        x.end_date
                );

            const allActualDone =

                actualTasks.length > 0 &&

                actualTasks.every(
                    x =>
                        x.start_date &&
                        x.end_date
                );

            if (allActualDone) {

                doneCount++;
                return;

            }

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            if (header.end_date) {

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

                    delayCount++;
                    return;

                }

            }

            if (hasPlanProgress) {

                progressCount++;
                return;

            }

            openCount++;

        });

        return {

            doneCount,
            progressCount,
            openCount,
            delayCount

        };

    };

    const globalSummary =
        getHeaderSummary(
            taskHeaders
        );

    const statusSummary =
        getHeaderSummary(
            filteredHeaders
        );

    const overdueProject =
        statusSummary.delayCount;

    const healthData = [

        {
            name: "Done",
            value: globalSummary.doneCount,
            color: "#00D084"
        },

        {
            name: "Progress",
            value: globalSummary.progressCount,
            color: "#FACC15"
        },

        {
            name: "Open",
            value: globalSummary.openCount,
            color: "#00B4FF"
        },

        {
            name: "Delay",
            value: globalSummary.delayCount,
            color: "#FF4D6D"
        }

    ];

    const typeData = [
        {
            name: "NPI",
            value: totalNPI,
            color: "#00B4FF"
        },
        {
            name: "KAIZEN",
            value: totalKaizen,
            color: "#00D084"
        },
        {
            name: "DT",
            value: totalDT,
            color: "#FACC15"
        },
        {
            name: "VAVE",
            value: totalVAVE,
            color: "#A855F7"
        }
    ];

    const trendData = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ].map((month, index) => {

        let monthHeaders = [];

        // ==========================
        // PLAN MODE
        // ==========================
        if (trendMode === "PLAN") {

            monthHeaders =
                filteredHeaders.filter(
                    (header) => {

                        if (
                            !header.end_date
                        )
                            return false;

                        return (
                            new Date(
                                header.end_date
                            ).getMonth()
                            ===
                            index
                        );

                    }
                );

        }

        // ==========================
        // ACTUAL MODE
        // ==========================
        else {

            monthHeaders =
                filteredHeaders.filter(
                    (header) => {

                        const actualSubs =
                            subTasks.filter(
                                (sub) =>
                                    String(
                                        sub.header_id
                                    ) ===
                                    String(
                                        header.id
                                    )
                                    &&
                                    String(
                                        sub.remark
                                    ).toUpperCase()
                                    ===
                                    "ACTUAL"
                            );

                        if (
                            actualSubs.length === 0
                        )
                            return false;

                        const allDone =
                            actualSubs.every(
                                (sub) =>
                                    sub.end_date
                            );

                        if (!allDone)
                            return false;

                        const latestDate =
                            actualSubs.reduce(
                                (latest, sub) => {

                                    const d =
                                        new Date(
                                            sub.end_date
                                        );

                                    return d > latest
                                        ? d
                                        : latest;

                                },
                                new Date(
                                    actualSubs[0]
                                        .end_date
                                )
                            );

                        return (
                            latestDate.getMonth()
                            ===
                            index
                        );

                    }
                );

        }

        return {

            month,

            NPI:
                monthHeaders.filter(
                    h => {

                        const project =
                            projects.find(
                                p =>
                                    String(
                                        p.id
                                    ) ===
                                    String(
                                        h.project_id
                                    )
                            );

                        return (
                            project?.type
                            ===
                            "NPI"
                        );

                    }
                ).length,

            KAIZEN:
                monthHeaders.filter(
                    h => {

                        const project =
                            projects.find(
                                p =>
                                    String(
                                        p.id
                                    ) ===
                                    String(
                                        h.project_id
                                    )
                            );

                        return (
                            project?.type
                            ===
                            "KAIZEN"
                        );

                    }
                ).length,

            DT:
                monthHeaders.filter(
                    h => {

                        const project =
                            projects.find(
                                p =>
                                    String(
                                        p.id
                                    ) ===
                                    String(
                                        h.project_id
                                    )
                            );

                        return (
                            project?.type
                            ===
                            "Downtime and Finding"
                        );

                    }
                ).length,

            VAVE:
                monthHeaders.filter(
                    h => {

                        const project =
                            projects.find(
                                p =>
                                    String(
                                        p.id
                                    ) ===
                                    String(
                                        h.project_id
                                    )
                            );

                        return (
                            project?.type
                            ===
                            "VAVE"
                        );

                    }
                ).length

        };

    });

    // =====================================
    // RECENT ALERTS (DELAY TASK)
    // =====================================
    const recentAlerts = filteredHeaders
        .filter((header) => {

            const status =
                getHeaderStatus(header);

            return status === "DELAY";

        })

        .map((header) => {

            const today = new Date();

            const endDate =
                new Date(header.end_date);

            const delayDays =
                Math.max(
                    0,
                    Math.floor(
                        (
                            today -
                            endDate
                        ) /
                        (1000 * 60 * 60 * 24)
                    )
                );

            return {
                ...header,
                delayDays
            };

        })

        .sort(
            (a, b) =>
                b.delayDays -
                a.delayDays
        )

        .slice(0, 10);


    // =====================================
    // UPCOMING DEADLINE
    // =====================================
    const upcomingDeadlines =
        filteredHeaders

            .filter((header) => {

                if (!header.end_date)
                    return false;

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const deadline =
                    new Date(
                        header.end_date
                    );

                deadline.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const diffDays =
                    (
                        deadline -
                        today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );

                return (
                    diffDays >= 0 &&
                    diffDays <= 14
                );

            })

            .sort(
                (a, b) =>
                    new Date(
                        a.end_date
                    ) -
                    new Date(
                        b.end_date
                    )
            )

            .slice(0, 10);


    const ongoingTasks =
        filteredHeaders

            .filter((header) => {

                if (!header.end_date)
                    return false;

                const status =
                    getHeaderStatus(header);

                if (
                    status === "DONE" ||
                    status === "DELAY"
                ) {
                    return false;
                }

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const deadline =
                    new Date(
                        header.end_date
                    );

                deadline.setHours(
                    0,
                    0,
                    0,
                    0
                );

                const diffDays =
                    (
                        deadline -
                        today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );

                return diffDays > 14;

            })

            .sort(
                (a, b) =>
                    new Date(a.end_date) -
                    new Date(b.end_date)
            )

            .slice(0, 10);

    const handleSaveComment =
        async (
            headerId,
            comment
        ) => {

            try {

                const { error } =
                    await supabase
                        .from("task_headers")
                        .update({
                            comment
                        })
                        .eq(
                            "id",
                            headerId
                        );

                if (error)
                    throw error;

                await loadTaskData();

            } catch (err) {

                console.log(err);

                alert(
                    err.message
                );

            }

        };

    return (

        <div className="
                relative
                space-y-4
                min-h-screen
                overflow-hidden

                
            ">


            <div className="
                    absolute
                    bottom-[-250px]
                    left-[-150px]

                    w-[600px]
                    h-[600px]

                    bg-blue-500/10
                    blur-[180px]
                    rounded-full

                    pointer-events-none
                "></div>

            {/* ===================================== */}
            {/* KPI DASHBOARD */}
            {/* ===================================== */}

            <div className="
                grid
                grid-cols-7
                gap-4
                ">

                {/* NPI */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-cyan-500/20

                    bg-gradient-to-br
                    from-cyan-500/10
                    to-cyan-500/5

                    backdrop-blur-xl
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-cyan-400
                        uppercase
                        ">
                        NPI
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {totalNPI}
                    </h1>

                </div>

                {/* KAIZEN */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-green-500/20

                    bg-gradient-to-br
                    from-green-500/10
                    to-green-500/5
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-green-400
                        uppercase
                        ">
                        KAIZEN
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {totalKaizen}
                    </h1>

                </div>

                {/* DT */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-yellow-500/20

                    bg-gradient-to-br
                    from-yellow-500/10
                    to-yellow-500/5
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-yellow-400
                        uppercase
                        ">
                        DT & FINDING
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {totalDT}
                    </h1>

                </div>

                {/* VAVE */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-purple-500/20

                    bg-gradient-to-br
                    from-purple-500/10
                    to-purple-500/5
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-purple-400
                        uppercase
                        ">
                        VAVE
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {totalVAVE}
                    </h1>

                </div>

                {/* TOTAL */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-blue-500/20

                    bg-gradient-to-br
                    from-blue-500/10
                    to-blue-500/5
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-blue-400
                        uppercase
                        ">
                        TOTAL PROJECT
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {
                            statusSummary.doneCount +
                            statusSummary.progressCount +
                            statusSummary.openCount +
                            statusSummary.delayCount
                        }
                    </h1>

                </div>

                {/* OVERDUE */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-red-500/20

                    bg-gradient-to-br
                    from-red-500/10
                    to-red-500/5
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-red-400
                        uppercase
                        ">
                        OVERDUE
                    </p>

                    <h1 className="
                        mt-2
                        text-4xl
                        font-black
                        text-white
                        ">
                        {overdueProject}
                    </h1>

                </div>

                {/* DATE */}

                <div className="
                    rounded-[24px]
                    p-5

                    border border-white/10

                    bg-white/[0.03]
                    ">

                    <p className="
                        text-[11px]
                        font-bold
                        tracking-widest
                        text-slate-400
                        uppercase
                        ">
                        TODAY
                    </p>

                    <h1 className="
                        mt-2
                        text-lg
                        font-black
                        text-white
                        ">
                        {new Date().toLocaleDateString()}
                    </h1>

                </div>

            </div>

            {/* ===================================== */}
            {/* ANALYTICS DASHBOARD */}
            {/* ===================================== */}

            <div
                className="
            grid
            gap-5
            "
                style={{
                    gridTemplateColumns:
                        "320px 1fr 360px 320px"
                }}
            >

                {/* PROJECT HEALTH */}

                <div className="
                relative
                h-[230px]
                

                rounded-[28px]

                border border-white/10

                bg-gradient-to-br
                from-[#081526]
                to-[#07111d]

                overflow-hidden

                shadow-[0_0_30px_rgba(0,255,255,.05)]
                ">

                    <div className="
                        absolute
                        top-[-40px]
                        right-[-40px]

                        w-[140px]
                        h-[140px]

                        bg-cyan-500/10
                        blur-[80px]
                        rounded-full
                        "/>

                    <div className="p-5">

                        <h3 className="
                        text-white
                        font-bold
                        text-sm
                        mb-4
                        ">
                            Project Health Overview
                        </h3>

                        <div className="
                            flex
                            items-center
                            justify-between
                            ">

                            <div className="
                                relative
                                w-[150px]
                                h-[150px]
                            ">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={healthData}
                                            dataKey="value"
                                            innerRadius={50}
                                            outerRadius={75}
                                            strokeWidth={0}
                                        >

                                            {
                                                healthData.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={entry.color}
                                                        opacity={
                                                            dashboardFilter === "ALL"
                                                                ? 1
                                                                : dashboardFilter ===
                                                                    entry.name.toUpperCase()
                                                                    ? 1
                                                                    : 0.2
                                                        }
                                                    />
                                                ))
                                            }

                                        </Pie>

                                    </PieChart>

                                </ResponsiveContainer>

                                <div className="
                                    absolute
                                    inset-0

                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    ">

                                    <h1 className="
                                        text-4xl
                                        font-black
                                        text-white
                                        ">
                                        {totalProject}
                                    </h1>

                                    <p className="
                                        text-slate-400
                                        text-xs
                                        ">
                                        Total Task
                                    </p>

                                </div>

                            </div>

                            <div className="
                                space-y-3
                                ">

                                {
                                    healthData.map(item => (

                                        <div
                                            key={item.name}

                                            onClick={() => {

                                                const status =
                                                    item.name.toUpperCase();

                                                if (
                                                    dashboardFilter === status
                                                ) {

                                                    setDashboardFilter("ALL");
                                                    setTrendMode("PLAN");

                                                    return;
                                                }

                                                setDashboardFilter(status);

                                                if (status === "DONE") {

                                                    setTrendMode("ACTUAL");

                                                } else {

                                                    setTrendMode("PLAN");

                                                }

                                            }}

                                            className={`
                                            flex
                                            items-center
                                            gap-3
                                            cursor-pointer
                                            rounded-lg
                                            px-2
                                            py-1

                                            ${dashboardFilter ===
                                                    item.name.toUpperCase()
                                                    ? "bg-white/10"
                                                    : ""
                                                }
                                        `}
                                        >

                                            <div
                                                className="
                                                w-3
                                                h-3
                                                rounded-full
                                                "
                                                style={{
                                                    background: item.color
                                                }}
                                            />

                                            <span className="
                                                text-white
                                                text-sm
                                                ">
                                                {item.name}
                                            </span>

                                            <span className="
                                                text-slate-400
                                                text-sm
                                            ">
                                                {
                                                    item.name === "Done"
                                                        ? statusSummary.doneCount
                                                        : item.name === "Progress"
                                                            ? statusSummary.progressCount
                                                            : item.name === "Open"
                                                                ? statusSummary.openCount
                                                                : statusSummary.delayCount
                                                }
                                            </span>

                                        </div>

                                    ))
                                }

                            </div>

                        </div>

                    </div>

                </div>

                {/* ACTIVITY TREND */}

                <div className="
                    h-[230px]
                    rounded-[28px]
                    border border-white/10
                    bg-gradient-to-br
                    from-[#081526]
                    to-[#07111d]
                    p-5
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-3
                    ">

                        <div>

                            <h3 className="
                                text-white
                                font-bold
                                text-sm
                            ">
                                Project Trend By Type
                            </h3>

                            <div className="
                                flex
                                items-center
                                gap-4
                                mt-2
                                text-[11px]
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-1
                                ">
                                    <div className="
                                        w-3
                                        h-3
                                        rounded
                                        bg-cyan-400
                                    "/>

                                    <span className="
                                        text-slate-300
                                    ">
                                        NPI
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    items-center
                                    gap-1
                                ">
                                    <div className="
                                        w-3
                                        h-3
                                        rounded
                                        bg-green-400
                                    "/>

                                    <span className="
                                        text-slate-300
                                    ">
                                        KAIZEN
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    items-center
                                    gap-1
                                ">
                                    <div className="
                                        w-3
                                        h-3
                                        rounded
                                        bg-yellow-400
                                    "/>

                                    <span className="
                                        text-slate-300
                                    ">
                                        DT & Finding
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    items-center
                                    gap-1
                                ">

                                    <div className="
                                        w-3
                                        h-3
                                        rounded
                                        bg-purple-500
                                    "/>

                                    <span className="
                                        text-slate-300
                                    ">
                                        VAVE
                                    </span>

                                </div>

                            </div>

                        </div>

                        <select
                            value={trendMode}
                            onChange={(e) =>
                                setTrendMode(
                                    e.target.value
                                )
                            }
                            className="
                                bg-black/30
                                border border-white/10
                                rounded-xl
                                px-3
                                py-1
                                text-xs
                                text-white
                            "
                        >

                            <option value="PLAN">
                                Plan
                            </option>

                            <option value="ACTUAL">
                                Actual
                            </option>

                        </select>

                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height="78%"
                    >

                        <BarChart
                            data={trendData}
                            barGap={2}
                            barCategoryGap="5%"
                        >

                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                            />

                            <YAxis
                                stroke="#64748b"
                            />

                            <Tooltip
                                contentStyle={{
                                    background: "#081526",
                                    border:
                                        "1px solid rgba(255,255,255,.1)"
                                }}
                            />

                            <Bar
                                dataKey="NPI"
                                fill="#00B4FF"
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />

                            <Bar
                                dataKey="KAIZEN"
                                fill="#00D084"
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />

                            <Bar
                                dataKey="DT"
                                fill="#FACC15"
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />

                            <Bar
                                dataKey="VAVE"
                                fill="#A855F7"
                                barSize={12}
                                radius={[4, 4, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                {/* ENGINEER WORKLOAD */}

                <div className="
                    h-[230px]
                    rounded-[28px]
                    border border-white/10

                    bg-gradient-to-br
                    from-[#081526]
                    to-[#07111d]

                    p-4

                    flex
                    flex-col

                    overflow-hidden
                ">

                    <h3 className="
                        text-white
                        font-bold
                        text-sm
                        mb-4
                    ">
                        Engineer Workload
                    </h3>

                    <div className="
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden

                        pr-2

                        custom-scrollbar
                    ">

                        {
                            engineerWorkload.map((eng) => {

                                const count =
                                    eng.taskCount;

                                const percent =
                                    (count / maxWorkload) * 100;

                                return (

                                    <div
                                        key={eng.name}

                                        onClick={() => {

                                            if (
                                                selectedEngineer === eng.name
                                            ) {

                                                setSelectedEngineer("ALL");

                                            } else {

                                                setSelectedEngineer(
                                                    eng.name
                                                );

                                            }

                                        }}

                                        className={`
                                            mb-1
                                            cursor-pointer
                                            rounded-xl
                                            p-1.5
                                            transition-all

                                            ${selectedEngineer === eng.name
                                                ? `
                                                        bg-cyan-500/10
                                                        border
                                                        border-cyan-500/30
                                                    `
                                                : `
                                                        hover:bg-white/5
                                                    `
                                            }
                                        `}
                                    >

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                            mb-2
                                        ">

                                            <div className="
                                                w-8
                                                h-8
                                                rounded-full
                                                bg-gradient-to-r
                                                from-cyan-400
                                                to-blue-500

                                                flex
                                                items-center
                                                justify-center

                                                text-black
                                                font-black
                                            ">
                                                {eng.name[0]}
                                            </div>

                                            <div className="flex-1">

                                                <div className="
                                                    flex
                                                    justify-between
                                                ">

                                                    <p className="
                                                        text-white
                                                        text-sm
                                                    ">
                                                        {eng.name}
                                                    </p>

                                                    <p className="
                                                        text-slate-400
                                                        text-xs
                                                    ">
                                                        {count} Task
                                                    </p>

                                                </div>

                                                <div className="
                                                    h-2
                                                    bg-slate-800
                                                    rounded-full
                                                    mt-1
                                                ">

                                                    <div
                                                        className="
                                                            h-full
                                                            rounded-full

                                                            bg-gradient-to-r
                                                            from-cyan-400
                                                            to-blue-500
                                                        "
                                                        style={{
                                                            width: `${percent}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                );

                            })
                        }

                    </div>

                </div>

                {/* PROJECT TYPE */}

                <div className="
                    h-[230px]

                    rounded-[28px]

                    border border-white/10

                    bg-gradient-to-br
                    from-[#081526]
                    to-[#07111d]

                    p-5
                    ">

                    <h3 className="
                        text-white
                        font-bold
                        text-sm
                        mb-4
                        ">
                        Project Type Distribution
                    </h3>

                    <div className="
                        flex
                        items-center
                        justify-between
                        ">

                        <div className="
                            relative
                            w-[150px]
                            h-[150px]
                        ">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={typeData}
                                        dataKey="value"
                                        innerRadius={50}
                                        outerRadius={75}
                                        strokeWidth={0}
                                    >

                                        {
                                            typeData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={entry.color}
                                                    opacity={
                                                        selectedProjectType === "ALL"
                                                            ? 1
                                                            : selectedProjectType ===
                                                                (
                                                                    entry.name === "DT"
                                                                        ? "Downtime and Finding"
                                                                        : entry.name
                                                                )
                                                                ? 1
                                                                : 0.2
                                                    }
                                                />
                                            ))
                                        }

                                    </Pie>

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                        <div className="
                            space-y-3
                            ">

                            {
                                typeData.map(item => (

                                    <div
                                        key={item.name}

                                        onClick={() => {

                                            const type =

                                                item.name === "DT"
                                                    ? "Downtime and Finding"
                                                    : item.name;

                                            if (
                                                selectedProjectType === type
                                            ) {

                                                setSelectedProjectType("ALL");

                                            } else {

                                                setSelectedProjectType(type);

                                            }

                                        }}

                                        className={`
                                            flex
                                            items-center
                                            gap-3

                                            cursor-pointer
                                            rounded-lg
                                            px-2
                                            py-1

                                            ${selectedProjectType ===
                                                (
                                                    item.name === "DT"
                                                        ? "Downtime and Finding"
                                                        : item.name
                                                )
                                                ? "bg-white/10"
                                                : ""
                                            }
                                        `}
                                    >

                                        <div
                                            className="
                                            w-3
                                            h-3
                                            rounded-full
                                            "
                                            style={{
                                                background: item.color
                                            }}
                                        />

                                        <span className="
                                            text-white
                                            text-sm
                                            ">
                                            {item.name}
                                        </span>

                                        <span className="
                                            text-slate-400
                                            text-sm
                                            ">
                                            {item.value}
                                        </span>

                                    </div>

                                ))
                            }

                        </div>

                    </div>

                </div>

            </div>


            {/* PROJECT AREA */}
            <div
                className="
                grid
                gap-5
                h-[calc(100vh-330px)]
                overflow-hidden
        "
                style={{
                    gridTemplateColumns: "1fr 320px"
                }}
            >

                {/* LEFT SIDE */}
                <div
                    className="
                        flex
                        flex-col
                        overflow-hidden
                        min-w-0
                    "
                >

                    {/* FILTER */}
                    <div className="
                    flex
                    items-center
                    gap-3
                    mb-4
                    ">

                        {/* SEARCH */}
                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-slate-500
                                "
                            />

                            <input
                                type="text"
                                placeholder="Search project..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="
                                w-full
                                h-12
                                rounded-2xl

                                bg-[#081526]
                                border
                                border-white/10

                                pl-12
                                pr-4

                                text-white
                                "
                            />

                        </div>

                        {/* MY PROJECT */}
                        <button
                            onClick={() =>
                                setProjectFilter("MY")
                            }
                            className={`
                                h-14
                                px-5
                                rounded-2xl
                                border
                                font-bold
                                transition-all

                                ${projectFilter === "MY"

                                    ? `
                                    border-cyan-400
                                    bg-cyan-500/20
                                    text-cyan-300
                                    shadow-[0_0_25px_rgba(0,255,255,0.25)]
                                    `

                                    : `
                                    border-white/10
                                    bg-white/5
                                    text-slate-400
                                    hover:border-cyan-500/20
                                    `
                                }
                                `}
                        >

                            My Project

                        </button>

                        {/* ALL PROJECT */}
                        <button
                            onClick={() =>
                                setProjectFilter("ALL")
                            }
                            className={`
                                h-14
                                px-5
                                rounded-2xl
                                border
                                font-bold
                                transition-all

                                ${projectFilter === "ALL"

                                    ? `
                                    border-green-400
                                    bg-green-500/20
                                    text-green-300
                                    shadow-[0_0_25px_rgba(0,255,120,0.25)]
                                    `

                                    : `
                                    border-white/10
                                    bg-white/5
                                    text-slate-400
                                    hover:border-green-500/20
                                    `
                                }
                                `}
                        >

                            All Project

                        </button>

                        {/* ADD PROJECT */}
                        <button
                            onClick={() => {

                                // ======================
                                // ROLE VALIDATION
                                // ======================

                                if (
                                    currentUser?.role !== "Manager"
                                ) {

                                    alert(
                                        "Project hanya bisa ditambahkan oleh Manager role"
                                    );

                                    return;

                                }

                                // ======================
                                // OPEN MODAL
                                // ======================

                                setEditMode(false);

                                setFormData({
                                    title: "",
                                    type: "",
                                    site: "",
                                    tpm: "",
                                    ee: [],
                                });

                                setOpenModal(true);

                            }}
                            className="h-14 px-6 rounded-2xl
                                shrink-0
                                bg-gradient-to-r
                                from-green-500 to-emerald-600
                                shadow-[0_0_30px_rgba(34,197,94,.25)]
                                flex items-center gap-3
                                text-sm font-bold transition-all
                                hover:scale-[1.02]"
                        >

                            <Plus size={16} />

                            Add Project

                        </button>



                    </div>

                    {/* PROJECT LIST */}
                    <div
                        className="
                    overflow-y-auto
                    pr-2
                    main-scroll
                "
                    >
                        <div
                            className="
                        grid
                        grid-cols-4
                        gap-6
                    "
                        >

                            {loading ? (

                                <div className="col-span-4
                                h-[300px]
                                rounded-[36px]
                                border border-white/5
                                bg-white/[0.03]
                                flex items-center justify-center
                                text-slate-500">

                                    Loading projects...

                                </div>

                            ) : filteredProjects.length === 0 ? (

                                <div className="col-span-4
                                h-[300px]
                                rounded-[36px]
                                border border-white/5
                                bg-white/[0.03]
                                flex items-center justify-center
                                text-slate-500">

                                    No project data

                                </div>

                            ) : (

                                filteredProjects.map((item) => (

                                    <div
                                        key={item.id}

                                        onClick={() =>
                                            handleViewActivity(item)
                                        }

                                        className="group relative
                                    rounded-[32px]
                                    cursor-pointer
                                    border border-white/5
                                    bg-white/[0.03]
                                    backdrop-blur-2xl
                                    overflow-hidden
                                    hover:border-green-500/20
                                    hover:bg-green-500/[0.03]
                                    transition-all duration-300"
                                    >

                                        <div className="absolute top-[-40px] right-[-40px]
                                    w-[120px] h-[120px]
                                    bg-green-500/10
                                    blur-[60px]
                                    rounded-full"></div>

                                        <div className="relative z-10 p-6">

                                            <div className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-4
                                    ">

                                                <div className="
                                            flex-1
                                            min-w-0
                                        ">

                                                    <div className="inline-flex
                                        px-3 py-1 rounded-xl
                                        bg-green-500/10
                                        border border-green-500/20
                                        text-green-400
                                        text-xs font-bold">

                                                        {item.type}

                                                    </div>

                                                    <h2 className="mt-4 text-xl font-bold text-white leading-8">

                                                        {item.title}

                                                    </h2>

                                                    {/* PERFORMANCE BAR */}
                                                    {(() => {

                                                        const {
                                                            progress,
                                                            done,
                                                            total
                                                        } = getProjectProgress(item.id);

                                                        return (

                                                            <div className="
                                                        mt-5
                                                        w-full
                                                    ">

                                                                {/* TOP */}
                                                                <div className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            mb-2
                                                            gap-3
                                                        ">

                                                                    <span className="
                                                                text-[11px]
                                                                font-bold
                                                                tracking-wider
                                                                text-cyan-400
                                                            ">

                                                                        PERFORMANCE

                                                                    </span>

                                                                    <span className="
                                                            w-[55px]
                                                            text-right
                                                            shrink-0
                                                            text-[11px]
                                                            font-bold
                                                            text-white
                                                        ">
                                                                        {done}/{total}
                                                                    </span>

                                                                </div>

                                                                {/* BAR CONTAINER */}
                                                                <div className="
                                                        relative
                                                        w-full
                                                        min-w-full
                                                        h-[12px]
                                                        rounded-full
                                                        bg-black/30
                                                        overflow-hidden
                                                        border
                                                        border-white/10
                                                        mt-2
                                                    ">

                                                                    {/* BACKGROUND GLOW */}
                                                                    <div className="
                                                            absolute
                                                            inset-0
                                                            bg-gradient-to-r
                                                            from-green-500/5
                                                            to-emerald-500/5
                                                        "></div>

                                                                    {/* PROGRESS */}
                                                                    <div
                                                                        className="
                                                                absolute
                                                                left-0
                                                                top-0
                                                                h-full
                                                                rounded-full

                                                                bg-gradient-to-r
                                                                from-green-400
                                                                via-emerald-500
                                                                to-green-300

                                                                shadow-[0_0_25px_rgba(34,197,94,0.65)]

                                                                transition-all
                                                                duration-700
                                                            "
                                                                        style={{
                                                                            width: `${progress}%`
                                                                        }}
                                                                    />

                                                                </div>

                                                                {/* PERCENT */}
                                                                <div className="
                                                            mt-2
                                                            flex
                                                            items-center
                                                            justify-between
                                                        ">

                                                                    <span className="
                                                            text-[11px]
                                                            text-slate-400
                                                            font-semibold
                                                        ">
                                                                        {done} / {total} Task
                                                                    </span>

                                                                    <span className="
                                                            text-[12px]
                                                            font-black
                                                            text-green-400
                                                        ">
                                                                        {progress}%
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        );

                                                    })()}

                                                </div>

                                                <div className="flex items-center gap-2">

                                                    {/* DELETE */}
                                                    <button
                                                        onClick={(e) => {

                                                            e.stopPropagation();

                                                            // ======================
                                                            // ROLE VALIDATION
                                                            // ======================

                                                            if (
                                                                currentUser?.role !== "Manager"
                                                            ) {

                                                                alert(
                                                                    "Delete project hanya bisa dilakukan oleh Manager role"
                                                                );

                                                                return;

                                                            }

                                                            handleDeleteProject(item.id)

                                                        }}

                                                        className="w-10 h-10 rounded-xl
                                            bg-red-500/10
                                            border border-red-500/20
                                            flex items-center justify-center
                                            hover:scale-105
                                            transition-all"
                                                    >

                                                        <Trash2
                                                            size={16}
                                                            className="text-red-400"
                                                        />

                                                    </button>

                                                    {/* EDIT */}
                                                    <button
                                                        onClick={(e) => {

                                                            e.stopPropagation();

                                                            // ======================
                                                            // ROLE VALIDATION
                                                            // ======================

                                                            if (
                                                                currentUser?.role !== "Manager"
                                                            ) {

                                                                alert(
                                                                    "Edit project hanya bisa dilakukan oleh Manager role"
                                                                );

                                                                return;

                                                            }

                                                            // ======================
                                                            // OPEN EDIT MODAL
                                                            // ======================

                                                            setEditMode(true);

                                                            setSelectedProject(item);

                                                            setFormData({
                                                                title: item.title || "",
                                                                type: item.type || "",
                                                                site: item.site || "",
                                                                tpm: item.tpm || "",
                                                                ee: Array.isArray(item.ee)
                                                                    ? item.ee
                                                                    : item.ee
                                                                        ? [item.ee]
                                                                        : [],
                                                            });

                                                            setOpenModal(true);

                                                        }}

                                                        className="w-10 h-10 rounded-xl
                                            bg-yellow-500/10
                                            border border-yellow-500/20
                                            flex items-center justify-center
                                            hover:scale-105
                                            transition-all"
                                                    >

                                                        <Pencil
                                                            size={16}
                                                            className="text-yellow-400"
                                                        />

                                                    </button>

                                                </div>

                                            </div>

                                            <div className="mt-6 flex items-start justify-between gap-4">

                                                {/* LEFT INFO */}
                                                <div className="space-y-3 flex-1">

                                                    <div className="grid grid-cols-[70px_1fr] items-center gap-x-2">

                                                        <p className="text-slate-500 text-sm">
                                                            Site
                                                        </p>

                                                        <p className="font-semibold text-white">
                                                            {item.site}
                                                        </p>

                                                    </div>

                                                    <div className="grid grid-cols-[70px_1fr] items-center gap-x-2">

                                                        <p className="text-slate-500 text-sm">
                                                            TPM
                                                        </p>

                                                        <p className="font-semibold text-white">
                                                            {item.tpm}
                                                        </p>

                                                    </div>

                                                    <div className="grid grid-cols-[70px_1fr] items-center gap-x-2">

                                                        <p className="text-slate-500 text-sm">
                                                            Engineer
                                                        </p>

                                                        <div className="
                                                flex
                                                flex-wrap
                                                gap-2
                                            ">

                                                            {
                                                                Array.isArray(item.ee)

                                                                    ? (

                                                                        item.ee.map((name) => (

                                                                            <div
                                                                                key={name}

                                                                                className="
                                                                    px-3
                                                                    py-1.5

                                                                    rounded-xl

                                                                    bg-cyan-500/10
                                                                    border
                                                                    border-cyan-500/20

                                                                    text-white
                                                                    text-sm
                                                                    font-semibold

                                                                    hover:bg-cyan-500/15
                                                                    transition-all
                                                                "
                                                                            >

                                                                                {name}

                                                                            </div>

                                                                        ))

                                                                    )

                                                                    : (

                                                                        <div className="
                                                                px-3
                                                                py-1.5

                                                                rounded-xl

                                                                bg-cyan-500/10
                                                                border
                                                                border-cyan-500/20

                                                                text-white
                                                                text-sm
                                                                font-semibold
                                                            ">
                                                                            {item.ee}
                                                                        </div>

                                                                    )
                                                            }

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* RIGHT STATUS */}
                                                {(() => {

                                                    const headers =
                                                        taskHeaders.filter((header) => {

                                                            return (
                                                                String(header.project_id) ===
                                                                String(item.id)
                                                            );

                                                        });

                                                    let doneCount = 0;
                                                    let openCount = 0;
                                                    let progressCount = 0;
                                                    let delayCount = 0;

                                                    headers.forEach((header) => {

                                                        const relatedSubs =
                                                            subTasks.filter((sub) => {

                                                                return (
                                                                    String(sub.header_id) ===
                                                                    String(header.id)
                                                                );

                                                            });

                                                        // ======================
                                                        // PLAN TASKS
                                                        // ======================

                                                        const planTasks =
                                                            relatedSubs.filter((sub) => {

                                                                return (
                                                                    String(sub.remark)
                                                                        .toUpperCase() ===
                                                                    "PLAN"
                                                                );

                                                            });

                                                        // ======================
                                                        // ACTUAL TASKS
                                                        // ======================

                                                        const actualTasks =
                                                            relatedSubs.filter((sub) => {

                                                                return (
                                                                    String(sub.remark)
                                                                        .toUpperCase() ===
                                                                    "ACTUAL"
                                                                );

                                                            });

                                                        // ======================
                                                        // HAS PROGRESS
                                                        // ======================

                                                        const hasPlanProgress =

                                                            planTasks.some(
                                                                (x) =>

                                                                    x.start_date &&
                                                                    x.end_date
                                                            )

                                                            ||

                                                            actualTasks.some(
                                                                (x) =>

                                                                    x.start_date &&
                                                                    x.end_date
                                                            );

                                                        // ======================
                                                        // ALL ACTUAL DONE
                                                        // ======================

                                                        const allActualDone =

                                                            actualTasks.length > 0 &&

                                                            actualTasks.every(
                                                                (x) =>

                                                                    x.start_date &&
                                                                    x.end_date
                                                            );

                                                        // ======================
                                                        // DONE
                                                        // ======================

                                                        if (allActualDone) {

                                                            doneCount++;
                                                            return;

                                                        }

                                                        // ======================
                                                        // DELAY
                                                        // ======================

                                                        const today =
                                                            new Date();

                                                        today.setHours(
                                                            0,
                                                            0,
                                                            0,
                                                            0
                                                        );

                                                        if (header.end_date) {

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

                                                                delayCount++;
                                                                return;

                                                            }

                                                        }

                                                        // ======================
                                                        // PROGRESS
                                                        // ======================

                                                        if (hasPlanProgress) {

                                                            progressCount++;
                                                            return;

                                                        }

                                                        // ======================
                                                        // OPEN
                                                        // ======================

                                                        openCount++;

                                                    });

                                                    return (

                                                        <div className="
                                                    min-w-[120px]
                                                    space-y-2
                                                ">

                                                            <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                                <p className="
                                                            text-[14px]
                                                            text-slate-500
                                                        ">
                                                                    Done
                                                                </p>

                                                                <p className="
                                                            text-green-400
                                                            font-bold
                                                            text-sm
                                                        ">
                                                                    {doneCount}
                                                                </p>

                                                            </div>

                                                            <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                                <p className="
                                                            text-[14px]
                                                            text-slate-500
                                                        ">
                                                                    Progress
                                                                </p>

                                                                <p className="
                                                            text-yellow-400
                                                            font-bold
                                                            text-sm
                                                        ">
                                                                    {progressCount}
                                                                </p>

                                                            </div>

                                                            <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                                <p className="
                                                            text-[14px]
                                                            text-slate-500
                                                        ">
                                                                    Open
                                                                </p>

                                                                <p className="
                                                            text-cyan-400
                                                            font-bold
                                                            text-sm
                                                        ">
                                                                    {openCount}
                                                                </p>

                                                            </div>

                                                            <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                                <p className="
                                                            text-[14px]
                                                            text-slate-500
                                                        ">
                                                                    Delay
                                                                </p>

                                                                <p className="
                                                            text-red-400
                                                            font-bold
                                                            text-sm
                                                        ">
                                                                    {delayCount}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    );

                                                })()}

                                            </div>

                                        </div>

                                    </div>

                                ))

                            )}
                        </div>

                    </div>
                </div>

                {/* KANAN */}
                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        overflow-y-auto
                    "
                >
                    <div
                        className="
                        rounded-[28px]
                        border border-red-500/20
                        bg-gradient-to-br
                        from-[#081526]
                        to-[#07111d]
                        p-5
                        h-[270px]
                        flex
                        flex-col
                    "
                    >

                        <div className="flex justify-between mb-4">

                            <h3 className="text-white font-bold">
                                Recent Alerts
                            </h3>

                            <span className="
                                text-red-400
                                text-xs
                                font-bold
                            ">
                                {recentAlerts.length} Delay
                            </span>

                        </div>

                        <div className="
                            flex-1
                            overflow-y-auto
                            space-y-2
                        ">

                            {
                                recentAlerts.length === 0
                                    ? (
                                        <div className="
                                            text-slate-500
                                            text-sm
                                        ">
                                            No delayed task
                                        </div>
                                    )

                                    : (

                                        recentAlerts.map(
                                            (item) => (

                                                <div
                                                    key={item.id}

                                                    onClick={() =>
                                                        handleOpenTask(item)
                                                    }

                                                    className="
                                                        rounded-xl
                                                        border
                                                        border-red-500/10
                                                        bg-red-500/5
                                                        p-3

                                                        cursor-pointer

                                                        hover:border-red-500/40
                                                        hover:bg-red-500/10

                                                        transition-all
                                                    "
                                                >

                                                    <div className="
                                                    flex
                                                    justify-between
                                                    items-center
                                                    gap-2
                                                ">
                                                        <div
                                                            className={`
                                                            text-sm
                                                            font-semibold
                                                            truncate

                                                            ${projects.find(
                                                                p =>
                                                                    String(p.id) ===
                                                                    String(item.project_id)
                                                            )?.type === "NPI"

                                                                    ? "text-cyan-400"

                                                                    : projects.find(
                                                                        p =>
                                                                            String(p.id) ===
                                                                            String(item.project_id)
                                                                    )?.type === "KAIZEN"

                                                                        ? "text-green-400"

                                                                        : projects.find(
                                                                            p =>
                                                                                String(p.id) ===
                                                                                String(item.project_id)
                                                                        )?.type === "Downtime and Finding"

                                                                            ? "text-yellow-400"

                                                                            : projects.find(
                                                                                p =>
                                                                                    String(p.id) ===
                                                                                    String(item.project_id)
                                                                            )?.type === "VAVE"

                                                                                ? "text-purple-400"

                                                                                : "text-white"
                                                                }
                                                        `}
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {

                                                                e.stopPropagation();

                                                                setSelectedCommentTask(item);

                                                                setCommentText(
                                                                    item.comment || ""
                                                                );

                                                                setCommentModal(true);

                                                            }}
                                                            className="
                                                                text-cyan-400
                                                                hover:text-cyan-300
                                                            "
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>

                                                    </div>

                                                    <div className="
                                                        mt-1
                                                        flex
                                                        justify-between
                                                        items-center
                                                        gap-2
                                                    ">

                                                        <span className="
                                                            text-xs
                                                            text-slate-400
                                                        ">
                                                            Assign To :
                                                            {" "}
                                                            {item.assigned_to}
                                                        </span>

                                                        {
                                                            item.comment && (
                                                                <span className="
                                                                    text-[10px]
                                                                    text-cyan-400
                                                                    font-semibold
                                                                    truncate
                                                                    max-w-[120px]
                                                                ">
                                                                    {item.comment}
                                                                </span>
                                                            )
                                                        }

                                                    </div>

                                                    <div className="
                                                        mt-1
                                                        flex
                                                        justify-between
                                                        text-xs
                                                    ">

                                                        <span className="
                                                            text-slate-500
                                                        ">
                                                            Due:
                                                            {" "}
                                                            {item.end_date}
                                                        </span>

                                                        <span className="
                                                            text-red-400
                                                            font-bold
                                                        ">
                                                            {item.delayDays}
                                                            {" "}
                                                            Days
                                                        </span>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )
                            }

                        </div>

                    </div>

                    <div
                        className="
                        rounded-[28px]
                        border border-white/10
                        bg-gradient-to-br
                        from-[#081526]
                        to-[#07111d]
                        p-5
                        h-[270px]
                        flex
                        flex-col
                    "
                    >

                        <div className="flex justify-between mb-4">

                            <h3 className="text-white font-bold">
                                Upcoming Deadlines
                            </h3>

                            <span className="
                                text-cyan-400
                                text-xs
                                font-bold
                            ">
                                Next 14 Days
                            </span>

                        </div>

                        <div className="
                            flex-1
                            overflow-y-auto
                            space-y-2
                        ">

                            {
                                upcomingDeadlines.length === 0
                                    ? (
                                        <div className="
                                            text-slate-500
                                            text-sm
                                        ">
                                            No upcoming deadline
                                        </div>
                                    )

                                    : (

                                        upcomingDeadlines.map(
                                            (item) => (

                                                <div
                                                    key={item.id}

                                                    onClick={() =>
                                                        handleOpenTask(item)
                                                    }

                                                    className="
                                                        rounded-xl
                                                        border
                                                        border-cyan-500/10
                                                        bg-cyan-500/5
                                                        p-3

                                                        cursor-pointer

                                                        hover:border-cyan-500/40
                                                        hover:bg-cyan-500/10

                                                        transition-all
                                                    "
                                                >
                                                    <div className="
                                                    flex
                                                    justify-between
                                                    items-center
                                                    gap-2
                                                ">
                                                        <div
                                                            className={`
                                                            text-sm
                                                            font-semibold
                                                            truncate

                                                            ${projects.find(
                                                                p =>
                                                                    String(p.id) ===
                                                                    String(item.project_id)
                                                            )?.type === "NPI"

                                                                    ? "text-cyan-400"

                                                                    : projects.find(
                                                                        p =>
                                                                            String(p.id) ===
                                                                            String(item.project_id)
                                                                    )?.type === "KAIZEN"

                                                                        ? "text-green-400"

                                                                        : projects.find(
                                                                            p =>
                                                                                String(p.id) ===
                                                                                String(item.project_id)
                                                                        )?.type === "Downtime and Finding"

                                                                            ? "text-yellow-400"

                                                                            : projects.find(
                                                                                p =>
                                                                                    String(p.id) ===
                                                                                    String(item.project_id)
                                                                            )?.type === "VAVE"

                                                                                ? "text-purple-400"

                                                                                : "text-white"
                                                                }
                                                        `}
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {

                                                                e.stopPropagation();

                                                                setSelectedCommentTask(item);

                                                                setCommentText(
                                                                    item.comment || ""
                                                                );

                                                                setCommentModal(true);

                                                            }}
                                                            className="
                                                            text-cyan-400
                                                            hover:text-cyan-300
                                                        "
                                                        >
                                                            <MessageSquare size={14} />
                                                        </button>
                                                    </div>

                                                    <div className="
                                                        mt-1
                                                        flex
                                                        justify-between
                                                        items-center
                                                        gap-2
                                                    ">

                                                        <span className="
                                                            text-xs
                                                            text-slate-400
                                                        ">
                                                            Assign To :
                                                            {" "}
                                                            {item.assigned_to}
                                                        </span>

                                                        {
                                                            item.comment && (
                                                                <span className="
                                                                    text-[10px]
                                                                    text-cyan-400
                                                                    font-semibold
                                                                    truncate
                                                                    max-w-[120px]
                                                                ">
                                                                    {item.comment}
                                                                </span>
                                                            )
                                                        }

                                                    </div>

                                                    <div className="
                                                        mt-1
                                                        text-xs
                                                        text-cyan-400
                                                    ">
                                                        Due:
                                                        {" "}
                                                        {item.end_date}
                                                    </div>

                                                </div>

                                            )
                                        )

                                    )
                            }

                        </div>


                    </div>
                    <div
                        className="
                                rounded-[28px]
                                border border-green-500/20
                                bg-gradient-to-br
                                from-[#081526]
                                to-[#07111d]
                                p-5
                                h-[270px]
                                flex
                                flex-col
                            "
                    >

                        <div className="
                                flex
                                justify-between
                                mb-4
                            ">

                            <h3 className="
                                    text-white
                                    font-bold
                                ">
                                Ongoing Tasks
                            </h3>

                            <span className="
                                    text-green-400
                                    text-xs
                                    font-bold
                                ">
                                +14 Days
                            </span>

                        </div>

                        <div className="
                                flex-1
                                overflow-y-auto
                                space-y-2
                            ">

                            {
                                ongoingTasks.length === 0

                                    ? (

                                        <div className="
                                                text-slate-500
                                                text-sm
                                            ">
                                            No ongoing task
                                        </div>

                                    )

                                    : (

                                        ongoingTasks.map(
                                            (item) => {

                                                const today =
                                                    new Date();

                                                const dueDate =
                                                    new Date(
                                                        item.end_date
                                                    );

                                                const remainingDays =
                                                    Math.ceil(
                                                        (
                                                            dueDate -
                                                            today
                                                        ) /
                                                        (
                                                            1000 *
                                                            60 *
                                                            60 *
                                                            24
                                                        )
                                                    );

                                                return (

                                                    <div
                                                        key={item.id}

                                                        onClick={() =>
                                                            handleOpenTask(item)
                                                        }

                                                        className="
                                                            rounded-xl
                                                            border
                                                            border-green-500/10
                                                            bg-green-500/5
                                                            p-3

                                                            cursor-pointer

                                                            hover:border-green-500/40
                                                            hover:bg-green-500/10

                                                            transition-all
                                                        "
                                                    >
                                                        <div className="
                                                        flex
                                                        justify-between
                                                        items-center
                                                        gap-2
                                                    ">
                                                            <div
                                                                className={`
                                                                text-sm
                                                                font-semibold
                                                                truncate

                                                                ${projects.find(
                                                                    p =>
                                                                        String(p.id) ===
                                                                        String(item.project_id)
                                                                )?.type === "NPI"

                                                                        ? "text-cyan-400"

                                                                        : projects.find(
                                                                            p =>
                                                                                String(p.id) ===
                                                                                String(item.project_id)
                                                                        )?.type === "KAIZEN"

                                                                            ? "text-green-400"

                                                                            : projects.find(
                                                                                p =>
                                                                                    String(p.id) ===
                                                                                    String(item.project_id)
                                                                            )?.type === "Downtime and Finding"

                                                                                ? "text-yellow-400"

                                                                                : projects.find(
                                                                                    p =>
                                                                                        String(p.id) ===
                                                                                        String(item.project_id)
                                                                                )?.type === "VAVE"

                                                                                    ? "text-purple-400"

                                                                                    : "text-white"
                                                                    }
                                                            `}
                                                            >
                                                                {item.title}
                                                            </div>
                                                            <button
                                                                onClick={(e) => {

                                                                    e.stopPropagation();

                                                                    setSelectedCommentTask(item);

                                                                    setCommentText(
                                                                        item.comment || ""
                                                                    );

                                                                    setCommentModal(true);

                                                                }}
                                                                className="
                                                                    text-cyan-400
                                                                    hover:text-cyan-300
                                                                "
                                                            >
                                                                <MessageSquare size={14} />
                                                            </button>
                                                        </div>

                                                        <div className="
                                                        mt-1
                                                        flex
                                                        justify-between
                                                        items-center
                                                        gap-2
                                                    ">

                                                            <span className="
                                                            text-xs
                                                            text-slate-400
                                                        ">
                                                                Assign To :
                                                                {" "}
                                                                {item.assigned_to}
                                                            </span>

                                                            {
                                                                item.comment && (
                                                                    <span className="
                                                                    text-[10px]
                                                                    text-cyan-400
                                                                    font-semibold
                                                                    truncate
                                                                    max-w-[120px]
                                                                ">
                                                                        {item.comment}
                                                                    </span>
                                                                )
                                                            }

                                                        </div>

                                                        <div className="
                                                                mt-1
                                                                flex
                                                                justify-between
                                                                text-xs
                                                            ">

                                                            <span className="
                                                                    text-green-400
                                                                ">
                                                                Due:
                                                                {" "}
                                                                {item.end_date}
                                                            </span>

                                                            <span className="
                                                                    text-slate-300
                                                                    font-semibold
                                                                ">
                                                                {remainingDays}
                                                                {" "}
                                                                Days Left
                                                            </span>

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )

                                    )
                            }

                        </div>

                    </div>
                </div>

            </div>

            {
                commentModal && (

                    <div className="
                        fixed inset-0
                        z-[999]
                        bg-black/70
                        backdrop-blur-sm

                        flex
                        items-center
                        justify-center
                    ">

                        <div className="
                            w-full
                            max-w-[600px]

                            rounded-[30px]

                            border
                            border-cyan-500/20

                            bg-[#071225]

                            overflow-hidden
                        ">

                            <div className="
                                p-6
                                border-b
                                border-white/10
                            ">

                                <h2 className="
                                    text-xl
                                    font-black
                                    text-white
                                ">
                                    Task Comment
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={commentText}
                                    onChange={(e) =>
                                        setCommentText(
                                            e.target.value
                                        )
                                    }
                                    rows={6}
                                    className="
                                        w-full

                                        rounded-2xl

                                        bg-[#081526]

                                        border
                                        border-white/10

                                        p-4

                                        text-white

                                        resize-none
                                    "
                                    placeholder="
                                        Enter comment...
                                    "
                                />

                            </div>

                            <div className="
                                p-6

                                flex
                                justify-end
                                gap-3
                            ">

                                <button
                                    onClick={() =>
                                        setCommentModal(false)
                                    }
                                    className="
                                        px-5
                                        py-2

                                        rounded-xl

                                        bg-white/5
                                        border
                                        border-white/10

                                        text-white
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {

                                        await handleSaveComment(
                                            selectedCommentTask.id,
                                            commentText
                                        );

                                        setCommentModal(false);

                                    }}
                                    className="
                                        px-5
                                        py-2

                                        rounded-xl

                                        bg-gradient-to-r
                                        from-cyan-500
                                        to-blue-600

                                        text-white
                                        font-bold
                                    "
                                >
                                    Save Comment
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

            {/* MODAL */}
            {openModal && (

                <div className="fixed inset-0 z-50
                bg-black/70 backdrop-blur-sm
                flex items-center justify-center">

                    <div className="w-full max-w-[650px]
                    rounded-[32px]
                    border border-white/10
                    bg-[#071225]
                    overflow-visible">

                        {/* HEADER */}
                        <div className="p-8 border-b border-white/5
                        flex items-center justify-between">

                            <div>

                                <h1 className="text-3xl font-black text-white">

                                    {editMode
                                        ? "Edit Project"
                                        : "Add Project"}

                                </h1>

                                <p className="text-slate-500 mt-2">

                                    Project configuration

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setOpenModal(false)
                                }
                                className="w-12 h-12 rounded-2xl
                                bg-white/5 border border-white/10
                                flex items-center justify-center"
                            >

                                <X size={18} />

                            </button>

                        </div>

                        {/* BODY */}
                        <div className="p-8 space-y-5">

                            <input
                                type="text"
                                placeholder="Project Title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full h-14 px-5 rounded-2xl
                                bg-black/30 border border-white/5 outline-none"
                            />

                            {/* TYPE */}
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type: e.target.value,
                                    })
                                }
                                className="w-full h-14 px-5 rounded-2xl
                                bg-black/30 border border-white/5 outline-none
                                text-white"
                            >

                                <option value="">
                                    Select Type
                                </option>

                                <option value="NPI">
                                    NPI
                                </option>

                                <option value="KAIZEN">
                                    KAIZEN
                                </option>

                                <option value="Downtime and Finding">
                                    Downtime and Finding
                                </option>

                                <option value="VAVE">
                                    VAVE
                                </option>

                            </select>

                            {/* SITE */}
                            <select
                                value={formData.site}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        site: e.target.value,
                                    })
                                }
                                className="w-full h-14 px-5 rounded-2xl
                                bg-black/30 border border-white/5 outline-none
                                text-white"
                            >

                                <option value="">
                                    Select Site
                                </option>

                                {siteList.map((site) => (

                                    <option
                                        key={site.site}
                                        value={site.site}
                                    >

                                        {site.site}

                                    </option>

                                ))}

                            </select>

                            {/* TPM */}
                            <select
                                value={formData.tpm}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        tpm: e.target.value,
                                    })
                                }
                                className="w-full h-14 px-5 rounded-2xl
                                bg-black/30 border border-white/5 outline-none
                                text-white"
                            >

                                <option value="">
                                    Select TPM
                                </option>

                                {tpmList.map((user) => (

                                    <option
                                        key={user.name}
                                        value={user.name}
                                    >

                                        {user.name}

                                    </option>

                                ))}

                            </select>

                            {/* ENGINEER MULTI SELECT */}
                            <div className="relative">

                                {/* LABEL */}
                                <p className="
                                    mb-2
                                    text-sm
                                    font-semibold
                                    text-slate-300
                                ">
                                    Select Engineer
                                </p>

                                {/* SELECT BUTTON */}
                                <button
                                    type="button"

                                    onClick={() =>
                                        setOpenEngineerSelect(
                                            !openEngineerSelect
                                        )
                                    }

                                    className="
                                        w-full
                                        min-h-[56px]
                                        rounded-2xl
                                        border
                                        border-white/5
                                        bg-black/30

                                        px-4
                                        py-3

                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2

                                        text-left
                                    "
                                >

                                    {
                                        formData.ee?.length > 0

                                            ? (

                                                formData.ee.map(
                                                    (name) => (

                                                        <div
                                                            key={name}

                                                            className="
                                                                px-3
                                                                py-1.5

                                                                rounded-xl

                                                                bg-cyan-500/10
                                                                border
                                                                border-cyan-500/20

                                                                text-cyan-300
                                                                text-xs
                                                                font-bold

                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <div className="
                                                                w-5
                                                                h-5
                                                                rounded-full

                                                                bg-gradient-to-r
                                                                from-cyan-400
                                                                to-emerald-400

                                                                flex
                                                                items-center
                                                                justify-center

                                                                text-[10px]
                                                                text-black
                                                                font-black
                                                            ">
                                                                {name.charAt(0)}
                                                            </div>

                                                            {name}

                                                        </div>

                                                    )
                                                )

                                            )

                                            : (

                                                <span className="
                                                    text-slate-500
                                                ">
                                                    Choose engineer...
                                                </span>

                                            )
                                    }

                                </button>

                                {/* DROPDOWN */}
                                {
                                    openEngineerSelect && (

                                        <div className="
                                            absolute
                                            z-50
                                            mt-3
                                            w-full

                                            rounded-2xl

                                            border
                                            border-white/10

                                            bg-[#071225]
                                            backdrop-blur-xl

                                            p-2

                                            max-h-[260px]
                                            overflow-auto

                                            shadow-[0_0_40px_rgba(0,0,0,0.5)]
                                        ">

                                            {
                                                engineerList.map((user) => {

                                                    const selected =
                                                        formData.ee?.includes(
                                                            user.name
                                                        );

                                                    return (

                                                        <button
                                                            key={user.name}

                                                            type="button"

                                                            onClick={() => {

                                                                let updated =
                                                                    [...formData.ee];

                                                                if (selected) {

                                                                    updated =
                                                                        updated.filter(
                                                                            (x) =>
                                                                                x !== user.name
                                                                        );

                                                                } else {

                                                                    updated.push(
                                                                        user.name
                                                                    );

                                                                }

                                                                setFormData({
                                                                    ...formData,
                                                                    ee: updated,
                                                                });

                                                            }}

                                                            className={`
                                                                w-full

                                                                px-4
                                                                py-3

                                                                rounded-xl

                                                                flex
                                                                items-center
                                                                justify-between

                                                                transition-all

                                                                ${selected

                                                                    ? `
                                                                        bg-cyan-500/15
                                                                        border
                                                                        border-cyan-500/20
                                                                    `

                                                                    : `
                                                                        hover:bg-white/5
                                                                    `
                                                                }
                                                            `}
                                                        >

                                                            <div className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            ">

                                                                <div className="
                                                                    w-9
                                                                    h-9

                                                                    rounded-full

                                                                    bg-gradient-to-r
                                                                    from-cyan-400
                                                                    to-emerald-400

                                                                    flex
                                                                    items-center
                                                                    justify-center

                                                                    text-black
                                                                    font-black
                                                                ">
                                                                    {user.name.charAt(0)}
                                                                </div>

                                                                <div className="
                                                                    text-left
                                                                ">

                                                                    <p className="
                                                                        text-white
                                                                        font-semibold
                                                                    ">
                                                                        {user.name}
                                                                    </p>

                                                                    <p className="
                                                                        text-xs
                                                                        text-slate-500
                                                                    ">
                                                                        Engineer
                                                                    </p>

                                                                </div>

                                                            </div>

                                                            {
                                                                selected && (

                                                                    <div className="
                                                                        w-5
                                                                        h-5

                                                                        rounded-full
                                                                        bg-cyan-400
                                                                    "></div>

                                                                )
                                                            }

                                                        </button>

                                                    );

                                                })
                                            }

                                        </div>

                                    )
                                }

                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="p-8 border-t border-white/5
                        flex justify-end gap-4">

                            <button
                                onClick={() =>
                                    setOpenModal(false)
                                }
                                className="h-12 px-6 rounded-2xl
                                bg-white/5"
                            >

                                Cancel

                            </button>

                            <button
                                onClick={handleSaveProject}
                                className="h-12 px-6 rounded-2xl
                                bg-gradient-to-r
                                from-green-500 to-emerald-600
                                font-bold"
                            >

                                Save Project

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
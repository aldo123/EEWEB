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
    X,
} from "lucide-react";

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
            ee: "",
        });

    const [selectedProjectActivity,
        setSelectedProjectActivity] =
        useState(null);

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
                ee: "",
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
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this project?"
                );

            if (!confirmDelete) return;

            try {

                const { error } =
                    await supabase
                        .from("projects")
                        .delete()
                        .eq("id", id);

                if (error) throw error;

                loadProjects();

            } catch (error) {

                console.log(error);

                alert(error.message);

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

            return (

                item.title
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.site
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.ee
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.tpm
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.type
                    ?.toLowerCase()
                    .includes(keyword)

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

    // =========================
    // SUMMARY CARD
    // =========================
    const totalNPI =
        taskHeaders.filter((x) => {

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
        taskHeaders.filter((x) => {

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
        taskHeaders.filter((x) => {

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
        taskHeaders.filter((x) => {

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

    return (

        <div className="
                relative
                space-y-6
                min-h-screen
                overflow-hidden

                bg-[radial-gradient(circle_at_top_right,rgba(0,255,200,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(0,140,255,0.08),transparent_28%),linear-gradient(to_bottom,#020617,#031126,#020617)]
            ">

                {/* BACKGROUND EFFECT */}
                <div className="
                    absolute
                    top-[-200px]
                    right-[-150px]

                    w-[500px]
                    h-[500px]

                    bg-cyan-500/10
                    blur-[160px]
                    rounded-full

                    pointer-events-none
                "></div>

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

            {/* HEADER */}
            <div className="
                relative
                overflow-hidden

                rounded-[32px]

                border
                border-cyan-500/10

                bg-gradient-to-br
                from-[#071428]
                via-[#08192f]
                to-[#05101f]

                shadow-[0_0_80px_rgba(0,255,255,0.05)]

                px-10
                py-4

                flex
                items-start
                justify-between
                gap-6
            ">

                {/* LEFT */}
                <div className="relative z-10">

                    {/* MINI BADGE */}
                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-2xl

                        bg-cyan-500/10
                        border border-cyan-500/20

                        mb-5
                    ">

                        <div className="
                            w-2 h-2
                            rounded-full
                            bg-cyan-400
                            animate-pulse
                        "></div>

                        <span className="
                            text-[11px]
                            font-black
                            tracking-[2px]
                            text-cyan-300
                        ">
                            ENGINEERING MONITORING
                        </span>

                    </div>

                    {/* TITLE */}
                    <h1 className="
                        text-6xl
                        font-black
                        leading-tight
                        bg-gradient-to-r
                        from-white
                        via-cyan-200
                        to-cyan-500
                        bg-clip-text
                        text-transparent
                        
                    ">

                        Project List

                    </h1>
                    <p className="
                        mt-1
                        text-slate-400
                        text-sm
                        font-medium
                    ">
                        Engineering project monitoring & activity management
                    </p>
                </div>
                {/* CYAN GLOW */}
                <div className="
                    absolute
                    top-[-120px]
                    left-[-100px]

                    w-[320px]
                    h-[320px]

                    bg-cyan-400/10
                    blur-[140px]
                    rounded-full
                "></div>

                {/* GREEN GLOW */}
                <div className="
                    absolute
                    bottom-[-180px]
                    right-[120px]

                    w-[320px]
                    h-[320px]

                    bg-emerald-400/10
                    blur-[150px]
                    rounded-full
                "></div>

                {/* BLUE LINE */}
                <div className="
                    absolute
                    inset-0

                    bg-[linear-gradient(to_right,transparent,rgba(0,255,255,0.03),transparent)]

                    pointer-events-none
                "></div>

                {/* RIGHT SUMMARY */}
                <div className="flex gap-4 mt-6 items-end">

                    {/* NPI */}
                    <div className="
                        w-[95px]
                        h-[95px]
                        rounded-[28px]
                        border border-cyan-500/20
                        bg-cyan-500/10
                        backdrop-blur-xl
                        flex flex-col
                        items-center
                        justify-center
                    ">

                        <p className="
                            text-[11px]
                            font-bold
                            text-cyan-400
                            tracking-wide
                        ">
                            NPI
                        </p>

                        <h1 className="
                            text-3xl
                            font-black
                            text-white
                            mt-1
                        ">
                            {totalNPI}
                        </h1>

                    </div>

                    {/* KAIZEN */}
                    <div className="
                        w-[95px]
                        h-[95px]
                        rounded-[28px]
                        border border-green-500/20
                        bg-green-500/10
                        backdrop-blur-xl
                        flex flex-col
                        items-center
                        justify-center
                    ">

                        <p className="
                            text-[11px]
                            font-bold
                            text-green-400
                            tracking-wide
                        ">
                            KAIZEN
                        </p>

                        <h1 className="
                            text-3xl
                            font-black
                            text-white
                            mt-1
                        ">
                            {totalKaizen}
                        </h1>

                    </div>

                    {/* DT */}
                    <div className="
                        w-[95px]
                        h-[95px]
                        rounded-[28px]
                        border border-yellow-500/20
                        bg-yellow-500/10
                        backdrop-blur-xl
                        flex flex-col
                        items-center
                        justify-center
                    ">

                        <p className="
                            text-[10px]
                            font-bold
                            text-yellow-400
                            tracking-wide
                            text-center
                            leading-3
                        ">
                            DT & FINDING
                        </p>

                        <h1 className="
                            text-3xl
                            font-black
                            text-white
                            mt-1
                        ">
                            {totalDT}
                        </h1>

                    </div>

                    {/* VAVE */}
                    <div className="
                        w-[95px]
                        h-[95px]
                        rounded-[28px]
                        border border-purple-500/20
                        bg-purple-500/10
                        backdrop-blur-xl
                        flex flex-col
                        items-center
                        justify-center
                    ">

                        <p className="
                            text-[11px]
                            font-bold
                            text-purple-400
                            tracking-wide
                        ">
                            VAVE
                        </p>

                        <h1 className="
                            text-3xl
                            font-black
                            text-white
                            mt-1
                        ">
                            {totalVAVE}
                        </h1>

                    </div>

                </div>

            </div>

            {/* FILTER */}
            <div className="rounded-[32px]
            border border-white/5
            bg-white/[0.03]
            backdrop-blur-2xl
            p-5">

                <div className="flex items-center gap-4">

                    {/* SEARCH */}
                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            placeholder="Search project..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="w-full h-14 rounded-2xl
                            bg-black/20
                            border border-white/5
                            pl-14 pr-5
                            text-white
                            placeholder:text-slate-500
                            outline-none
                            focus:border-green-500/20"
                        />

                    </div>

                    {/* ADD PROJECT */}
                    <button
                        onClick={() => {

                            setEditMode(false);

                            setFormData({
                                title: "",
                                type: "",
                                site: "",
                                tpm: "",
                                ee: "",
                            });

                            setOpenModal(true);

                        }}
                        className="h-14 px-6 rounded-2xl
                        shrink-0
                        bg-gradient-to-r
                        from-green-500 to-emerald-600
                        shadow-[0_0_30px_rgba(34,197,94,.25)]
                        flex items-center gap-3
                        text-sm font-bold transition-all"
                    >

                        <Plus size={16} />

                        Add Project

                    </button>

                </div>

            </div>

            {/* PROJECT GRID */}
            <div className="
                    relative
                    z-10
                    grid
                    grid-cols-4
                    gap-6
                ">

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

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProject(item.id)
                                            }}

                                            className="w-10 h-10 rounded-xl
                                            bg-red-500/10
                                            border border-red-500/20
                                            flex items-center justify-center"
                                        >

                                            <Trash2
                                                size={16}
                                                className="text-red-400"
                                            />

                                        </button>

                                        <button
                                            onClick={(e) => {

                                                e.stopPropagation();

                                                setEditMode(true);

                                                setSelectedProject(item);

                                                setFormData({
                                                    title: item.title || "",
                                                    type: item.type || "",
                                                    site: item.site || "",
                                                    tpm: item.tpm || "",
                                                    ee: item.ee || "",
                                                });

                                                setOpenModal(true);

                                            }}
                                            className="w-10 h-10 rounded-xl
                                            bg-yellow-500/10
                                            border border-yellow-500/20
                                            flex items-center justify-center"
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

                                            <p className="font-semibold text-white">
                                                {item.ee}
                                            </p>

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

            {/* MODAL */}
            {openModal && (

                <div className="fixed inset-0 z-50
                bg-black/70 backdrop-blur-sm
                flex items-center justify-center">

                    <div className="w-full max-w-[650px]
                    rounded-[32px]
                    border border-white/10
                    bg-[#071225]
                    overflow-hidden">

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

                            {/* ENGINEER */}
                            <select
                                value={formData.ee}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ee: e.target.value,
                                    })
                                }
                                className="w-full h-14 px-5 rounded-2xl
                                bg-black/30 border border-white/5 outline-none
                                text-white"
                            >

                                <option value="">
                                    Select Engineer
                                </option>

                                {engineerList.map((user) => (

                                    <option
                                        key={user.name}
                                        value={user.name}
                                    >

                                        {user.name}

                                    </option>

                                ))}

                            </select>

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
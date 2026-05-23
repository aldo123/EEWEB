import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Users,
    UserCog,
    X,
    Save,
} from "lucide-react";

import { supabase }
    from "../../supabase/supabase";

export default function WorkflowManagement() {

    const [workflows, setWorkflows] =
        useState([]);

    const [engineers, setEngineers] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [openModal, setOpenModal] =
        useState(false);

    const [editingEngineer, setEditingEngineer] =
        useState(null);

    const [editingTechnician, setEditingTechnician] =
        useState(null);

    const [modalType, setModalType] =
        useState("engineer");

    const [form, setForm] =
        useState({

            engineer: "",
            technician: "",

        });

    // =====================================
    // FETCH WORKFLOW
    // =====================================
    const fetchWorkflow =
        async () => {

            const { data, error } =
                await supabase
                    .from("workflow")
                    .select("*")
                    .order("engineer", {
                        ascending: true,
                    });

            if (error) {

                console.log(error);

                return;

            }

            setWorkflows(data || []);

        };

    // =====================================
    // FETCH USERS
    // =====================================
    const fetchUsers =
        async () => {

            // ENGINEER
            const {
                data: engineerData
            } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq(
                        "role",
                        "Engineer"
                    );

            // TECHNICIAN
            const {
                data: technicianData
            } =
                await supabase
                    .from("users")
                    .select("*")
                    .eq(
                        "role",
                        "Technician"
                    );

            setEngineers(
                engineerData || []
            );

            setTechnicians(
                technicianData || []
            );

        };

    useEffect(() => {

        fetchWorkflow();

        fetchUsers();

    }, []);

    // =====================================
    // GROUP ENGINEER
    // =====================================
    const groupedWorkflow =
        useMemo(() => {

            const grouped = {};

            workflows.forEach((item) => {

                if (
                    !grouped[item.engineer]
                ) {

                    grouped[item.engineer] = [];

                }

                grouped[
                    item.engineer
                ].push(item);

            });

            return grouped;

        }, [workflows]);

    // =====================================
    // FILTER
    // =====================================
    const filteredEngineer =
        Object.keys(groupedWorkflow)
            .filter((engineer) => {

                const lower =
                    search.toLowerCase();

                return (

                    engineer
                        .toLowerCase()
                        .includes(lower)

                    ||

                    groupedWorkflow[
                        engineer
                    ].some((item) =>
                        item.technician
                            ?.toLowerCase()
                            .includes(lower)
                    )

                );

            });

    // =====================================
    // ADD ENGINEER
    // =====================================
    const handleAddEngineer =
        () => {

            setModalType("engineer");

            setEditingEngineer(null);

            setEditingTechnician(null);

            setForm({

                engineer: "",
                technician: "",

            });

            setOpenModal(true);

        };

    // =====================================
    // ADD TECHNICIAN
    // =====================================
    const handleAddTechnician =
        (engineer) => {

            setModalType("technician");

            setEditingEngineer(engineer);

            setEditingTechnician(null);

            setForm({

                engineer,
                technician: "",

            });

            setOpenModal(true);

        };

    // =====================================
    // EDIT TECHNICIAN
    // =====================================
    const handleEdit =
        (item) => {

            setModalType("technician");

            setEditingEngineer(
                item.engineer
            );

            setEditingTechnician({
                ...item
            });

            setForm({

                engineer:
                    item.engineer,

                technician:
                    item.technician,

            });

            setOpenModal(true);

        };

    // =====================================
    // SAVE
    // =====================================
    const handleSave =
        async () => {

            try {

                // =================================
                // ADD ENGINEER
                // =================================
                if (
                    modalType ===
                    "engineer"
                ) {

                    if (
                        !form.engineer
                    ) {

                        alert(
                            "Engineer required"
                        );

                        return;

                    }

                    const exist =
                        workflows.find(
                            (w) =>
                                w.engineer
                                    ?.toLowerCase()
                                ===
                                form.engineer
                                    ?.toLowerCase()
                        );

                    if (exist) {

                        alert(
                            "Engineer already exists"
                        );

                        return;

                    }

                    const { error } =
                        await supabase
                            .from("workflow")
                            .insert([
                                {

                                    firebase_id:
                                        crypto.randomUUID(),

                                    engineer:
                                        form.engineer,

                                    technician:
                                        "",

                                },
                            ]);

                    if (error) {

                        console.log(error);

                        alert(
                            error.message
                        );

                        return;

                    }

                }

                // =================================
                // TECHNICIAN
                // =================================
                else {

                    if (
                        !form.technician
                    ) {

                        alert(
                            "Technician required"
                        );

                        return;

                    }

                    // =============================
                    // EDIT TECHNICIAN
                    // =============================
                    if (
                        editingTechnician !==
                        null
                    ) {

                        const { error } =
                            await supabase
                                .from("workflow")
                                .update({

                                    technician:
                                        form.technician,

                                })
                                .eq(
                                    "firebase_id",
                                    editingTechnician.firebase_id
                                );

                        if (error) {

                            console.log(error);

                            alert(
                                error.message
                            );

                            return;

                        }

                    }

                    // =============================
                    // ADD TECHNICIAN
                    // =============================
                    else {

                        const { error } =
                            await supabase
                                .from("workflow")
                                .insert([
                                    {

                                        firebase_id:
                                            crypto.randomUUID(),

                                        engineer:
                                            form.engineer,

                                        technician:
                                            form.technician,

                                    },
                                ]);

                        if (error) {

                            console.log(error);

                            alert(
                                error.message
                            );

                            return;

                        }

                    }

                }

                // =================================
                // RESET
                // =================================
                setOpenModal(false);

                setEditingTechnician(null);

                setEditingEngineer(null);

                setForm({

                    engineer: "",
                    technician: "",

                });

                fetchWorkflow();

            } catch (error) {

                console.log(error);

            }

        };

    // =====================================
    // DELETE TECHNICIAN
    // =====================================
    const handleDeleteTechnician =
        async (firebase_id) => {

            const confirmDelete =
                window.confirm(
                    "Delete technician?"
                );

            if (!confirmDelete)
                return;

            const { error } =
                await supabase
                    .from("workflow")
                    .delete()
                    .eq(
                        "firebase_id",
                        firebase_id
                    );

            if (error) {

                console.log(error);

                return;

            }

            fetchWorkflow();

        };

    // =====================================
    // DELETE ENGINEER
    // =====================================
    const handleDeleteEngineer =
        async (
            engineer
        ) => {

            const confirmDelete =
                window.confirm(
                    `Delete ${engineer}?`
                );

            if (!confirmDelete)
                return;

            const { error } =
                await supabase
                    .from("workflow")
                    .delete()
                    .eq(
                        "engineer",
                        engineer
                    );

            if (error) {

                console.log(error);

                return;

            }

            fetchWorkflow();

        };

    return (

        <div className="w-full">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-8">

                <div>

                    <h1 className="text-5xl font-black text-white tracking-tight">

                        Workflow Management

                    </h1>

                    <p className="text-slate-500 mt-2">

                        Engineering workflow assignment management

                    </p>

                </div>

                <button
                    onClick={
                        handleAddEngineer
                    }
                    className="
                    h-14
                    px-7
                    rounded-2xl
                    bg-gradient-to-r
                    from-green-500
                    to-emerald-600
                    shadow-[0_0_40px_rgba(34,197,94,.25)]
                    hover:scale-[1.02]
                    transition-all
                    flex items-center gap-3
                    text-sm font-bold text-white"
                >

                    <Plus size={18} />

                    Add Engineer

                </button>

            </div>

            {/* SEARCH */}
            <div className="
                rounded-[32px]
                border border-white/5
                bg-white/[0.03]
                backdrop-blur-2xl
                p-4 mb-8">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        type="text"
                        placeholder="Search engineer or technician..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="
                        w-full h-14 rounded-2xl
                        bg-black/20
                        border border-white/5
                        pl-14 pr-5
                        text-white
                        placeholder:text-slate-500
                        outline-none
                        focus:border-green-500/20"
                    />

                </div>

            </div>

            {/* GRID */}
            <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-4
                gap-5">

                {filteredEngineer.map(
                    (engineer) => (

                        <div
                            key={engineer}
                            className="
                            relative
                            rounded-[36px]
                            border border-white/5
                            bg-gradient-to-br
                            from-[#071120]
                            to-[#09182b]
                            backdrop-blur-2xl
                            overflow-hidden
                            hover:border-green-500/20
                            transition-all"
                        >

                            {/* GLOW */}
                            <div className="
                            absolute top-[-60px] right-[-60px]
                            w-[180px] h-[180px]
                            bg-green-500/10
                            blur-[80px]
                            rounded-full"></div>

                            {/* CONTENT */}
                            <div className="relative z-10 p-6">

                                {/* HEADER */}
                                <div className="
                                flex items-start justify-between">

                                    <div>

                                        {/* ICON */}
                                        <div className="
                                        w-16 h-16 rounded-[24px]
                                        bg-gradient-to-br
                                        from-green-400
                                        to-emerald-600
                                        flex items-center justify-center
                                        shadow-[0_0_40px_rgba(34,197,94,.35)]">

                                            <UserCog
                                                size={28}
                                                className="text-white"
                                            />

                                        </div>

                                        {/* TITLE */}
                                        <h1 className="
                                        mt-6 text-2xl
                                        font-black text-white">

                                            {engineer}

                                        </h1>

                                        <p className="
                                        mt-1 text-slate-500 text-sm">

                                            Workflow Engineer

                                        </p>

                                    </div>

                                    {/* DELETE ENGINEER */}
                                    <button
                                        onClick={() =>
                                            handleDeleteEngineer(
                                                engineer
                                            )
                                        }
                                        className="
                                        w-10 h-10 rounded-xl
                                        bg-red-500/10
                                        border border-red-500/20
                                        flex items-center justify-center
                                        hover:bg-red-500/20
                                        transition-all"
                                    >

                                        <Trash2
                                            size={15}
                                            className="text-red-400"
                                        />

                                    </button>

                                </div>

                                {/* ADD TECHNICIAN */}
                                <button
                                    onClick={() =>
                                        handleAddTechnician(
                                            engineer
                                        )
                                    }
                                    className="
                                    mt-5 h-10 px-4 rounded-2xl
                                    bg-green-500/10
                                    border border-green-500/20
                                    hover:bg-green-500/20
                                    transition-all
                                    flex items-center gap-2
                                    text-xs font-semibold text-green-400"
                                >

                                    <Plus size={14} />

                                    Add Technician

                                </button>

                                {/* TECHNICIAN LIST */}
                                <div className="
                                mt-6 space-y-3">

                                    {groupedWorkflow[
                                        engineer
                                    ]
                                        .filter(
                                            (item) =>
                                                item.technician &&
                                                item.technician.trim() !== ""
                                        )
                                        .map((item) => (

                                            <div
                                                key={item.firebase_id}
                                                className="
                                                rounded-2xl
                                                border border-white/5
                                                bg-black/20
                                                px-3 py-3"
                                            >

                                                <div className="
                                                flex items-center justify-between">

                                                    {/* LEFT */}
                                                    <div className="
                                                    flex items-center gap-3">

                                                        <div className="
                                                        w-10 h-10 rounded-xl
                                                        bg-green-500/10
                                                        flex items-center justify-center">

                                                            <Users
                                                                size={16}
                                                                className="text-green-400"
                                                            />

                                                        </div>

                                                        <div>

                                                            <h1 className="
                                                            text-white text-sm font-semibold">

                                                                {item.technician}

                                                            </h1>

                                                            <p className="
                                                            text-slate-500 text-xs">

                                                                Technician

                                                            </p>

                                                        </div>

                                                    </div>

                                                    {/* ACTION */}
                                                    <div className="
                                                    flex items-center gap-2">

                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    item
                                                                )
                                                            }
                                                            className="
                                                            w-9 h-9 rounded-xl
                                                            bg-yellow-500/10
                                                            border border-yellow-500/20
                                                            flex items-center justify-center
                                                            hover:bg-yellow-500/20"
                                                        >

                                                            <Pencil
                                                                size={14}
                                                                className="text-yellow-400"
                                                            />

                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTechnician(
                                                                    item.firebase_id
                                                                )
                                                            }
                                                            className="
                                                            w-9 h-9 rounded-xl
                                                            bg-red-500/10
                                                            border border-red-500/20
                                                            flex items-center justify-center
                                                            hover:bg-red-500/20"
                                                        >

                                                            <Trash2
                                                                size={14}
                                                                className="text-red-400"
                                                            />

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        ))}

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>

            {/* MODAL */}
            {openModal && (

                <div className="
                    fixed inset-0 z-50
                    bg-black/70
                    backdrop-blur-md
                    flex items-center justify-center p-6">

                    <div className="
                        w-full max-w-[520px]
                        rounded-[36px]
                        border border-white/10
                        bg-[#07111f]
                        overflow-hidden">

                        {/* HEADER */}
                        <div className="
                            px-8 py-6 border-b border-white/5
                            flex items-center justify-between">

                            <div>

                                <h1 className="
                                text-3xl font-black text-white">

                                    {modalType ===
                                        "engineer"
                                        ? "Add Engineer"
                                        : editingTechnician?.firebase_id
                                            ? "Edit Technician"
                                            : "Add Technician"}

                                </h1>

                                <p className="
                                text-slate-500 mt-2">

                                    Workflow configuration

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setOpenModal(
                                        false
                                    )
                                }
                                className="
                                w-12 h-12 rounded-2xl
                                bg-white/[0.04]
                                border border-white/5
                                flex items-center justify-center"
                            >

                                <X size={18} />

                            </button>

                        </div>

                        {/* BODY */}
                        <div className="
                            p-8 space-y-5">

                            {/* ENGINEER */}
                            <div>

                                <label className="
                                block text-sm text-slate-400 mb-2">

                                    Engineer

                                </label>

                                <select
                                    value={form.engineer}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            engineer:
                                                e.target.value,

                                        })
                                    }
                                    disabled={
                                        modalType ===
                                        "technician"
                                    }
                                    className="
                                    w-full h-14 rounded-2xl
                                    bg-black/20
                                    border border-white/5
                                    px-5
                                    text-white
                                    outline-none
                                    focus:border-green-500/20"
                                >

                                    <option value="">
                                        Select Engineer
                                    </option>

                                    {engineers.map(
                                        (item) => (

                                            <option
                                                key={
                                                    item.firebase_id
                                                }
                                                value={item.name}
                                            >

                                                {item.name}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            {/* TECHNICIAN */}
                            {modalType ===
                                "technician" && (

                                    <div>

                                        <label className="
                                        block text-sm text-slate-400 mb-2">

                                            Technician

                                        </label>

                                        <select
                                            value={form.technician}
                                            onChange={(e) =>
                                                setForm({

                                                    ...form,
                                                    technician:
                                                        e.target.value,

                                                })
                                            }
                                            className="
                                            w-full h-14 rounded-2xl
                                            bg-black/20
                                            border border-white/5
                                            px-5
                                            text-white
                                            outline-none
                                            focus:border-green-500/20"
                                        >

                                            <option value="">
                                                Select Technician
                                            </option>

                                            {technicians.map(
                                                (item) => (

                                                    <option
                                                        key={
                                                            item.firebase_id
                                                        }
                                                        value={item.name}
                                                    >

                                                        {item.name}

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                )}

                        </div>

                        {/* FOOTER */}
                        <div className="
                            px-8 py-6 border-t border-white/5
                            flex items-center justify-end gap-4">

                            <button
                                onClick={() =>
                                    setOpenModal(
                                        false
                                    )
                                }
                                className="
                                h-12 px-5 rounded-2xl
                                bg-white/[0.04]
                                border border-white/5
                                text-slate-300"
                            >

                                Cancel

                            </button>

                            <button
                                onClick={
                                    handleSave
                                }
                                className="
                                h-12 px-6 rounded-2xl
                                bg-gradient-to-r
                                from-green-500
                                to-emerald-600
                                flex items-center gap-3
                                font-bold
                                shadow-[0_0_30px_rgba(34,197,94,.3)]"
                            >

                                <Save size={18} />

                                Save

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
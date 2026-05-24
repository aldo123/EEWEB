import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Shield,
    User,
    X,
    Save,
} from "lucide-react";

import { supabase }
    from "../../supabase/supabase";

export default function UserRoleManagement() {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [openModal, setOpenModal] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState(null);

    const [form, setForm] =
        useState({

            name: "",
            username: "",
            password: "",
            role: "",

        });

    // =========================
    // LOAD USERS
    // =========================
    const loadUsers = async () => {

        try {

            setLoading(true);

            const { data, error } =
                await supabase
                    .from("users")
                    .select("*")
                    .order("name", {
                        ascending: true,
                    });

            if (error) {

                console.log(error);

                return;

            }

            setUsers(data || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadUsers();

    }, []);

    // =========================
    // SEARCH FILTER
    // =========================
    const filteredUsers =
        users.filter((item) =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    // =========================
    // OPEN ADD MODAL
    // =========================
    const handleAddUser = () => {

        setEditingUser(null);

        setForm({

            name: "",
            username: "",
            password: "",
            role: "",

        });

        setOpenModal(true);

    };

    // =========================
    // OPEN EDIT
    // =========================
    const handleEditUser = (
        user
    ) => {

        setEditingUser(user);

        setForm({

            name: user.name || "",
            username:
                user.username || "",
            password:
                user.password || "",
            role: user.role || "",

        });

        setOpenModal(true);

    };

    // =========================
    // SAVE USER
    // =========================
    const handleSaveUser =
        async () => {
            // ====================
            // VALIDATION
            // ====================
            if (
                !form.name ||
                !form.username ||
                !form.password ||
                !form.role
            ) {

                alert(
                    "Please complete all fields"
                );

                return;

            }
            try {

                // ====================
                // UPDATE
                // ====================
                if (editingUser) {

                    const { error } =
                        await supabase
                            .from("users")
                            .update({

                                name: form.name,
                                username:
                                    form.username,
                                password:
                                    form.password,
                                role: form.role,

                            })
                            .eq(
                                "firebase_id",
                                editingUser.firebase_id
                            );

                    if (error) {

                        console.log(error);

                        alert(
                            "Update failed"
                        );

                        return;

                    }

                    alert(
                        "User updated"
                    );

                }

                // ====================
                // ADD
                // ====================
                else {

                    const { error } =
                        await supabase
                            .from("users")
                            .insert([{

                                firebase_id:
                                    crypto.randomUUID(),

                                name: form.name,

                                username:
                                    form.username,

                                password:
                                    form.password,

                                role: form.role,

                            }]);

                    if (error) {

                        console.log(error);

                        alert(
                            "Add user failed"
                        );

                        return;

                    }

                    alert(
                        "User added"
                    );

                }

                setOpenModal(false);

                loadUsers();

            } catch (error) {

                console.log(error);

            }

        };

    // =========================
    // DELETE USER
    // =========================
    const handleDeleteUser =
        async (user) => {

            const confirmDelete =
                window.confirm(
                    `Delete ${user.name}?`
                );

            if (!confirmDelete)
                return;

            try {

                const { error } =
                    await supabase
                        .from("users")
                        .delete()
                        .eq(
                            "firebase_id",
                            user.firebase_id
                        );

                if (error) {

                    console.log(error);

                    alert(
                        "Delete failed"
                    );

                    return;

                }

                alert(
                    "User deleted"
                );

                loadUsers();

            } catch (error) {

                console.log(error);

            }

        };

    return (

        <div className="
relative
space-y-6
min-h-screen
overflow-hidden

bg-[radial-gradient(circle_at_top_right,rgba(0,255,200,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(0,140,255,0.08),transparent_28%),linear-gradient(to_bottom,#020617,#031126,#020617)]
">

            {/* BACKGROUND GLOW */}
            <div className="
        absolute
        top-[-200px]
        right-[-100px]

        w-[500px]
        h-[500px]

        bg-cyan-500/10
        blur-[180px]
        rounded-full
        pointer-events-none
    "></div>

            <div className="
        absolute
        bottom-[-300px]
        left-[-200px]

        w-[600px]
        h-[600px]

        bg-emerald-500/10
        blur-[180px]
        rounded-full
        pointer-events-none
    "></div>

            {/* HERO HEADER */}
            <div className="
        relative
        overflow-hidden

        rounded-[36px]

        border border-cyan-500/10

        bg-gradient-to-br
        from-[#071428]
        via-[#08192f]
        to-[#05101f]

        shadow-[0_0_80px_rgba(0,255,255,0.05)]

        px-10
        py-8

        flex
        items-start
        justify-between
        gap-6
    ">

                {/* LEFT */}
                <div className="relative z-10">

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
                            ACCESS CONTROL SYSTEM
                        </span>

                    </div>

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

                        User Management

                    </h1>

                    <p className="
                mt-2
                text-slate-400
                text-sm
                font-medium
            ">
                        Enterprise access control & user role configuration
                    </p>

                </div>



            </div>

            {/* SEARCH */}
            <div className="
                    rounded-[32px]
                    border border-white/5
                    bg-white/[0.03]
                    backdrop-blur-2xl
                    p-5
                ">

                <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="
                                    absolute
                                    left-5
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-500
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search user, username, role..."
                                className="
                                    w-full
                                    h-14
                                    rounded-2xl

                                    bg-black/20
                                    border border-white/5

                                    pl-14
                                    pr-5

                                    text-white
                                    placeholder:text-slate-500

                                    outline-none

                                    focus:border-cyan-500/20
                                "
                            />

                        </div>

                        <button
                            onClick={handleAddUser}
                            className="
                                h-14
                                px-7
                                rounded-2xl

                                bg-gradient-to-r
                                from-green-500
                                to-emerald-600

                                shadow-[0_0_30px_rgba(34,197,94,.25)]

                                flex
                                items-center
                                gap-3

                                text-sm
                                font-bold
                                shrink-0
                            "
                        >

                            <Plus size={18} />

                            Add User

                        </button>

                    </div>

            </div>


            {/* USER LIST */}
            <div className="
                rounded-[36px]

                border
                border-cyan-500/10

                bg-gradient-to-b
                from-[#07111f]
                to-[#040b16]

                backdrop-blur-2xl

                shadow-[0_0_50px_rgba(0,255,255,0.04)]

                overflow-auto
                max-h-[75vh]
            ">

                {/* HEADER */}
                <div className="
                    grid
                    grid-cols-12
                    px-8
                    h-16

                    border-b
                    border-cyan-500/10

                    text-cyan-300
                    text-sm
                    font-semibold
                    tracking-wide

                    bg-gradient-to-r
                    from-[#081120]
                    via-[#071827]
                    to-[#081120]

                    shadow-[0_10px_40px_rgba(0,0,0,.35)]

                    sticky
                    top-0
                    z-20

                    backdrop-blur-xl
                ">

                    <div className="col-span-4 flex items-center">

                        User

                    </div>

                    <div className="col-span-2 flex items-center">

                        Role

                    </div>

                    <div className="col-span-2 flex items-center">

                        Username

                    </div>

                    <div className="col-span-2 flex items-center">

                        Status

                    </div>

                    <div className="col-span-2 flex items-center justify-center">

                        Action

                    </div>

                </div>

                {/* BODY */}
                {loading ? (

                    <div className="h-[300px] flex items-center justify-center text-slate-500">

                        Loading users...

                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="h-[300px] flex items-center justify-center text-slate-500">

                        No users found

                    </div>

                ) : (

                    filteredUsers.map((item) => (

                        <div
                            key={item.firebase_id}

                            className="
                            group
                            relative

                            grid
                            grid-cols-12

                            px-8
                            h-24

                            border-b
                            border-white/[0.04]

                            bg-gradient-to-r
                            from-white/[0.015]
                            to-transparent

                            hover:bg-cyan-500/[0.04]
                            hover:shadow-[0_0_40px_rgba(0,255,255,0.05)]

                            transition-all
                            duration-300

                            backdrop-blur-xl
                            overflow-hidden
                            "
                        >

                            {/* LEFT GLOW */}
                            <div className="
                                absolute
                                left-0
                                top-0

                                w-[3px]
                                h-full

                                bg-gradient-to-b
                                from-cyan-400
                                to-emerald-400

                                opacity-0
                                group-hover:opacity-100

                                transition-all
                                duration-300
                            "></div>

                            {/* USER */}
                            <div className="col-span-4 flex items-center gap-4">

                                <div className="
                                    relative

                                    w-14
                                    h-14

                                    rounded-[18px]

                                    bg-gradient-to-br
                                    from-cyan-400
                                    via-emerald-400
                                    to-green-500

                                    flex
                                    items-center
                                    justify-center

                                    font-black
                                    text-xl
                                    text-white

                                    shadow-[0_0_25px_rgba(0,255,200,.35)]

                                    group-hover:scale-105
                                    transition-all
                                    duration-300
                                    ">

                                    {item.name?.charAt(0)}

                                </div>

                                <div>

                                    <h2 className="font-bold text-white text-lg">

                                        {item.name}

                                    </h2>

                                    <p className="text-slate-500 text-sm mt-1">

                                        Enterprise User

                                    </p>

                                </div>

                            </div>

                            {/* ROLE */}
                            <div className="col-span-2 flex items-center">

                                <div className="inline-flex px-4 py-2 rounded-xl bg-gradient-to-r
                                    from-emerald-500/10
                                    to-cyan-500/10

                                    border
                                    border-cyan-400/20

                                    shadow-[0_0_15px_rgba(0,255,200,.08)] text-green-400 text-sm font-semibold">

                                    {item.role}

                                </div>

                            </div>

                            {/* USERNAME */}
                            <div className="col-span-2 flex items-center">

                                <p className="text-white font-medium">

                                    @{item.username}

                                </p>

                            </div>

                            {/* STATUS */}
                            <div className="col-span-2 flex items-center gap-3">

                                <div className="w-2 h-2 rounded-full bg-green-400"></div>

                                <p className="text-green-400 font-semibold">

                                    Active

                                </p>

                            </div>

                            {/* ACTION */}
                            <div className="col-span-2 flex items-center justify-center gap-3">

                                {/* EDIT */}
                                <button
                                    onClick={() =>
                                        handleEditUser(
                                            item
                                        )
                                    }
                                    className="w-11 h-11 rounded-2xl
            bg-gradient-to-br
            from-yellow-500/10
            to-orange-500/10
            border border-yellow-500/20
            flex items-center justify-center
            hover:bg-yellow-500/20
            transition-all"
                                >

                                    <Pencil
                                        size={16}
                                        className="text-yellow-400"
                                    />

                                </button>

                                {/* DELETE */}
                                <button
                                    onClick={() =>
                                        handleDeleteUser(
                                            item
                                        )
                                    }
                                    className="w-11 h-11 rounded-2xl
            bg-gradient-to-br
            from-red-500/10
            to-pink-500/10
            border border-red-500/20
            flex items-center justify-center
            hover:bg-red-500/20
            transition-all"
                                >

                                    <Trash2
                                        size={16}
                                        className="text-red-400"
                                    />

                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>

            {/* MODAL */}
            {openModal && (

                <div className="fixed inset-0 z-50
        bg-black/70
        backdrop-blur-md
        flex items-center justify-center p-6">

                    <div className="w-full max-w-[520px]
          rounded-[36px]
          border border-white/10
          bg-[#07111f]
          overflow-hidden">

                        {/* HEADER */}
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">

                            <div>

                                <h1 className="text-3xl font-black text-white">

                                    {editingUser
                                        ? "Edit User"
                                        : "Add User"}

                                </h1>

                                <p className="text-slate-500 mt-2">

                                    User account configuration

                                </p>

                            </div>

                            <button
                                onClick={() =>
                                    setOpenModal(
                                        false
                                    )
                                }
                                className="w-12 h-12 rounded-2xl
                bg-white/[0.04]
                border border-white/5
                flex items-center justify-center"
                            >

                                <X size={18} />

                            </button>

                        </div>

                        {/* BODY */}
                        <div className="p-8 space-y-5">

                            {/* NAME */}
                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Full Name

                                </label>

                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            name:
                                                e.target.value,

                                        })
                                    }
                                    className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20"
                                />

                            </div>

                            {/* USERNAME */}
                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Username

                                </label>

                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            username:
                                                e.target.value,

                                        })
                                    }
                                    className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20"
                                />

                            </div>

                            {/* PASSWORD */}
                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Password

                                </label>

                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            password:
                                                e.target.value,

                                        })
                                    }
                                    className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20"
                                />

                            </div>

                            {/* ROLE */}
                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Role

                                </label>

                                <select
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            role:
                                                e.target.value,

                                        })
                                    }
                                    className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20"
                                >

                                    <option value="">
                                        Select Role
                                    </option>

                                    <option>
                                        Admin
                                    </option>

                                    <option>
                                        Manager
                                    </option>

                                    <option>
                                        Engineer
                                    </option>

                                    <option>
                                        Technician
                                    </option>

                                    <option>
                                        Production
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-end gap-4">

                            <button
                                onClick={() =>
                                    setOpenModal(
                                        false
                                    )
                                }
                                className="h-12 px-5 rounded-2xl
                bg-white/[0.04]
                border border-white/5
                text-slate-300"
                            >

                                Cancel

                            </button>

                            <button
                                onClick={
                                    handleSaveUser
                                }
                                className="h-12 px-6 rounded-2xl
                bg-gradient-to-r from-green-500 to-emerald-600
                flex items-center gap-3
                font-bold shadow-[0_0_30px_rgba(34,197,94,.3)]"
                            >

                                <Save size={18} />

                                Save User

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
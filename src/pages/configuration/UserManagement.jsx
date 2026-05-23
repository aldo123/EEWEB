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

        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-4xl font-black text-white">

                        User & Role Management

                    </h1>

                    <p className="text-slate-500 mt-2">

                        Enterprise access control management

                    </p>

                </div>

                {/* ADD */}
                <button
                    onClick={handleAddUser}
                    className="h-14 px-6 rounded-2xl
          bg-gradient-to-r from-green-500 to-emerald-600
          shadow-[0_0_30px_rgba(34,197,94,.25)]
          flex items-center gap-3
          text-sm font-bold"
                >

                    <Plus size={18} />

                    Add User

                </button>

            </div>

            {/* SEARCH */}
            <div className="rounded-[32px]
      border border-white/5
      bg-white/[0.03]
      backdrop-blur-2xl
      p-5">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search user..."
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

            </div>


            {/* USER LIST */}
            <div className="rounded-[36px] border border-white/5 bg-white/[0.03] backdrop-blur-2xl overflow-hidden">

                {/* HEADER */}
                <div className="grid grid-cols-12 px-8 h-16 border-b border-white/5 text-slate-500 text-sm font-medium">

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
                            className="grid grid-cols-12 px-8 h-24 border-b border-white/5 hover:bg-green-500/[0.03] transition-all duration-300"
                        >

                            {/* USER */}
                            <div className="col-span-4 flex items-center gap-4">

                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(34,197,94,.25)]">

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

                                <div className="inline-flex px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">

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
            bg-yellow-500/10
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
            bg-red-500/10
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
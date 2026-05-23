import { useEffect, useState }
    from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Factory,
    GitBranch,
    X,
    Save,
} from "lucide-react";

import { supabase }
    from "../../supabase/supabase";

export default function LineManagement() {

    const [lines, setLines] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [openModal, setOpenModal] =
        useState(false);

    const [editingLine, setEditingLine] =
        useState(null);

    const [modalType, setModalType] =
        useState("line");

    const [form, setForm] =
        useState({

            model: "",
            name: "",

        });

    // =========================================
    // LOAD DATA
    // =========================================
    const loadLines = async () => {

        const { data, error } =
            await supabase
                .from("lines")
                .select("*")
                .order("model", {
                    ascending: true,
                });

        if (error) {

            console.log(error);

            return;

        }

        setLines(data || []);

    };

    useEffect(() => {

        loadLines();

    }, []);

    // =========================================
    // GROUP BY MODEL
    // =========================================
    const groupedData =
        lines.reduce((acc, item) => {

            if (
                !acc[item.model]
            ) {

                acc[item.model] = [];

            }

            acc[item.model].push(item);

            return acc;

        }, {});

    // =========================================
    // FILTER SEARCH
    // =========================================
    const filteredModels =
        Object.keys(groupedData)
            .filter((model) => {

                const lineMatch =
                    groupedData[
                        model
                    ].some((line) =>
                        line.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                    );

                return (
                    model
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        ) || lineMatch
                );

            });

    // =========================================
    // ADD MODEL
    // =========================================
    const handleAdd =
        () => {

            setModalType("model");

            setEditingLine(null);

            setForm({

                model: "",
                name: "",

            });

            setOpenModal(true);

        };

    // =========================================
    // ADD LINE
    // =========================================
    const handleAddLine =
        (modelName) => {

            setModalType("line");

            setEditingLine(null);

            setForm({

                model: modelName,
                name: "",

            });

            setOpenModal(true);

        };

    // =========================================
    // EDIT
    // =========================================
    const handleEdit =
        (line) => {

            setModalType("line");

            setEditingLine(line);

            setForm({

                model:
                    line.model || "",

                name:
                    line.name || "",

            });

            setOpenModal(true);

        };

    // =========================================
    // SAVE
    // =========================================
    const handleSave =
        async () => {

            if (
                !form.model ||
                (
                    modalType === "line" &&
                    !form.name
                )
            ) {

                alert(
                    "Please complete all fields"
                );

                return;

            }

            try {

                // =====================================
                // UPDATE
                // =====================================
                if (editingLine) {

                    const { error } =
                        await supabase
                            .from("lines")
                            .update({

                                model:
                                    form.model,

                                name:
                                    form.name,

                            })
                            .eq(
                                "id",
                                editingLine.id
                            );

                    if (error) {

                        console.log(error);

                        alert(
                            "Update failed"
                        );

                        return;

                    }

                    alert(
                        "Line updated"
                    );

                }

                // =====================================
                // ADD
                // =====================================
                else {

                    const { error } =
                        await supabase
                            .from("lines")
                            .insert([{

                                model:
                                    form.model,

                                name:
                                    modalType === "model"
                                        ? "Default Line"
                                        : form.name,

                            }]);

                    if (error) {

                        console.log(error);

                        alert(
                            "Add failed"
                        );

                        return;

                    }

                    alert(
                        modalType === "model"
                            ? "Model added"
                            : "Line added"
                    );

                }

                setOpenModal(false);

                loadLines();

            } catch (error) {

                console.log(error);

            }

        };

    // =========================================
    // DELETE
    // =========================================
    const handleDelete =
        async (line) => {

            const confirmDelete =
                window.confirm(
                    `Delete ${line.name}?`
                );

            if (!confirmDelete)
                return;

            const { error } =
                await supabase
                    .from("lines")
                    .delete()
                    .eq("id", line.id);

            if (error) {

                console.log(error);

                alert(
                    "Delete failed"
                );

                return;

            }

            alert(
                "Line deleted"
            );

            loadLines();

        };

    return (

        <div className="w-full">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-8">

                <div>

                    <h1 className="text-5xl font-black text-white tracking-tight">

                        Line Management

                    </h1>

                    <p className="text-slate-500 mt-2">

                        Production line configuration management

                    </p>

                </div>

                {/* BUTTON */}
                <button
                    onClick={handleAdd}
                    className="h-14 px-7 rounded-2xl
          bg-gradient-to-r from-green-500 to-emerald-600
          shadow-[0_0_40px_rgba(34,197,94,.25)]
          hover:scale-[1.02]
          transition-all
          flex items-center gap-3
          text-sm font-bold text-white"
                >

                    <Plus size={18} />

                    Add Model

                </button>

            </div>

            {/* SEARCH */}
            <div className="rounded-[32px]
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
                        placeholder="Search model or line..."
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

            </div>

            {/* GRID */}
            <div className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5">

                {filteredModels.map(
                    (model) => (

                        <div
                            key={model}
                            className="relative
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
                            <div className="absolute top-[-60px] right-[-60px]
              w-[180px] h-[180px]
              bg-green-500/10
              blur-[80px]
              rounded-full"></div>

                            {/* CONTENT */}
                            <div className="relative z-10 p-7">

                                {/* ICON */}
                                <div className="w-20 h-20 rounded-[28px]
                bg-gradient-to-br
                from-green-400
                to-emerald-600
                flex items-center justify-center
                shadow-[0_0_40px_rgba(34,197,94,.35)]">

                                    <Factory
                                        size={34}
                                        className="text-white"
                                    />

                                </div>

                                {/* MODEL */}
                                <h1 className="mt-7 text-3xl font-black text-white">

                                    {model}

                                </h1>

                                <p className="mt-2 text-slate-500">

                                    Production Model

                                </p>

                                {/* ADD LINE */}
                                <button
                                    onClick={() =>
                                        handleAddLine(
                                            model
                                        )
                                    }
                                    className="mt-5 h-11 px-5 rounded-2xl
                  bg-green-500/10
                  border border-green-500/20
                  hover:bg-green-500/20
                  transition-all
                  flex items-center gap-2
                  text-sm font-semibold text-green-400"
                                >

                                    <Plus size={16} />

                                    Add Line

                                </button>

                                {/* LINE LIST */}
                                <div className="mt-7 space-y-3">

                                    {groupedData[
                                        model
                                    ].map((line) => (

                                        <div
                                            key={line.id}
                                            className="rounded-2xl
                      border border-white/5
                      bg-black/20
                      p-4"
                                        >

                                            <div className="flex items-center justify-between">

                                                {/* LEFT */}
                                                <div className="flex items-center gap-3">

                                                    <div className="w-11 h-11 rounded-xl
                          bg-green-500/10
                          flex items-center justify-center">

                                                        <GitBranch
                                                            size={18}
                                                            className="text-green-400"
                                                        />

                                                    </div>

                                                    <div>

                                                        <h1 className="text-white font-semibold">

                                                            {line.name}

                                                        </h1>

                                                        <p className="text-slate-500 text-sm">

                                                            Production Line

                                                        </p>

                                                    </div>

                                                </div>

                                                {/* ACTION */}
                                                <div className="flex items-center gap-2">

                                                    {/* EDIT */}
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                line
                                                            )
                                                        }
                                                        className="w-10 h-10 rounded-xl
                            bg-yellow-500/10
                            border border-yellow-500/20
                            flex items-center justify-center
                            hover:bg-yellow-500/20"
                                                    >

                                                        <Pencil
                                                            size={15}
                                                            className="text-yellow-400"
                                                        />

                                                    </button>

                                                    {/* DELETE */}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                line
                                                            )
                                                        }
                                                        className="w-10 h-10 rounded-xl
                            bg-red-500/10
                            border border-red-500/20
                            flex items-center justify-center
                            hover:bg-red-500/20"
                                                    >

                                                        <Trash2
                                                            size={15}
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

                                    {editingLine
                                        ? "Edit Line"
                                        : modalType === "model"
                                            ? "Add Model"
                                            : "Add Line"}

                                </h1>

                                <p className="text-slate-500 mt-2">

                                    Production line configuration

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

                            {/* MODEL */}
                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Model

                                </label>

                                <input
                                    type="text"
                                    value={form.model}
                                    onChange={(e) =>
                                        setForm({

                                            ...form,
                                            model:
                                                e.target.value,

                                        })
                                    }
                                    disabled={
                                        modalType === "line"
                                    }
                                    placeholder="Create the line model"
                                    className="w-full h-14 rounded-2xl
                  bg-black/20
                  border border-white/5
                  px-5
                  text-white
                  outline-none
                  focus:border-green-500/20
                  disabled:opacity-60"
                                />

                            </div>

                            {/* LINE */}
                            {modalType === "line" && (

                                <div>

                                    <label className="block text-sm text-slate-400 mb-2">

                                        Line Name

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
                                        placeholder="Create the line number"
                                        className="w-full h-14 rounded-2xl
                    bg-black/20
                    border border-white/5
                    px-5
                    text-white
                    outline-none
                    focus:border-green-500/20"
                                    />

                                </div>

                            )}

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
                                    handleSave
                                }
                                className="h-12 px-6 rounded-2xl
                bg-gradient-to-r from-green-500 to-emerald-600
                flex items-center gap-3
                font-bold shadow-[0_0_30px_rgba(34,197,94,.3)]"
                            >

                                <Save size={18} />

                                {modalType === "model"
                                    ? "Save Model"
                                    : "Save Line"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
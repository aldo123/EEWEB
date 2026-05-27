// SparePartManagement.jsx
// FULL VERSION - WIK BT TPM SYSTEM
// React + Supabase + XLSX + Recharts
// Futuristic UI Edition

import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    Plus,
    Package,
    ArrowDownCircle,
    ArrowUpCircle,
    AlertTriangle,
    Trash2,
    Pencil,
    Download,
    Upload,
    Warehouse,
    Boxes,
    Activity,
    TrendingUp,
    ShieldAlert,
    X,
    PackageSearch
} from "lucide-react";

import * as XLSX from "xlsx";

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    Tooltip
} from "recharts";

import { supabase }
    from "../../supabase/supabase";

const COLORS = [
    "#00E5FF",
    "#00FF99",
    "#FFD600",
    "#FF4D6D"
];

export default function SparePartManagement() {

    // ======================================================
    // USER
    // ======================================================

    const currentUser =
        JSON.parse(
            localStorage.getItem("user")
        );

    const isManager =
        currentUser?.role === "Manager";

    const isAdmin =
        currentUser?.role === "Admin";

    const canManage =
        isManager || isAdmin;

    // ======================================================
    // STATES
    // ======================================================

    const [
        parts,
        setParts
    ] = useState([]);

    const [
        transactions,
        setTransactions
    ] = useState([]);

    const [
        lines,
        setLines
    ] = useState([]);

    const [
        search,
        setSearch
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        showPartModal,
        setShowPartModal
    ] = useState(false);

    const [
        showTransactionModal,
        setShowTransactionModal
    ] = useState(false);

    const [
        selectedPart,
        setSelectedPart
    ] = useState(null);

    const [
        transactionType,
        setTransactionType
    ] = useState("IN");

    const [
        form,
        setForm
    ] = useState({
        part_no: "",
        part_name: "",
        category: "",
        machine: "",
        model: "",
        rack: "",
        min_stock: 0,
        current_stock: 0,
        unit: "",
        vendor: ""
    });

    const [
        trxForm,
        setTrxForm
    ] = useState({
        qty: 0,
        remark: ""
    });

    // ======================================================
    // LOAD DATA
    // ======================================================

    useEffect(() => {

        loadParts();
        loadTransactions();
        loadLines();

        const channel =
            supabase
                .channel("sparepart-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "spare_parts"
                    },
                    () => {
                        loadParts();
                    }
                )
                .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    // ======================================================
    // LOAD PARTS
    // ======================================================

    const loadParts =
        async () => {

            setLoading(true);

            const {
                data,
                error
            } = await supabase
                .from("spare_parts")
                .select("*")
                .order(
                    "part_no",
                    {
                        ascending: true
                    }
                );

            if (!error) {
                setParts(data || []);
            }

            setLoading(false);

        };

    // ======================================================
    // LOAD TRANSACTIONS
    // ======================================================

    const loadTransactions =
        async () => {

            const {
                data,
                error
            } = await supabase
                .from("spare_transactions")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(20);

            if (!error) {
                setTransactions(data || []);
            }

        };

    // ======================================================
    // LOAD LINES
    // ======================================================

    const loadLines =
        async () => {

            const {
                data,
                error
            } = await supabase
                .from("lines")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );

            if (!error) {

                setLines(
                    data || []
                );

            }

        };

    // ======================================================
    // ADD PART
    // ======================================================

    const handleSavePart =
        async () => {

            if (!canManage) {
                alert(
                    "Only Manager/Admin can manage spare parts"
                );
                return;
            }

            if (
                !form.part_name ||
                !form.part_no
            ) {
                alert("Complete data");
                return;
            }

            const payload = {
                ...form,
                current_stock:
                    Number(form.current_stock),
                min_stock:
                    Number(form.min_stock)
            };

            if (selectedPart) {

                await supabase
                    .from("spare_parts")
                    .update(payload)
                    .eq(
                        "id",
                        selectedPart.id
                    );

            } else {

                await supabase
                    .from("spare_parts")
                    .insert([payload]);

            }

            setShowPartModal(false);

            resetForm();

            loadParts();

        };

    // ======================================================
    // DELETE PART
    // ======================================================

    const handleDeletePart =
        async (id) => {

            if (!canManage) {
                alert(
                    "Only Manager/Admin can delete"
                );
                return;
            }

            const ok =
                window.confirm(
                    "Delete part?"
                );

            if (!ok) return;

            await supabase
                .from("spare_parts")
                .delete()
                .eq("id", id);

            loadParts();

        };

    // ======================================================
    // TRANSACTION
    // ======================================================

    const handleTransaction =
        async () => {

            if (!selectedPart) return;

            const qty =
                Number(trxForm.qty);

            if (qty <= 0) {
                alert("Qty invalid");
                return;
            }

            let newStock =
                selectedPart.current_stock;

            if (
                transactionType === "IN"
            ) {
                newStock += qty;
            } else {
                newStock -= qty;
            }

            if (newStock < 0) {
                alert("Stock insufficient");
                return;
            }

            await supabase
                .from("spare_transactions")
                .insert([
                    {
                        part_id:
                            selectedPart.id,
                        part_name:
                            selectedPart.part_name,
                        type:
                            transactionType,
                        qty,
                        stock_before:
                            selectedPart.current_stock,
                        stock_after:
                            newStock,
                        responsible:
                            currentUser?.username,
                        remark:
                            trxForm.remark
                    }
                ]);

            await supabase
                .from("spare_parts")
                .update({
                    current_stock:
                        newStock
                })
                .eq(
                    "id",
                    selectedPart.id
                );

            setShowTransactionModal(false);

            loadParts();
            loadTransactions();

        };

    // ======================================================
    // EXPORT EXCEL
    // ======================================================

    const exportExcel = () => {

        const exportData =
            parts.map((item) => ({

                Part_no:
                    item.part_no || "",

                Part_name:
                    item.part_name || "",

                Machine:
                    item.machine || "",

                Model:
                    item.model || "",

                Category:
                    item.category || "",

                Rack:
                    item.rack || "",

                Min_stock:
                    item.min_stock || 0,

                Current_stock:
                    item.current_stock || 0,

                Vendor:
                    item.vendor || "",

                Status:
                    item.current_stock <= item.min_stock
                        ? "Critical"
                        : item.current_stock <= item.min_stock + 3
                            ? "Low"
                            : "OK"

            }));

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Spare Parts"
        );

        XLSX.writeFile(
            workbook,
            "SparePart.xlsx"
        );

    };

    // ======================================================
    // IMPORT EXCEL
    // ======================================================

    const handleImportExcel =
        (e) => {

            const file =
                e.target.files[0];

            if (!file) return;

            const reader =
                new FileReader();

            reader.onload =
                async (evt) => {

                    try {

                        const data =
                            new Uint8Array(
                                evt.target.result
                            );

                        const workbook =
                            XLSX.read(
                                data,
                                {
                                    type: "array"
                                }
                            );

                        const sheet =
                            workbook.Sheets[
                            workbook.SheetNames[0]
                            ];

                        const json =
                            XLSX.utils.sheet_to_json(
                                sheet
                            );

                        if (
                            json.length === 0
                        ) {

                            alert(
                                "No data found"
                            );

                            return;

                        }

                        const uniqueMap = {};

                        json.forEach((row) => {

                            const cleanPartNo =
                                String(
                                    row.Part_no || ""
                                ).trim();

                            if (!cleanPartNo) return;

                            uniqueMap[cleanPartNo] = {

                                part_no:
                                    cleanPartNo,

                                part_name:
                                    row.Part_name || "",

                                machine:
                                    row.Machine || "",

                                model:
                                    row.Model || "",

                                category:
                                    row.Category || "",

                                rack:
                                    row.Rack || "",

                                vendor:
                                    row.Vendor || "",

                                min_stock:
                                    Number(
                                        row.Min_stock || 0
                                    ),

                                current_stock:
                                    Number(
                                        row.Current_stock || 0
                                    ),

                                unit:
                                    row.Unit || "PCS"

                            };

                        });

                        const formattedData =
                            Object.values(uniqueMap);
                        // ====================================
                        // UPSERT = SYNC DATABASE
                        // ====================================

                        const {
                            error
                        } = await supabase
                            .from("spare_parts")
                            .upsert(
                                formattedData,
                                {
                                    onConflict:
                                        "part_no"
                                }
                            );

                        if (error) {

                            console.log(error);

                            alert(
                                "Import failed"
                            );

                            return;

                        }

                        alert(
                            "Database synced successfully"
                        );

                        loadParts();

                    } catch (err) {

                        console.log(err);

                        alert(
                            "Excel read failed"
                        );

                    }

                };

            reader.readAsArrayBuffer(
                file
            );

            // RESET INPUT
            e.target.value = null;

        };

    // ======================================================
    // RESET
    // ======================================================

    const resetForm =
        () => {

            setSelectedPart(null);

            setForm({
                part_no: "",
                part_name: "",
                category: "",
                machine: "",
                model: "",
                rack: "",
                min_stock: 0,
                current_stock: 0,
                unit: "",
                vendor: ""
            });

        };

    // ======================================================
    // FILTER
    // ======================================================

    const filteredParts =
        useMemo(() => {

            return parts.filter(
                (item) => {

                    return (
                        item.part_name
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        item.part_no
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        item.machine
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                    );

                }
            );

        }, [
            parts,
            search
        ]);

    // ======================================================
    // KPI
    // ======================================================

    const totalParts =
        parts.length;

    const lowStock =
        parts.filter(
            (x) =>
                x.current_stock <=
                x.min_stock
        ).length;

    const totalStock =
        parts.reduce(
            (a, b) =>
                a +
                Number(
                    b.current_stock || 0
                ),
            0
        );

    const totalRack =
        new Set(
            parts.map(
                (x) => x.rack
            )
        ).size;

    // ======================================================
    // CHART DATA
    // ======================================================

    const stockChart = [
        {
            name: "Safe",
            value:
                parts.filter(
                    (x) =>
                        x.current_stock >
                        x.min_stock
                ).length
        },
        {
            name: "Low",
            value: lowStock
        }
    ];

    // ======================================================
    // UI
    // ======================================================

    return (
        <div className="min-h-screen bg-[#020817] text-white px-6 pb-6 pt-2">

            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}

            <div className="
                flex
                justify-between
                items-end
                mb-3
                rounded-[32px]
                border
                border-cyan-500/10
                bg-gradient-to-r
                from-cyan-500/5
                to-transparent
                backdrop-blur-xl
                px-6 py-5
                shadow-2xl
                shadow-cyan-500/5
            ">

                {/* LEFT */}

                <div>

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-2xl
                        border
                        border-cyan-500/20
                        bg-cyan-500/10
                        text-cyan-300
                        text-xs
                        font-bold
                        uppercase
                        tracking-[3px]
                        mb-4
                    ">

                        <div className="
                            w-2
                            h-2
                            rounded-full
                            bg-cyan-400
                            animate-pulse
                        " />

                        SPARE PART MONITORING

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
                        Spare Part Management
                    </h1>

                    <p className="
                        text-slate-400
                        mt-3
                        text-lg
                    ">
                        Inventory monitoring & warehouse management system
                    </p>

                </div>

                {/* RIGHT ACTION */}

                <div className="
                    flex
                    items-center
                    gap-3
                    self-end
                    mb-2
                ">

                    <button
                        onClick={() => {

                            if (!canManage) {
                                alert("Only Manager/Admin");
                                return;
                            }

                            resetForm();
                            setShowPartModal(true);

                        }}
                        className="
                            h-12
                            px-6
                            rounded-2xl
                            bg-cyan-500
                            hover:bg-cyan-400
                            font-bold
                            flex
                            items-center
                            gap-2
                            shadow-lg
                            shadow-cyan-500/20
                        "
                    >
                        <Plus size={18} />
                        Add Part
                    </button>

                    <label className="
                        h-12
                        px-6
                        rounded-2xl
                        bg-[#071226]
                        border
                        border-cyan-500/10
                        hover:border-cyan-400/30
                        font-bold
                        flex
                        items-center
                        gap-2
                        cursor-pointer
                    ">

                        <Upload size={18} />
                        Import Excel

                        <input
                            type="file"
                            hidden
                            onChange={handleImportExcel}
                        />

                    </label>

                    <button
                        onClick={exportExcel}
                        className="
                            h-12
                            px-6
                            rounded-2xl
                            bg-[#071226]
                            border
                            border-cyan-500/10
                            hover:border-cyan-400/30
                            font-bold
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <Download size={18} />
                        Export Excel
                    </button>

                    <button
                        className="
                            h-12
                            px-6
                            rounded-2xl
                            bg-purple-500/10
                            border
                            border-purple-500/20
                            text-purple-300
                            hover:bg-purple-500/20
                            font-bold
                            flex
                            items-center
                            gap-2
                        "
                    >
                        <Activity size={18} />
                        Transaction
                    </button>

                </div>

            </div>

            {/* ====================================================== */}
            {/* KPI */}
            {/* ====================================================== */}


            <div className="
                grid
                grid-cols-5
                gap-5
                mt-3
            ">

                <KPI
                    title="Total Part"
                    value={totalParts}
                    icon={<Package />}
                    color="cyan"
                    subtitle="All spare part"
                />

                <KPI
                    title="Low Stock"
                    value={lowStock}
                    icon={<AlertTriangle />}
                    color="yellow"
                    subtitle="Need attention"
                />

                <KPI
                    title="Incoming"
                    value={
                        transactions
                            .filter(x => x.type === "IN")
                            .length
                    }
                    icon={<ArrowDownCircle />}
                    color="green"
                    subtitle="+12.5%"
                />

                <KPI
                    title="Outgoing"
                    value={
                        transactions
                            .filter(x => x.type === "OUT")
                            .length
                    }
                    icon={<ArrowUpCircle />}
                    color="purple"
                    subtitle="+18.7%"
                />

                <KPI
                    title="Critical"
                    value={
                        parts.filter(
                            x => x.current_stock <= 0
                        ).length
                    }
                    icon={<ShieldAlert />}
                    color="red"
                    subtitle="Very low stock"
                />

            </div>



            {/* ====================================================== */}
            {/* ANALYTICS DASHBOARD */}
            {/* ====================================================== */}

            <div className="
                grid
                grid-cols-12
                gap-5
                mt-4
                mb-4
            ">

                {/* ================================================= */}
                {/* STOCK HEALTH */}
                {/* ================================================= */}

                <div className="
                    col-span-4
                    bg-[#071226]
                    rounded-3xl
                    border
                    border-cyan-500/10
                    p-5
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-5
                    ">

                        <h2 className="
                            font-bold
                            text-lg
                        ">
                            Stock Health
                        </h2>

                        <select className="
                            h-9
                            px-3
                            rounded-xl
                            bg-[#08192e]
                            border
                            border-cyan-500/10
                            text-xs
                            outline-none
                        ">
                            <option>
                                All Category
                            </option>
                        </select>

                    </div>

                    <div className="
                        flex
                        items-center
                        justify-between
                    ">

                        {/* DONUT */}

                        <div className="
                            w-[180px]
                            h-[180px]
                        ">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={stockChart}
                                        dataKey="value"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={2}
                                    >

                                        {
                                            stockChart.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (

                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            index === 0
                                                                ? "#00E5FF"
                                                                : "#FFD600"
                                                        }
                                                    />

                                                )
                                            )
                                        }

                                    </Pie>

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                        {/* LEGEND */}

                        <div className="space-y-4 flex-1">

                            <LegendItem
                                color="bg-cyan-400"
                                label="Healthy"
                                value={
                                    parts.filter(
                                        x =>
                                            x.current_stock >
                                            x.min_stock
                                    ).length
                                }
                            />

                            <LegendItem
                                color="bg-yellow-400"
                                label="Low Stock"
                                value={lowStock}
                            />

                            <LegendItem
                                color="bg-red-400"
                                label="Critical"
                                value={
                                    parts.filter(
                                        x =>
                                            x.current_stock <= 0
                                    ).length
                                }
                            />

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* TRANSACTION OVERVIEW */}
                {/* ================================================= */}

                <div className="
                    col-span-4
                    bg-[#071226]
                    rounded-3xl
                    border
                    border-cyan-500/10
                    p-5
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-5
                    ">

                        <h2 className="
                            font-bold
                            text-lg
                        ">
                            Transaction Overview
                        </h2>

                        <div className="
                            text-sm
                            text-slate-400
                        ">
                            This Year
                        </div>

                    </div>

                    <ResponsiveContainer
                        width="100%"
                        height={230}
                    >

                        <BarChart
                            data={[
                                {
                                    month: "Jan",
                                    incoming: 120,
                                    outgoing: 80
                                },
                                {
                                    month: "Feb",
                                    incoming: 180,
                                    outgoing: 120
                                },
                                {
                                    month: "Mar",
                                    incoming: 160,
                                    outgoing: 100
                                },
                                {
                                    month: "Apr",
                                    incoming: 220,
                                    outgoing: 140
                                },
                                {
                                    month: "May",
                                    incoming: 140,
                                    outgoing: 110
                                },
                                {
                                    month: "Jun",
                                    incoming: 190,
                                    outgoing: 130
                                }
                            ]}
                        >

                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                            />

                            <Tooltip />

                            <Bar
                                dataKey="incoming"
                                fill="#00E5FF"
                                radius={[6, 6, 0, 0]}
                            />

                            <Bar
                                dataKey="outgoing"
                                fill="#A855F7"
                                radius={[6, 6, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                {/* ================================================= */}
                {/* TOP USED PART */}
                {/* ================================================= */}

                <div className="
                    col-span-4
                    bg-[#071226]
                    rounded-3xl
                    border
                    border-cyan-500/10
                    p-5
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-5
                    ">

                        <h2 className="
                            font-bold
                            text-lg
                        ">
                            Top 5 Most Used Part
                        </h2>

                        <select className="
                            h-9
                            px-3
                            rounded-xl
                            bg-[#08192e]
                            border
                            border-cyan-500/10
                            text-xs
                            outline-none
                        ">
                            <option>
                                This Month
                            </option>
                        </select>

                    </div>

                    <div className="space-y-5">

                        {
                            filteredParts
                                .slice(0, 5)
                                .map((item, index) => (

                                    <div key={index}>

                                        <div className="
                                            flex
                                            justify-between
                                            mb-2
                                            text-sm
                                        ">

                                            <div>
                                                {item.part_name}
                                            </div>

                                            <div className="
                                                text-cyan-400
                                                font-bold
                                            ">
                                                {item.current_stock}
                                            </div>

                                        </div>

                                        <div className="
                                            w-full
                                            h-2
                                            rounded-full
                                            bg-[#08192e]
                                            overflow-hidden
                                        ">

                                            <div
                                                className="
                                                    h-full
                                                    rounded-full
                                                    bg-cyan-400
                                                "
                                                style={{
                                                    width: `${Math.min(
                                                        item.current_stock,
                                                        100
                                                    )}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                ))
                        }

                    </div>

                </div>

            </div>



            {/* ====================================================== */
            /* MAIN DASHBOARD AREA */
            /* ====================================================== */}

            <div className="
                grid
                grid-cols-12
                gap-5
                mt-2
            ">

                {/* ================================================= */}
                {/* LEFT CONTENT */}
                {/* ================================================= */}

                <div className="col-span-9 space-y-5">

                    {/* ================================================= */}
                    {/* FILTER BAR */}
                    {/* ================================================= */}

                    <div className="
                        bg-[#071226]
                        rounded-3xl
                        border
                        border-cyan-500/10
                        px-4 py-3
                    ">

                        <div className="flex gap-3">

                            <div className="flex-1 relative">

                                <Search
                                    className="
                                        absolute
                                        left-4
                                        top-3
                                        text-slate-500
                                    "
                                    size={18}
                                />

                                <input
                                    type="text"
                                    placeholder="Search part..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        h-12
                                        pl-12
                                        rounded-2xl
                                        bg-[#08192e]
                                        border
                                        border-cyan-500/10
                                        outline-none
                                    "
                                />

                            </div>

                            <select className="
                                h-12
                                px-4
                                rounded-2xl
                                bg-[#08192e]
                                border
                                border-cyan-500/10
                                outline-none
                            ">
                                <option>
                                    All Category
                                </option>
                            </select>

                            <select className="
                                h-12
                                px-4
                                rounded-2xl
                                bg-[#08192e]
                                border
                                border-cyan-500/10
                                outline-none
                            ">
                                <option>
                                    All Machine
                                </option>
                            </select>

                            <select className="
                                h-12
                                px-4
                                rounded-2xl
                                bg-[#08192e]
                                border
                                border-cyan-500/10
                                outline-none
                            ">
                                <option>
                                    All Status
                                </option>
                            </select>

                        </div>

                    </div>

                    {/* ================================================= */}
                    {/* PART TABLE */}
                    {/* ================================================= */}

                    <div className="
                        bg-[#071226]
                        rounded-3xl
                        border
                        border-cyan-500/10
                        overflow-hidden
                    ">

                        {/* TABLE HEADER */}

                        <div className="
                            px-5
                            py-4
                            border-b
                            border-cyan-500/10
                            flex
                            justify-between
                            items-center
                        ">

                            <div className="font-bold text-lg">
                                Part List
                            </div>

                            <div className="
                                text-sm
                                text-slate-400
                            ">
                                Showing {filteredParts.length} items
                            </div>

                        </div>

                        {/* TABLE */}

                        <div className="overflow-auto">

                            <table className="w-full min-w-[1400px]">

                                <thead className="
                                    bg-[#0d1d35]
                                    text-cyan-400
                                    text-sm
                                    text-left
                                ">

                                    <tr>

                                        <th className="p-4">
                                            No
                                        </th>

                                        <th>
                                            Part Number
                                        </th>

                                        <th>
                                            Part Name
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Machine
                                        </th>

                                        <th>
                                            Model
                                        </th>

                                        <th>
                                            Min Stock
                                        </th>

                                        <th>
                                            Current Stock
                                        </th>

                                        <th>
                                            Unit
                                        </th>

                                        <th>
                                            Rack
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        filteredParts.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <tr
                                                    key={index}
                                                    className="
                                                        border-t
                                                        border-cyan-500/10
                                                        hover:bg-cyan-500/5
                                                    "
                                                >

                                                    <td className="p-4">
                                                        {index + 1}
                                                    </td>

                                                    <td className="font-bold">
                                                        {item.part_no}
                                                    </td>

                                                    <td>
                                                        {item.part_name}
                                                    </td>

                                                    <td>
                                                        {item.category}
                                                    </td>

                                                    <td>
                                                        {item.machine}
                                                    </td>

                                                    <td>
                                                        {item.model || "-"}
                                                    </td>

                                                    <td>
                                                        {item.min_stock}
                                                    </td>

                                                    <td className="
                                                        font-bold
                                                        text-cyan-300
                                                    ">
                                                        {item.current_stock}
                                                    </td>

                                                    <td>
                                                        {item.unit}
                                                    </td>

                                                    <td>
                                                        {item.rack}
                                                    </td>

                                                    <td>

                                                        {
                                                            item.current_stock <= 0
                                                                ? (
                                                                    <span className="
                                                                        px-3
                                                                        py-1
                                                                        rounded-full
                                                                        bg-red-500/20
                                                                        text-red-400
                                                                        text-xs
                                                                        font-bold
                                                                    ">
                                                                        OUT STOCK
                                                                    </span>
                                                                )
                                                                : item.current_stock <= item.min_stock
                                                                    ? (
                                                                        <span className="
                                                                            px-3
                                                                            py-1
                                                                            rounded-full
                                                                            bg-yellow-500/20
                                                                            text-yellow-400
                                                                            text-xs
                                                                            font-bold
                                                                        ">
                                                                            LOW STOCK
                                                                        </span>
                                                                    )
                                                                    : (
                                                                        <span className="
                                                                            px-3
                                                                            py-1
                                                                            rounded-full
                                                                            bg-green-500/20
                                                                            text-green-400
                                                                            text-xs
                                                                            font-bold
                                                                        ">
                                                                            HEALTHY
                                                                        </span>
                                                                    )
                                                        }

                                                    </td>

                                                    <td>

                                                        <div className="flex gap-2">

                                                            {/* EDIT */}

                                                            <button
                                                                onClick={() => {

                                                                    setSelectedPart(item);

                                                                    setForm({
                                                                        ...item
                                                                    });

                                                                    setShowPartModal(true);

                                                                }}
                                                                className="
                                                                    w-9
                                                                    h-9
                                                                    rounded-xl
                                                                    bg-yellow-500/10
                                                                    border
                                                                    border-yellow-500/20
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                "
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            {/* DELETE */}

                                                            <button
                                                                onClick={() =>
                                                                    handleDeletePart(item.id)
                                                                }
                                                                className="
                                                                    w-9
                                                                    h-9
                                                                    rounded-xl
                                                                    bg-red-500/10
                                                                    border
                                                                    border-red-500/20
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                "
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* RIGHT SIDEBAR */}
                {/* ================================================= */}

                <div className="col-span-3 space-y-4">

                    {/* STORAGE OVERVIEW */}

                    <div className="
                        bg-[#071226]
                        rounded-3xl
                        border
                        border-cyan-500/10
                        p-5
                    ">

                        <div className="
                            flex
                            justify-between
                            items-center
                            mb-5
                        ">

                            <h2 className="font-bold text-lg">
                                Storage Overview
                            </h2>

                            <div className="
                                text-cyan-400
                                text-sm
                            ">
                                View All
                            </div>

                        </div>

                        <div className="
                            grid
                            grid-cols-2
                            gap-3
                        ">

                            {
                                [...new Set(parts.map(x => x.rack))]
                                    .slice(0, 6)
                                    .map((rack, index) => {

                                        const rackParts =
                                            parts.filter(
                                                x => x.rack === rack
                                            );

                                        const total =
                                            rackParts.reduce(
                                                (a, b) =>
                                                    a + Number(
                                                        b.current_stock || 0
                                                    ),
                                                0
                                            );

                                        return (

                                            <div
                                                key={index}
                                                className="
                                                bg-[#08192e]
                                                rounded-2xl
                                                p-4
                                                border
                                                border-cyan-500/10
                                            "
                                            >

                                                <div className="
                                                    flex
                                                    justify-between
                                                    mb-2
                                                ">

                                                    <div className="font-bold">
                                                        {rack}
                                                    </div>

                                                    <div className="
                                                        text-cyan-400
                                                        text-sm
                                                    ">
                                                        {total} pcs
                                                    </div>

                                                </div>

                                                <div className="
                                                    w-full
                                                    h-3
                                                    rounded-full
                                                    bg-black/30
                                                    overflow-hidden
                                                ">

                                                    <div
                                                        className="
                                                            h-full
                                                            bg-cyan-400
                                                        "
                                                        style={{
                                                            width: `${Math.min(total, 100)}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    })
                            }

                        </div>

                    </div>

                    {/* RECENT TRANSACTION */}

                    <div className="
                        bg-[#071226]
                        rounded-3xl
                        border
                        border-cyan-500/10
                        p-5
                        min-h-[320px]
                    ">

                        <div className="
                            flex
                            justify-between
                            items-center
                            mb-5
                        ">

                            <h2 className="font-bold text-lg">
                                Recent Transaction
                            </h2>

                            <Activity
                                className="text-cyan-400"
                                size={18}
                            />

                        </div>

                        <div className="space-y-3">

                            {
                                transactions
                                    .slice(0, 8)
                                    .map((trx, i) => (

                                        <div
                                            key={i}
                                            className="
                                                bg-[#08192e]
                                                rounded-2xl
                                                p-3
                                                border
                                                border-cyan-500/10
                                            "
                                        >

                                            <div className="
                                                flex
                                                justify-between
                                                items-start
                                            ">

                                                <div>

                                                    <div className="
                                                        font-bold
                                                        text-sm
                                                    ">
                                                        {trx.part_name}
                                                    </div>

                                                    <div className="
                                                        text-xs
                                                        text-slate-400
                                                    ">
                                                        {trx.remark}
                                                    </div>

                                                </div>

                                                <div
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${trx.type === "IN"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-red-500/20 text-red-400"
                                                        }`}
                                                >
                                                    {trx.type}
                                                </div>

                                            </div>

                                        </div>

                                    ))
                            }

                        </div>

                    </div>

                </div>

            </div>

            {/* PART MODAL */}

            {
                showPartModal && (

                    <Modal
                        title={
                            selectedPart
                                ? "Edit Part"
                                : "Add Part"
                        }
                        onClose={() =>
                            setShowPartModal(
                                false
                            )
                        }
                    >

                        <div className="grid grid-cols-2 gap-4">

                            <Input
                                label="Part No"
                                value={
                                    form.part_no
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        part_no:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                label="Part Name"
                                value={
                                    form.part_name
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        part_name:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                label="Machine"
                                value={
                                    form.machine
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        machine:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <div>

                                <div className="mb-2 text-sm text-slate-400">
                                    Model
                                </div>

                                <select

                                    value={form.model || ""}

                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            model:
                                                e.target.value
                                        })
                                    }

                                    className="
                                        w-full
                                        h-12
                                        px-4
                                        bg-[#08192e]
                                        border
                                        border-cyan-500/10
                                        rounded-2xl
                                        outline-none
                                        text-white
                                    "
                                >

                                    <option value="">
                                        Select Model
                                    </option>

                                    {
                                        [...new Set(lines.map(x => x.model))]
                                            .map((model) => (

                                                <option
                                                    key={model}
                                                    value={model}
                                                >
                                                    {model}
                                                </option>

                                            ))
                                    }

                                </select>

                            </div>

                            <Input
                                label="Category"
                                value={
                                    form.category
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        category:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                label="Rack"
                                value={
                                    form.rack
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        rack:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                label="Unit"
                                value={
                                    form.unit
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        unit:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                type="number"
                                label="Current Stock"
                                value={
                                    form.current_stock
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        current_stock:
                                            e.target
                                                .value
                                    })
                                }
                            />

                            <Input
                                type="number"
                                label="Min Stock"
                                value={
                                    form.min_stock
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        min_stock:
                                            e.target
                                                .value
                                    })
                                }
                            />

                        </div>

                        <button
                            onClick={
                                handleSavePart
                            }
                            className="w-full h-12 rounded-2xl bg-cyan-500 font-bold mt-5"
                        >
                            Save Part
                        </button>

                    </Modal>

                )
            }

            {/* TRANSACTION */}

            {
                showTransactionModal && (

                    <Modal
                        title={`${transactionType} Transaction`}
                        onClose={() =>
                            setShowTransactionModal(
                                false
                            )
                        }
                    >

                        <Input
                            type="number"
                            label="Qty"
                            value={
                                trxForm.qty
                            }
                            onChange={(e) =>
                                setTrxForm({
                                    ...trxForm,
                                    qty:
                                        e.target
                                            .value
                                })
                            }
                        />

                        <Input
                            label="Remark"
                            value={
                                trxForm.remark
                            }
                            onChange={(e) =>
                                setTrxForm({
                                    ...trxForm,
                                    remark:
                                        e.target
                                            .value
                                })
                            }
                        />

                        <button
                            onClick={
                                handleTransaction
                            }
                            className="w-full h-12 rounded-2xl bg-cyan-500 font-bold mt-5"
                        >
                            Submit
                        </button>

                    </Modal>

                )
            }

        </div>
    );

}

// ======================================================
// KPI COMPONENT
// ======================================================

function KPI({
    title,
    value,
    icon,
    color,
    subtitle
}) {

    return (

        <div className="
        bg-[#071226]
        rounded-3xl
        border
        border-cyan-500/10
        p-5
        min-h-[120px]
        flex
        flex-col
        justify-between
    ">

            <div className="
            flex
            justify-between
            items-start
        ">

                <div>

                    <div className={`
                    text-sm
                    font-semibold
                    ${color === "cyan"
                            ? "text-cyan-400"
                            : color === "yellow"
                                ? "text-yellow-400"
                                : color === "green"
                                    ? "text-green-400"
                                    : color === "purple"
                                        ? "text-purple-400"
                                        : "text-red-400"
                        }
                `}>
                        {title}
                    </div>

                    <div className="
                    text-5xl
                    font-black
                    mt-2
                ">
                        {value}
                    </div>

                </div>

                <div className={`
                ${color === "cyan"
                        ? "text-cyan-400"
                        : color === "yellow"
                            ? "text-yellow-400"
                            : color === "green"
                                ? "text-green-400"
                                : color === "purple"
                                    ? "text-purple-400"
                                    : "text-red-400"
                    }
            `}>
                    {icon}
                </div>

            </div>

            <div className="
            text-sm
            text-slate-500
            mt-4
        ">
                {subtitle}
            </div>

        </div>

    );

}

function LegendItem({
    color,
    label,
    value
}) {

    return (

        <div className="
            flex
            items-center
            justify-between
            text-sm
        ">

            <div className="
                flex
                items-center
                gap-3
            ">

                <div className={`
                    w-3
                    h-3
                    rounded-full
                    ${color}
                `} />

                <div className="text-slate-300">
                    {label}
                </div>

            </div>

            <div className="
                font-bold
                text-white
            ">
                {value}
            </div>

        </div>

    );

}

// ======================================================
// MODAL
// ======================================================

function Modal({
    title,
    children,
    onClose
}) {

    return (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

            <div className="w-[700px] bg-[#071226] border border-cyan-500/20 rounded-3xl p-6">

                <div className="flex justify-between items-center mb-5">

                    <h2 className="text-2xl font-black">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>

                </div>

                {children}

            </div>

        </div>

    );

}

// ======================================================
// INPUT
// ======================================================

function Input({
    label,
    ...props
}) {

    return (

        <div>

            <div className="mb-2 text-sm text-slate-400">
                {label}
            </div>

            <input
                {...props}
                className="w-full h-12 px-4 bg-[#08192e] border border-cyan-500/10 rounded-2xl outline-none"
            />

        </div>

    );

}
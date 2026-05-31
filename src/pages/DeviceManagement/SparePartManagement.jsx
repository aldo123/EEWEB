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
        selectedTransactionDate,
        setSelectedTransactionDate
    ] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [
        transactions,
        setTransactions
    ] = useState([]);

    const [
        showEditTransactionModal,
        setShowEditTransactionModal
    ] = useState(false);

    const [
        editingTransaction,
        setEditingTransaction
    ] = useState(null);

    const [
        editTransactionForm,
        setEditTransactionForm
    ] = useState({
        qty: 0,
        po_no: "",
        machine: "",
        technician: ""
    });

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
        transactionSearch,
        setTransactionSearch
    ] = useState("");

    const [
        showPartDropdown,
        setShowPartDropdown
    ] = useState(false);

    const [
        userSearch,
        setUserSearch
    ] = useState("");

    const [
        showUserDropdown,
        setShowUserDropdown
    ] = useState(false);

    const [
        users,
        setUsers
    ] = useState([]);

    const [
        selectedUser,
        setSelectedUser
    ] = useState(null);

    const [
        lineSearch,
        setLineSearch
    ] = useState("");

    const [
        showLineDropdown,
        setShowLineDropdown
    ] = useState(false);

    const [
        selectedLine,
        setSelectedLine
    ] = useState(null);

    const [
        selectedModel,
        setSelectedModel
    ] = useState("ALL");

    const [
        selectedStatuses,
        setSelectedStatuses
    ] = useState([]);

    const [
        selectedRack,
        setSelectedRack
    ] = useState("ALL");

    const [
        selectedTopUsedMonth,
        setSelectedTopUsedMonth
    ] = useState(
        new Date().getMonth() + 1
    );

    const resetAllFilters = () => {

        setSearch("");

        setSelectedModel("ALL");

        setSelectedRack("ALL");

        setSelectedStatuses([]);

    };

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
        vendor: "",
        price: 0
    });

    const [
        trxForm,
        setTrxForm
    ] = useState({
        qty: 0,
        po_no: "",
        machine: "",
        line: ""
    });

    // ======================================================
    // LOAD DATA
    // ======================================================

    useEffect(() => {

        loadParts();
        loadTransactions();
        loadLines();
        loadUsers();

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

    const loadUsers =
        async () => {

            const {
                data,
                error
            } = await supabase
                .from("users")
                .select("*")
                .order(
                    "username",
                    {
                        ascending: true
                    }
                );

            if (!error) {
                setUsers(data || []);
            }

        };
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
                    Number(form.min_stock),

                price:
                    Number(form.price || 0)
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

    const handleDeleteTransaction =
        async (trx) => {

            if (!canManage) {

                alert(
                    "Only Manager/Admin can delete"
                );

                return;

            }

            const ok =
                window.confirm(
                    `Delete transaction ${trx.part_no}?`
                );

            if (!ok) return;

            try {

                await supabase
                    .from("spare_transactions")
                    .delete()
                    .eq(
                        "id",
                        trx.id
                    );

                await supabase
                    .from("spare_parts")
                    .update({
                        current_stock:
                            trx.stock_before
                    })
                    .eq(
                        "id",
                        trx.part_id
                    );

                loadParts();

                loadTransactions();

                alert(
                    "Transaction deleted"
                );

            } catch (err) {

                console.log(err);

                alert(
                    err.message
                );

            }

        };

    const handleEditTransaction =
        (trx) => {

            setEditingTransaction(trx);

            setEditTransactionForm({

                qty:
                    trx.qty || 0,

                po_no:
                    trx.po_no || "",

                machine:
                    trx.machine || "",

                technician:
                    trx.technician || ""

            });

            setShowEditTransactionModal(
                true
            );

        };

    const handleSaveEditTransaction =
        async () => {

            try {

                const qty =
                    Number(
                        editTransactionForm.qty
                    );

                if (qty <= 0) {

                    alert(
                        "Qty invalid"
                    );

                    return;

                }

                let stockAfter;

                if (
                    editingTransaction.type === "IN"
                ) {

                    stockAfter =
                        editingTransaction.stock_before
                        +
                        qty;

                } else {

                    stockAfter =
                        editingTransaction.stock_before
                        -
                        qty;

                }

                if (stockAfter < 0) {

                    alert(
                        "Stock insufficient"
                    );

                    return;

                }

                await supabase
                    .from("spare_transactions")
                    .update({

                        qty,

                        po_no:
                            editTransactionForm.po_no,

                        machine:
                            editTransactionForm.machine,

                        technician:
                            editTransactionForm.technician,

                        stock_after:
                            stockAfter

                    })
                    .eq(
                        "id",
                        editingTransaction.id
                    );

                await supabase
                    .from("spare_parts")
                    .update({
                        current_stock:
                            stockAfter
                    })
                    .eq(
                        "id",
                        editingTransaction.part_id
                    );

                setShowEditTransactionModal(
                    false
                );

                loadParts();

                loadTransactions();

                alert(
                    "Transaction updated"
                );

            } catch (err) {

                console.log(err);

                alert(
                    err.message
                );

            }

        };

    // ======================================================
    // TRANSACTION
    // ======================================================

    const handleTransaction =
        async () => {

            try {

                if (!selectedPart) {

                    alert("Please select part first");

                    return;

                }

                const qty =
                    Number(trxForm.qty);

                if (qty <= 0) {

                    alert("Qty invalid");

                    return;

                }

                if (
                    transactionType === "OUT"
                    &&
                    !selectedUser
                ) {

                    alert("Select technician");

                    return;

                }

                let newStock =
                    Number(
                        selectedPart.current_stock || 0
                    );

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

                // =========================================
                // INSERT TRANSACTION
                // =========================================

                const {
                    error: trxError
                } = await supabase
                    .from("spare_transactions")
                    .insert([
                        {
                            part_id:
                                selectedPart.id,

                            part_no:
                                selectedPart.part_no || "",

                            part_name:
                                selectedPart.part_name || "",

                            type:
                                transactionType,

                            qty,

                            po_no:
                                trxForm.po_no || "",

                            machine:
                                trxForm.machine || "",

                            line:
                                trxForm.line || "",

                            technician:
                                selectedUser?.username || "",

                            stock_before:
                                Number(
                                    selectedPart.current_stock || 0
                                ),

                            stock_after:
                                newStock,

                            responsible:
                                currentUser?.username || "SYSTEM"
                        }
                    ]);

                if (trxError) {

                    console.log(
                        "TRANSACTION ERROR:",
                        trxError
                    );

                    alert(
                        trxError.message
                    );

                    return;

                }

                // =========================================
                // UPDATE STOCK
                // =========================================

                const {
                    error: stockError
                } = await supabase
                    .from("spare_parts")
                    .update({
                        current_stock:
                            newStock
                    })
                    .eq(
                        "id",
                        selectedPart.id
                    );

                if (stockError) {

                    console.log(
                        "UPDATE STOCK ERROR:",
                        stockError
                    );

                    alert(
                        stockError.message
                    );

                    return;

                }

                // =========================================
                // SUCCESS
                // =========================================

                alert(
                    `${transactionType} transaction success`
                );

                setShowTransactionModal(false);

                setSelectedPart(null);

                setSelectedUser(null);

                setSelectedLine(null);

                setTrxForm({
                    qty: 0,
                    po_no: "",
                    machine: "",
                    line: ""
                });

                loadParts();

                loadTransactions();

            } catch (err) {

                console.log(err);

                alert(
                    err.message
                );

            }

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

                Price:
                    item.price || 0,

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

                                price:
                                    Number(row.Price || 0),

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
                vendor: "",
                price: 0
            });

        };

    // ======================================================
    // FILTER
    // ======================================================

    const tableFilteredParts =
        useMemo(() => {

            const keyword =
                search.toLowerCase();

            return parts.filter(
                (item) => {

                    // SEARCH
                    const matchSearch =

                        item.part_no
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.part_name
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.category
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.machine
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.model
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.vendor
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.rack
                            ?.toLowerCase()
                            .includes(keyword);

                    // MODEL FILTER
                    const matchModel =

                        selectedModel === "ALL"
                        ||
                        item.model === selectedModel;

                    // RACK FILTER
                    const matchRack =

                        selectedRack === "ALL"
                        ||
                        item.rack === selectedRack;

                    // STATUS
                    let itemStatus = "HEALTHY";

                    if (item.current_stock <= 0) {

                        itemStatus = "CRITICAL";

                    } else if (
                        item.current_stock <= item.min_stock
                    ) {

                        itemStatus = "LOW STOCK";

                    }

                    // MULTI STATUS FILTER
                    const matchStatus =

                        selectedStatuses.length === 0
                        ||
                        selectedStatuses.includes(itemStatus);

                    return (
                        matchSearch &&
                        matchModel &&
                        matchRack &&
                        matchStatus
                    );

                }
            );

        }, [
            parts,
            search,
            selectedModel,
            selectedStatuses,
            selectedRack
        ]);

    const topUsedParts = useMemo(() => {

        const filteredTransactions =
            transactions.filter((trx) => {

                if (trx.type !== "OUT")
                    return false;

                const trxDate =
                    new Date(trx.created_at);

                const trxMonth =
                    trxDate.getMonth() + 1;

                if (
                    trxMonth !==
                    selectedTopUsedMonth
                ) {
                    return false;
                }

                // FILTER MODEL
                if (
                    selectedModel !== "ALL"
                ) {

                    const part =
                        parts.find(
                            p =>
                                p.part_no ===
                                trx.part_no
                        );

                    if (
                        !part ||
                        part.model !==
                        selectedModel
                    ) {
                        return false;
                    }

                }

                return true;

            });

        const grouped = {};

        filteredTransactions.forEach((trx) => {

            const key =
                trx.part_no;

            if (!grouped[key]) {

                grouped[key] = {

                    part_no:
                        trx.part_no,

                    part_name:
                        trx.part_name,

                    total_qty: 0

                };

            }

            grouped[key].total_qty +=
                Number(trx.qty || 0);

        });

        return Object.values(grouped)
            .sort(
                (a, b) =>
                    b.total_qty -
                    a.total_qty
            )
            .slice(0, 5);

    }, [
        transactions,
        selectedTopUsedMonth,
        selectedModel,
        parts
    ]);

    const monthOptions = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const transactionOverviewData =
        useMemo(() => {

            const months = [
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
            ];

            return months.map(
                (monthName, monthIndex) => {

                    const monthTransactions =
                        transactions.filter((trx) => {

                            const trxDate =
                                new Date(trx.created_at);

                            const trxMonth =
                                trxDate.getMonth();

                            if (
                                trxMonth !== monthIndex
                            ) {
                                return false;
                            }

                            // FILTER MODEL
                            if (
                                selectedModel !== "ALL"
                            ) {

                                const part =
                                    parts.find(
                                        p =>
                                            p.part_no ===
                                            trx.part_no
                                    );

                                if (
                                    !part ||
                                    part.model !== selectedModel
                                ) {
                                    return false;
                                }

                            }

                            return true;

                        });

                    const incoming =
                        new Set(
                            monthTransactions
                                .filter(
                                    x => x.type === "IN"
                                )
                                .map(
                                    x => x.part_no
                                )
                        ).size;

                    const outgoing =
                        new Set(
                            monthTransactions
                                .filter(
                                    x => x.type === "OUT"
                                )
                                .map(
                                    x => x.part_no
                                )
                        ).size;

                    return {
                        month: monthName,
                        incoming,
                        outgoing
                    };

                }
            );

        }, [
            transactions,
            selectedModel,
            parts
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

    const analyticsParts =
        parts.filter((item) =>

            selectedModel === "ALL"
            ||
            item.model === selectedModel

        );

    const stockChart = [
        {
            name: "Safe",
            value:
                analyticsParts.filter(
                    (x) =>
                        x.current_stock >
                        x.min_stock
                ).length
        },
        {
            name: "Low",
            value:
                analyticsParts.filter(
                    (x) =>
                        x.current_stock <= x.min_stock
                ).length
        }
    ];

    // ======================================================
    // UI
    // ======================================================

    return (
        <div className="min-h-screen bg-[#020817] text-white px-6 pb-6 pt-2">

            

            {/* ====================================================== */}
            {/* KPI */}
            {/* ====================================================== */}


            <div className="
                grid
                grid-cols-5
                gap-5
                mt-3
            ">

                <div
                        onClick={() => {

                            resetAllFilters();

                        }}
                    >
                    <KPI
                        title="Total Part"
                        value={parts.length}
                        icon={<Package />}
                        color="cyan"
                        subtitle="All spare part"
                        active={
                            selectedStatuses.length === 0
                            &&
                            selectedModel === "ALL"
                            &&
                            selectedRack === "ALL"
                            &&
                            search === ""
                        }
                    />
                </div>

                <div
                    onClick={() => {

                        resetAllFilters();
                        setSelectedStatuses((prev) =>

                            prev.includes("LOW STOCK")
                                ? prev.filter(
                                    x => x !== "LOW STOCK"
                                )
                                : [
                                    ...prev,
                                    "LOW STOCK"
                                ]

                        );

                    }}
                >
                    <KPI
                        title="Low Stock"
                        value={
                            parts.filter(
                                x =>
                                    x.current_stock <= x.min_stock
                                    &&
                                    x.current_stock > 0
                            ).length
                        }
                        icon={<AlertTriangle />}
                        color="yellow"
                        subtitle="Need attention"
                        active={
                            selectedStatuses.includes(
                                "LOW STOCK"
                            )
                        }
                    />
                </div>

                <div
                    onClick={() => {

                        resetAllFilters();
                        setSelectedStatuses((prev) =>

                            prev.includes("CRITICAL")
                                ? prev.filter(
                                    x => x !== "CRITICAL"
                                )
                                : [
                                    ...prev,
                                    "CRITICAL"
                                ]

                        );

                    }}
                >
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
                        active={
                            selectedStatuses.includes(
                                "CRITICAL"
                            )
                        }
                    />
                </div>

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

            </div>



            {/* ====================================================== */}
            {/* ANALYTICS DASHBOARD */}
            {/* ====================================================== */}

            <div className="
                grid
                grid-cols-12
                gap-4
                mt-3
                mb-3
                items-start
            ">
                {/* ================================================= */}
                {/* STOCK HEALTH */}
                {/* ================================================= */}

                <div className="
                    col-span-3
                    bg-[#071226]
                    rounded-3xl
                    border
                    border-cyan-500/10
                    p-4
                    h-[280px]
                    overflow-hidden
                ">

                    <div className="
                        flex
                        justify-between
                        items-center
                        mb-2
                    ">

                        <h2 className="
                            font-bold
                            text-lg
                        ">
                            Stock Health
                        </h2>

                        <select
                            value={selectedModel}
                            onChange={(e) =>
                                setSelectedModel(e.target.value)
                            }
                            className="
                                h-9
                                min-w-[130px]
                                px-3
                                rounded-xl
                                text-xs
                                font-medium
                                bg-[#08192e]
                                border
                                border-cyan-500/10
                                text-white
                                outline-none
                            "
            >

                            <option value="ALL">
                                All Model
                            </option>

                            {
                                [...new Set(
                                    parts
                                        .map(x => x.model)
                                        .filter(Boolean)
                                )]
                                    .sort()
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
                    {
                            selectedModel !== "ALL" && (
                                <span className="
                                    px-2
                                    py-1
                                    rounded-full
                                    bg-cyan-500/20
                                    border
                                    border-cyan-400
                                    text-cyan-300
                                    text-[10px]
                                    font-bold
                                    animate-pulse
                                ">
                                    FILTER ON
                                </span>
                            )
                        }
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

                        <div className="
                            space-y-2
                            flex-1
                            pl-2
                        ">

                            <LegendItem
                                color="bg-cyan-400"
                                label="Healthy"
                                value={
                                    analyticsParts.filter(
                                        x =>
                                            x.current_stock >
                                            x.min_stock
                                    ).length
                                }
                            />

                            <LegendItem
                                color="bg-yellow-400"
                                label="Low Stock"
                                value={
                                    analyticsParts.filter(
                                        x =>
                                            x.current_stock <= x.min_stock
                                            &&
                                            x.current_stock > 0
                                    ).length
                                }
                            />

                            <LegendItem
                                color="bg-red-400"
                                label="Critical"
                                value={
                                    analyticsParts.filter(
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
                    col-span-5
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
                        height={190}
                    >

                        <BarChart
                            data={transactionOverviewData}
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
                    p-4
                    h-[280px]
                    overflow-hidden
                    flex
                    flex-col
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

                        <select

                            value={selectedTopUsedMonth}

                            onChange={(e) =>
                                setSelectedTopUsedMonth(
                                    Number(e.target.value)
                                )
                            }

                            className="
                                h-9
                                px-3
                                rounded-xl
                                bg-[#08192e]
                                border
                                border-cyan-500/10
                                text-xs
                                outline-none
                                text-white
                                min-w-[130px]
                            "
                        >

                            {
                                monthOptions.map(
                                    (month, index) => (

                                        <option
                                            key={month}
                                            value={index + 1}
                                        >
                                            {month}
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>

                    <div
                        className="
                            space-y-3
                            overflow-auto
                            pr-1
                            flex-1
                        "
                    >

                        {
                            topUsedParts.length === 0 ? (

                                <div
                                    className="
                                        h-full
                                        flex
                                        items-center
                                        justify-center
                                        text-slate-500
                                    "
                                >
                                    No outgoing transaction
                                    in this month
                                </div>

                            ) : (

                                topUsedParts.map((item, index) => (

                                    <div key={index}>

                                        <div
                                            className="
                                                flex
                                                justify-between
                                                mb-2
                                                text-sm
                                            "
                                        >

                                            <div>
                                                {item.part_name}
                                            </div>

                                            <div
                                                className="
                                                    text-cyan-400
                                                    font-bold
                                                "
                                            >
                                                {item.total_qty}
                                            </div>

                                        </div>

                                        <div
                                            className="
                                                w-full
                                                h-2
                                                rounded-full
                                                bg-[#08192e]
                                                overflow-hidden
                                            "
                                        >

                                            <div
                                                className="
                                                    h-full
                                                    rounded-full
                                                    bg-cyan-400
                                                "
                                                style={{
                                                    width: `${topUsedParts[0]
                                                        ? (
                                                            item.total_qty /
                                                            topUsedParts[0].total_qty
                                                        ) * 100
                                                        : 0
                                                        }%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                ))

                            )
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

                <div className="
                            flex
                            items-center
                            gap-3
                            mb-3
                        ">
                        <div className="
                                relative
                                flex-1
                            ">

                            <Search
                                className="
                                    absolute
                                    left-4
                                    top-3.5
                                    text-slate-500
                                "
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search part..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="
                                    w-full
                                    h-12
                                    pl-12
                                    pr-4
                                    rounded-2xl
                                    bg-[#08192e]
                                    border
                                    border-cyan-500/10
                                    outline-none
                                    text-white
                                    placeholder:text-slate-500
                                    focus:border-cyan-400/40
                                "
                            />

                        </div>
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

                        <div className="relative group">

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

                            {/* DROPDOWN */}

                            <div className="
                            absolute
                            right-0
                            top-14
                            w-44
                            bg-[#071226]
                            border
                            border-purple-500/20
                            rounded-2xl
                            overflow-hidden
                            opacity-0
                            invisible
                            group-hover:opacity-100
                            group-hover:visible
                            transition-all
                            duration-200
                            z-50
                            shadow-2xl
                        ">

                                {/* IN */}

                                <button
                                    onClick={() => {

                                        setTransactionType("IN");

                                        setSelectedPart(null);

                                        setShowTransactionModal(true);

                                    }}
                                    className="
                                    w-full
                                    h-12
                                    px-4
                                    flex
                                    items-center
                                    gap-3
                                    hover:bg-green-500/10
                                    text-green-400
                                    font-semibold
                                "
                                >
                                    <ArrowDownCircle size={18} />
                                    Stock In
                                </button>

                                {/* OUT */}

                                <button
                                    onClick={() => {

                                        setTransactionType("OUT");

                                        setSelectedPart(null);

                                        setShowTransactionModal(true);

                                    }}
                                    className="
                                    w-full
                                    h-12
                                    px-4
                                    flex
                                    items-center
                                    gap-3
                                    hover:bg-red-500/10
                                    text-red-400
                                    font-semibold
                                    border-t
                                    border-purple-500/10
                                "
                                >
                                    <ArrowUpCircle size={18} />
                                    Stock Out
                                </button>

                            </div>

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
                                Showing {tableFilteredParts.length} items
                            </div>

                        </div>

                        {/* TABLE */}

                        <div className="overflow-auto max-h-[520px]">

                            <table className="w-full min-w-[1500px]">

                                <thead className="
                                    sticky
                                    top-0
                                    z-20
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
                                            Vendor
                                        </th>

                                        <th>
                                            Price
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
                                        tableFilteredParts.map(
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
                                                        {item.vendor || "-"}
                                                    </td>

                                                    <td className="
                                                            text-cyan-300
                                                            font-semibold
                                                        ">
                                                        {
                                                            item.price
                                                                ? `Rp ${Number(item.price).toLocaleString("id-ID")}`
                                                                : "-"
                                                        }
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
                        h-[260px]
                        overflow-hidden
                        flex
                        flex-col
                    ">

                        {/* HEADER */}

                        <div className="
                            sticky
                            top-0
                            z-20
                            flex
                            items-center
                            justify-between
                            px-4
                            py-4
                            bg-[#071226]
                            border-b
                            border-cyan-500/10
                            shrink-0
                        ">

                            <h2 className="font-bold text-lg">
                                Storage Overview
                            </h2>

                            <div className="flex items-center gap-2">

                                {
                                    selectedRack !== "ALL" && (

                                        <button

                                            onClick={() =>
                                                setSelectedRack("ALL")
                                            }

                                            className="
                                            px-3
                                            h-7
                                            rounded-full
                                            bg-cyan-500/15
                                            border
                                            border-cyan-400/30
                                            text-cyan-300
                                            text-xs
                                            font-bold
                                            hover:bg-cyan-500/25
                                            transition-all
                                        "
                                        >

                                            {selectedRack} ✕

                                        </button>

                                    )
                                }

                                <div className="
                                text-cyan-400
                                text-sm
                                cursor-pointer
                            ">

                                    View All

                                </div>

                            </div>

                        </div>

                        {/* SCROLL BODY */}

                        <div className="
                            flex-1
                            overflow-y-auto
                            px-4
                            py-3
                            scrollbar-thin
                            scrollbar-thumb-cyan-500/20
                            scrollbar-track-transparent
                        ">

                            <div className="
                                grid
                                grid-cols-2
                                gap-3
                            ">

                                {
                                    [...new Set(parts.map(x => x.rack))]
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

                                                    onClick={() =>

                                                        setSelectedRack(

                                                            selectedRack === rack
                                                                ? "ALL"
                                                                : rack

                                                        )

                                                    }

                                                    className={`
                                                        rounded-2xl
                                                        p-3
                                                        min-h-[82px]
                                                        cursor-pointer
                                                        transition-all
                                                        duration-200

                                                        ${selectedRack === rack
                                                            ? `
                                                                    bg-cyan-500/10
                                                                    border-2
                                                                    border-cyan-400
                                                                    shadow-lg
                                                                    shadow-cyan-500/20
                                                                    scale-[1.02]
                                                                `
                                                            : `
                                                                    bg-[#08192e]
                                                                    border
                                                                    border-cyan-500/10
                                                                `
                                                        }
                                                    `}
                                                >

                                                    <div className="
                                                        flex
                                                        justify-between
                                                        items-center
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
                                                                rounded-full
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

                    </div>

                    {/* RECENT TRANSACTION */}

                    <div className="
                        bg-[#071226]
                        rounded-3xl
                        border
                        border-cyan-500/10
                        h-[370px]
                        overflow-hidden
                        flex
                        flex-col
                    ">

                        {/* HEADER */}

                        <div className="
                            sticky
                            top-0
                            z-20
                            flex
                            justify-between
                            items-center
                            px-5
                            py-5
                            bg-[#071226]
                            border-b
                            border-cyan-500/10
                            shrink-0
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <input
                                    type="date"
                                    value={selectedTransactionDate}
                                    onChange={(e) =>
                                        setSelectedTransactionDate(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-9
                                        px-3
                                        rounded-xl
                                        bg-[#08192e]
                                        border
                                        border-cyan-500/10
                                        text-sm
                                        outline-none
                                        text-white
                                    "
                                />

                                <Activity
                                    className="text-cyan-400"
                                    size={18}
                                />

                            </div>

                        </div>

                        {/* BODY */}

                        <div className="
                            flex-1
                            overflow-y-auto
                            px-5
                            py-4
                            space-y-3

                            scrollbar-thin
                            scrollbar-thumb-cyan-500/20
                            scrollbar-track-transparent
                        ">

                            {
                                transactions
                                    .filter((trx) => {

                                        if (!trx.created_at)
                                            return false;

                                        const trxDate =
                                            new Date(trx.created_at)
                                                .toISOString()
                                                .split("T")[0];

                                        return (
                                            trxDate ===
                                            selectedTransactionDate
                                        );

                                    })
                                    .slice(0, 20)
                                    .map((trx, i) => {

                                        const trxDate =
                                            trx.created_at
                                                ? new Date(trx.created_at)
                                                : null;

                                        const date =
                                            trxDate
                                                ? trxDate.toLocaleDateString("id-ID")
                                                : "-";

                                        const time =
                                            trxDate
                                                ? trxDate.toLocaleTimeString(
                                                    "id-ID",
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    }
                                                )
                                                : "-";

                                        return (

                                            <div
                                                key={i}
                                                className="
                                                    bg-[#08192e]
                                                    rounded-2xl
                                                    p-4
                                                    border
                                                    border-cyan-500/10
                                                "
                                            >

                                                {/* TOP */}

                                                <div className="
                                                    flex
                                                    justify-between
                                                    items-start
                                                    gap-3
                                                ">

                                                    {/* LEFT */}

                                                    <div className="flex-1 min-w-0">

                                                        {/* PART NO */}

                                                        <div className="
                                                            text-cyan-400
                                                            text-[11px]
                                                            font-bold
                                                            tracking-wide
                                                            mb-1
                                                            break-all
                                                        ">

                                                            {trx.part_no || "-"}

                                                        </div>

                                                        {/* PART NAME */}

                                                        <div className="
                                                            font-bold
                                                            text-sm
                                                            leading-tight
                                                            break-words
                                                        ">

                                                            {trx.part_name || "-"}

                                                        </div>

                                                    </div>

                                                    {/* BADGE */}

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        shrink-0
                                                    ">

                                                        <button
                                                            onClick={() =>
                                                                handleEditTransaction(trx)
                                                            }
                                                            className="
                                                                w-8
                                                                h-8
                                                                rounded-lg
                                                                bg-yellow-500/10
                                                                border
                                                                border-yellow-500/20
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-yellow-400
                                                                hover:bg-yellow-500/20
                                                            "
                                                        >
                                                            <Pencil size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteTransaction(trx)
                                                            }
                                                            className="
                                                                w-8
                                                                h-8
                                                                rounded-lg
                                                                bg-red-500/10
                                                                border
                                                                border-red-500/20
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-red-400
                                                                hover:bg-red-500/20
                                                            "
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>

                                                        <div
                                                            className={`
                                                                px-3
                                                                py-1
                                                                rounded-xl
                                                                text-xs
                                                                font-bold

                                                                ${trx.type === "IN"
                                                                    ? "bg-green-500/20 text-green-400"
                                                                    : "bg-red-500/20 text-red-400"
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                trx.type === "IN"
                                                                    ? `IN +${trx.qty}`
                                                                    : `OUT -${trx.qty}`
                                                            }

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* DETAIL */}

                                                <div className="
                                                    mt-3
                                                    pt-3
                                                    border-t
                                                    border-cyan-500/10
                                                    grid
                                                    grid-cols-2
                                                    gap-x-4
                                                    gap-y-1
                                                    text-xs
                                                ">

                                                    {/* DATE */}

                                                    <div className="text-slate-400">
                                                        Date
                                                    </div>

                                                    <div className="text-white text-right">
                                                        {date}
                                                    </div>

                                                    {/* TIME */}

                                                    <div className="text-slate-400">
                                                        Time
                                                    </div>

                                                    <div className="text-white text-right">
                                                        {time}
                                                    </div>

                                                    {/* STOCK IN */}

                                                    {
                                                        trx.type === "IN" && (
                                                            <>
                                                                <div className="text-slate-400">
                                                                    PO No
                                                                </div>

                                                                <div className="
                                                                    text-cyan-300
                                                                    text-right
                                                                    break-all
                                                                ">
                                                                    {trx.po_no || "-"}
                                                                </div>

                                                                <div className="text-slate-400">
                                                                    Qty In
                                                                </div>

                                                                <div className="
                                                                    text-green-400
                                                                    font-bold
                                                                    text-right
                                                                ">
                                                                    +{trx.qty}
                                                                </div>
                                                            </>
                                                        )
                                                    }

                                                    {/* STOCK OUT */}

                                                    {
                                                        trx.type === "OUT" && (
                                                            <>
                                                                <div className="text-slate-400">
                                                                    Name
                                                                </div>

                                                                <div className="
                                                                    text-white
                                                                    text-right
                                                                    break-words
                                                                ">
                                                                    {trx.technician || "-"}
                                                                </div>

                                                                <div className="text-slate-400">
                                                                    Machine
                                                                </div>

                                                                <div className="
                                                                    text-white
                                                                    text-right
                                                                    break-words
                                                                ">
                                                                    {trx.machine || "-"}
                                                                </div>

                                                                <div className="text-slate-400">
                                                                    Qty Out
                                                                </div>

                                                                <div className="
                                                                    text-red-400
                                                                    font-bold
                                                                    text-right
                                                                ">
                                                                    -{trx.qty}
                                                                </div>
                                                            </>
                                                        )
                                                    }

                                                </div>

                                            </div>

                                        );

                                    })
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
                                label="Vendor"
                                value={
                                    form.vendor
                                }
                                onChange={(
                                    e
                                ) =>
                                    setForm({
                                        ...form,
                                        vendor:
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
                                label="Price"
                                value={
                                    form.price
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        price:
                                            e.target.value
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

                        <div className="space-y-4">

                            {/* PART SEARCHABLE DROPDOWN */}

                            <div className="relative">

                                <div className="mb-2 text-sm text-slate-400">
                                    Search Part
                                </div>

                                {/* BUTTON */}

                                <button

                                    type="button"

                                    onClick={() =>
                                        setShowPartDropdown(
                                            !showPartDropdown
                                        )
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
                                        text-left
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span>

                                        {
                                            selectedPart
                                                ? `${selectedPart.part_no} - ${selectedPart.part_name}`
                                                : "Select Part No / Part Name"
                                        }

                                    </span>

                                    <span className="text-slate-400">
                                        ▼
                                    </span>

                                </button>

                                {/* DROPDOWN */}

                                {
                                    showPartDropdown && (

                                        <div className="
                                            absolute
                                            top-[78px]
                                            left-0
                                            w-full
                                            bg-[#071226]
                                            border
                                            border-cyan-500/20
                                            rounded-2xl
                                            z-50
                                            shadow-2xl
                                            overflow-hidden
                                        ">

                                            {/* SEARCH */}

                                            <div className="p-3 border-b border-cyan-500/10">

                                                <input

                                                    type="text"

                                                    placeholder="Search Part No / Part Name..."

                                                    value={transactionSearch}

                                                    onChange={(e) =>
                                                        setTransactionSearch(
                                                            e.target.value
                                                        )
                                                    }

                                                    className="
                                                        w-full
                                                        h-11
                                                        px-4
                                                        bg-[#08192e]
                                                        border
                                                        border-cyan-500/10
                                                        rounded-xl
                                                        outline-none
                                                        text-white
                                                    "
                                                />

                                            </div>

                                            {/* LIST */}

                                            <div className="
                                                max-h-[250px]
                                                overflow-auto
                                            ">

                                                {
                                                    parts
                                                        .filter((item) => {

                                                            const keyword =
                                                                transactionSearch.toLowerCase();

                                                            return (
                                                                item.part_no
                                                                    ?.toLowerCase()
                                                                    .includes(keyword)
                                                                ||
                                                                item.part_name
                                                                    ?.toLowerCase()
                                                                    .includes(keyword)
                                                            );

                                                        })
                                                        .map((item) => (

                                                            <button

                                                                key={item.id}

                                                                type="button"

                                                                onClick={() => {

                                                                    setSelectedPart(item);

                                                                    setShowPartDropdown(false);

                                                                    setTransactionSearch("");

                                                                }}

                                                                className="
                                                                    w-full
                                                                    px-4
                                                                    py-3
                                                                    text-left
                                                                    hover:bg-cyan-500/10
                                                                    border-b
                                                                    border-cyan-500/5
                                                                    transition-all
                                                                "
                                                            >

                                                                <div className="
                                                                    font-semibold
                                                                    text-cyan-300
                                                                ">
                                                                    {item.part_no}
                                                                </div>

                                                                <div className="
                                                                    text-sm
                                                                    text-slate-400
                                                                ">
                                                                    {item.part_name}
                                                                </div>

                                                            </button>

                                                        ))
                                                }

                                            </div>

                                        </div>

                                    )
                                }

                            </div>

                            {/* PART INFO */}

                            {
                                selectedPart && (

                                    <div className="
                                        grid
                                        grid-cols-2
                                        gap-3
                                    ">

                                        {/* CURRENT STOCK */}

                                        <div className="
                                            bg-[#08192e]
                                            rounded-2xl
                                            p-4
                                            border
                                            border-cyan-500/10
                                        ">

                                            <div className="
                                                text-xs
                                                text-slate-400
                                                mb-1
                                            ">
                                                Current Stock
                                            </div>

                                            <div className="
                                                text-2xl
                                                font-black
                                                text-cyan-400
                                            ">
                                                {selectedPart.current_stock}
                                            </div>

                                        </div>

                                        {/* RACK */}

                                        <div className="
                                            bg-[#08192e]
                                            rounded-2xl
                                            p-4
                                            border
                                            border-cyan-500/10
                                        ">

                                            <div className="
                                                text-xs
                                                text-slate-400
                                                mb-1
                                            ">
                                                Rack
                                            </div>

                                            <div className="
                                                text-lg
                                                font-bold
                                            ">
                                                {selectedPart.rack || "-"}
                                            </div>

                                        </div>

                                        {/* CATEGORY */}

                                        <div className="
                                            bg-[#08192e]
                                            rounded-2xl
                                            p-4
                                            border
                                            border-cyan-500/10
                                        ">

                                            <div className="
                                                text-xs
                                                text-slate-400
                                                mb-1
                                            ">
                                                Category
                                            </div>

                                            <div className="
                                                text-lg
                                                font-bold
                                                text-cyan-300
                                            ">
                                                {selectedPart.category || "-"}
                                            </div>

                                        </div>

                                        {/* MODEL */}

                                        <div className="
                                            bg-[#08192e]
                                            rounded-2xl
                                            p-4
                                            border
                                            border-cyan-500/10
                                        ">

                                            <div className="
                                                text-xs
                                                text-slate-400
                                                mb-1
                                            ">
                                                Model
                                            </div>

                                            <div className="
                                                text-lg
                                                font-bold
                                                text-cyan-300
                                            ">
                                                {selectedPart.model || "-"}
                                            </div>

                                        </div>

                                    </div>

                                )
                            }

                            {/* USER SEARCHABLE DROPDOWN */}

                            {
                                transactionType === "OUT" && (

                                    <div className="relative">

                                        <div className="mb-2 text-sm text-slate-400">
                                            Technician / Engineer
                                        </div>

                                        {/* BUTTON */}

                                        <button

                                            type="button"

                                            onClick={() =>
                                                setShowUserDropdown(
                                                    !showUserDropdown
                                                )
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
                                                text-left
                                                flex
                                                items-center
                                                justify-between
                                            "
                                        >

                                            <span>

                                                {
                                                    selectedUser
                                                        ? `${selectedUser.username} - ${selectedUser.role}`
                                                        : "Select Technician / Engineer"
                                                }

                                            </span>

                                            <span className="text-slate-400">
                                                ▼
                                            </span>

                                        </button>

                                        {/* DROPDOWN */}

                                        {
                                            showUserDropdown && (

                                                <div className="
                                                    absolute
                                                    top-[78px]
                                                    left-0
                                                    w-full
                                                    bg-[#071226]
                                                    border
                                                    border-cyan-500/20
                                                    rounded-2xl
                                                    z-50
                                                    shadow-2xl
                                                    overflow-hidden
                                                ">

                                                    {/* SEARCH */}

                                                    <div className="p-3 border-b border-cyan-500/10">

                                                        <input

                                                            type="text"

                                                            placeholder="Search username..."

                                                            value={userSearch}

                                                            onChange={(e) =>
                                                                setUserSearch(
                                                                    e.target.value
                                                                )
                                                            }

                                                            className="
                                                                w-full
                                                                h-11
                                                                px-4
                                                                bg-[#08192e]
                                                                border
                                                                border-cyan-500/10
                                                                rounded-xl
                                                                outline-none
                                                                text-white
                                                            "
                                                        />

                                                    </div>

                                                    {/* LIST */}

                                                    <div className="
                                                        max-h-[250px]
                                                        overflow-auto
                                                    ">

                                                        {
                                                            users
                                                                .filter((user) => {

                                                                    const keyword =
                                                                        userSearch.toLowerCase();

                                                                    return (
                                                                        user.username
                                                                            ?.toLowerCase()
                                                                            .includes(keyword)
                                                                    );

                                                                })
                                                                .map((user) => (

                                                                    <button

                                                                        key={user.id}

                                                                        type="button"

                                                                        onClick={() => {

                                                                            setSelectedUser(user);

                                                                            setShowUserDropdown(false);

                                                                            setUserSearch("");

                                                                        }}

                                                                        className="
                                                                            w-full
                                                                            px-4
                                                                            py-3
                                                                            text-left
                                                                            hover:bg-cyan-500/10
                                                                            border-b
                                                                            border-cyan-500/5
                                                                        "
                                                                    >

                                                                        <div className="
                                                                            font-semibold
                                                                            text-cyan-300
                                                                        ">
                                                                            {user.username}
                                                                        </div>

                                                                        <div className="
                                                                            text-sm
                                                                            text-slate-400
                                                                        ">
                                                                            {user.role}
                                                                        </div>

                                                                    </button>

                                                                ))
                                                        }

                                                    </div>

                                                </div>

                                            )
                                        }

                                    </div>

                                )
                            }

                            {/* MACHINE */}

                            {
                                transactionType === "OUT" && (

                                    <Input
                                        label="Machine"
                                        value={
                                            trxForm.machine || ""
                                        }
                                        onChange={(e) =>
                                            setTrxForm({
                                                ...trxForm,
                                                machine:
                                                    e.target.value
                                            })
                                        }
                                    />

                                )
                            }

                            {/* LINE SEARCHABLE DROPDOWN */}

                            {
                                transactionType === "OUT" && (

                                    <div className="relative">

                                        <div className="mb-2 text-sm text-slate-400">
                                            Line Name
                                        </div>

                                        {/* BUTTON */}

                                        <button

                                            type="button"

                                            onClick={() =>
                                                setShowLineDropdown(
                                                    !showLineDropdown
                                                )
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
                                                text-left
                                                flex
                                                items-center
                                                justify-between
                                            "
                                        >

                                            <span>

                                                {
                                                    selectedLine
                                                        ? selectedLine.name
                                                        : "Select Line Name"
                                                }

                                            </span>

                                            <span className="text-slate-400">
                                                ▼
                                            </span>

                                        </button>

                                        {/* DROPDOWN */}

                                        {
                                            showLineDropdown && (

                                                <div className="
                                                    absolute
                                                    top-[78px]
                                                    left-0
                                                    w-full
                                                    bg-[#071226]
                                                    border
                                                    border-cyan-500/20
                                                    rounded-2xl
                                                    z-50
                                                    shadow-2xl
                                                    overflow-hidden
                                                ">

                                                    {/* SEARCH */}

                                                    <div className="p-3 border-b border-cyan-500/10">

                                                        <input

                                                            type="text"

                                                            placeholder="Search line..."

                                                            value={lineSearch}

                                                            onChange={(e) =>
                                                                setLineSearch(
                                                                    e.target.value
                                                                )
                                                            }

                                                            className="
                                                                w-full
                                                                h-11
                                                                px-4
                                                                bg-[#08192e]
                                                                border
                                                                border-cyan-500/10
                                                                rounded-xl
                                                                outline-none
                                                                text-white
                                                            "
                                                        />

                                                    </div>

                                                    {/* LIST */}

                                                    <div className="
                                                        max-h-[250px]
                                                        overflow-auto
                                                    ">

                                                        {
                                                            lines
                                                                .filter((line) => {

                                                                    const keyword =
                                                                        lineSearch.toLowerCase();

                                                                    return (
                                                                        line.name
                                                                            ?.toLowerCase()
                                                                            .includes(keyword)
                                                                    );

                                                                })
                                                                .map((line) => (

                                                                    <button

                                                                        key={line.id}

                                                                        type="button"

                                                                        onClick={() => {

                                                                            setSelectedLine(line);

                                                                            setTrxForm({
                                                                                ...trxForm,
                                                                                line:
                                                                                    line.name
                                                                            });

                                                                            setShowLineDropdown(false);

                                                                            setLineSearch("");

                                                                        }}

                                                                        className="
                                                                            w-full
                                                                            px-4
                                                                            py-3
                                                                            text-left
                                                                            hover:bg-cyan-500/10
                                                                            border-b
                                                                            border-cyan-500/5
                                                                        "
                                                                    >

                                                                        <div className="
                                                                            font-semibold
                                                                            text-cyan-300
                                                                        ">
                                                                            {line.name}
                                                                        </div>

                                                                        <div className="
                                                                            text-sm
                                                                            text-slate-400
                                                                        ">
                                                                            {line.model}
                                                                        </div>

                                                                    </button>

                                                                ))
                                                        }

                                                    </div>

                                                </div>

                                            )
                                        }

                                    </div>

                                )
                            }

                            {/* PO NUMBER */}
                            {
                                transactionType === "IN" && (
                                    <Input
                                        label="PO No"
                                        value={
                                            trxForm.po_no || ""
                                        }
                                        onChange={(e) =>
                                            setTrxForm({
                                                ...trxForm,
                                                po_no:
                                                    e.target.value
                                            })
                                        }
                                    />
                                )
                            }

                            {/* QTY */}

                            <Input
                                type="number"
                                label={`Qty ${transactionType}`}
                                value={
                                    trxForm.qty
                                }
                                onChange={(e) =>
                                    setTrxForm({
                                        ...trxForm,
                                        qty:
                                            e.target.value
                                    })
                                }
                            />


                            <button
                                onClick={
                                    handleTransaction
                                }
                                className="
                                    w-full
                                    h-12
                                    rounded-2xl
                                    bg-cyan-500
                                    font-bold
                                    mt-2
                                "
                            >
                                Submit
                            </button>

                        </div>

                    </Modal>

                )
            }

            {
                showEditTransactionModal
                &&
                editingTransaction
                && (

                    <Modal
                        title="Edit Transaction"
                        onClose={() =>
                            setShowEditTransactionModal(
                                false
                            )
                        }
                    >

                        <div className="space-y-4">

                            <Input
                                type="number"
                                label="Qty"
                                value={
                                    editTransactionForm.qty
                                }
                                onChange={(e) =>
                                    setEditTransactionForm({
                                        ...editTransactionForm,
                                        qty: e.target.value
                                    })
                                }
                            />

                            {
                                editingTransaction.type === "IN"
                                &&
                                (
                                    <Input
                                        label="PO No"
                                        value={
                                            editTransactionForm.po_no
                                        }
                                        onChange={(e) =>
                                            setEditTransactionForm({
                                                ...editTransactionForm,
                                                po_no: e.target.value
                                            })
                                        }
                                    />
                                )
                            }

                            {
                                editingTransaction.type === "OUT"
                                &&
                                (
                                    <>
                                        <Input
                                            label="Machine"
                                            value={
                                                editTransactionForm.machine
                                            }
                                            onChange={(e) =>
                                                setEditTransactionForm({
                                                    ...editTransactionForm,
                                                    machine: e.target.value
                                                })
                                            }
                                        />

                                        <Input
                                            label="Technician"
                                            value={
                                                editTransactionForm.technician
                                            }
                                            onChange={(e) =>
                                                setEditTransactionForm({
                                                    ...editTransactionForm,
                                                    technician: e.target.value
                                                })
                                            }
                                        />
                                    </>
                                )
                            }

                            <button
                                onClick={
                                    handleSaveEditTransaction
                                }
                                className="
                                    w-full
                                    h-12
                                    rounded-2xl
                                    bg-cyan-500
                                    font-bold
                                "
                            >
                                Save Changes
                            </button>

                        </div>

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
    subtitle,
    active
}) {

    return (

        <div className={`
            bg-[#071226]
            rounded-3xl
            p-5
            min-h-[120px]
            flex
            flex-col
            justify-between
            cursor-pointer
            transition-all
            duration-200

            ${active
                ? `
                        border-2
                        scale-[1.02]
                        shadow-lg
                    `
                : `
                        border
                        border-cyan-500/10
                    `
            }

            ${active && color === "cyan"
                ? "border-cyan-400 shadow-cyan-500/20"
                : active && color === "yellow"
                    ? "border-yellow-400 shadow-yellow-500/20"
                    : active && color === "red"
                        ? "border-red-400 shadow-red-500/20"
                        : ""
            }
        `}>

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
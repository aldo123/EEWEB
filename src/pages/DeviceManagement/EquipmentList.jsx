import React, {
    useEffect,
    useState
} from "react";

import { supabase }
    from "../../supabase/supabase";

import * as XLSX from "xlsx";

import {
    Upload,
    CalendarCheck2,
    Download,
    Search,
    Trash2,
    Pencil,
    Plus,
    Cpu,
    CheckCircle2,
    AlertTriangle,
    XCircle
} from "lucide-react";

// ========================================
// NORMALIZE TEXT
// ========================================

const normalizeText = (
    value
) => {

    return String(value || "")
        .trim()
        .toLowerCase();

};

export default function EquipmentList() {

    const [equipments, setEquipments] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [groupFilters, setGroupFilters] =
        useState({});

    const [globalStatusFilter, setGlobalStatusFilter] =
        useState([]);

    const [editingItem, setEditingItem] =
        useState(null);

    const [editForm, setEditForm] =
        useState({});

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [calibrationItem, setCalibrationItem] =
        useState(null);

    const [lastInspectionDate, setLastInspectionDate] =
        useState("");

    const [nextCalibrationDate, setNextCalibrationDate] =
        useState("");

    const [addForm, setAddForm] =
        useState({

            equipment_no: "",
            equipment_name: "",
            machine: "",
            model: "",
            serial_number: "",
            maker: "",
            location: "",
            department: "",
            status: "Active",
            pic: "",
            remark: ""

        });

    // ========================================
    // LOAD DATA
    // ========================================

    useEffect(() => {

        loadEquipments();

    }, []);

    const loadEquipments =
        async () => {

            const {
                data,
                error
            } = await supabase
                .from("equipment_list")
                .select("*")
                .order("id", {
                    ascending: false
                });

            if (error) {

                console.log(error);
                return;

            }

            setEquipments(data || []);

        };

    const toggleGlobalStatusFilter = (
        status
    ) => {

        setGlobalStatusFilter((prev) => {

            const exists =
                prev.includes(status);

            if (exists) {

                return prev.filter(
                    x => x !== status
                );

            }

            return [...prev, status];

        });

    };
    // ========================================
    // IMPORT EXCEL
    // ========================================

    const handleImportExcel =
        async (e) => {

            const file =
                e.target.files[0];

            if (!file) return;

            e.target.value = null;

            const reader =
                new FileReader();

            reader.onload =
                async (evt) => {

                    try {

                        const data =
                            evt.target.result;

                        const workbook =
                            XLSX.read(data, {
                                type: "binary"
                            });

                        const sheetName =
                            workbook.SheetNames[0];

                        const sheet =
                            workbook.Sheets[sheetName];

                        const json =
                            XLSX.utils.sheet_to_json(
                                sheet
                            );

                        // ====================================
                        // FORMAT DATA
                        // ====================================
                        const formatExcelDate = (
                            value
                        ) => {

                            if (!value)
                                return "";

                            // kalau sudah string date
                            if (
                                typeof value === "string"
                            ) {

                                return value;

                            }

                            // excel serial number
                            if (
                                typeof value === "number"
                            ) {

                                const excelDate =
                                    XLSX.SSF.parse_date_code(
                                        value
                                    );

                                if (!excelDate)
                                    return "";

                                const date =
                                    new Date(

                                        excelDate.y,
                                        excelDate.m - 1,
                                        excelDate.d

                                    );

                                return date
                                    .toISOString()
                                    .split("T")[0];

                            }

                            return "";

                        };

                        const formatted =
                            json
                                .map((item) => {

                                    return {

                                        ["Equipment no."]:
                                            item["Equipment no."] || "",

                                        ["inspection equipment Group"]:
                                            item["inspection equipment Group"] || "",

                                        ["Nominal value"]:
                                            item["Nominal value"] || "",

                                        ["Status"]:
                                            item["Status"] || "",

                                        ["Blocking reason"]:
                                            item["Blocking reason"] || "",

                                        ["In cal."]:
                                            item["In cal."] || "",

                                        ["Last inspection"]:
                                            formatExcelDate(
                                                item["Last inspection"]
                                            ),

                                        ["Next calibration"]:
                                            formatExcelDate(
                                                item["Next calibration"]
                                            ),

                                        ["Company/Dept."]:
                                            item["Company/Dept."] || "",

                                        ["Remark"]:
                                            item["Remark"] || "",

                                        ["Model"]:
                                            item["Model"] || "",

                                        ["Brand"]:
                                            item["Brand"] || "",

                                        ["s/n"]:
                                            item["s/n"] || "",

                                        ["Plant"]:
                                            item["Plant"] || ""

                                    };

                                })

                                .filter((item) => {

                                    if (

                                        String(item["Equipment no."]).trim() === "" ||
                                        String(item["inspection equipment Group"]).trim() === ""

                                    ) {

                                        return false;

                                    }

                                    return true;

                                });

                        // ====================================
                        // LOAD DATABASE
                        // ====================================

                        const {
                            data: existingData,
                            error: existingError
                        } = await supabase
                            .from("equipment_list")
                            .select("*");

                        if (existingError) {

                            console.log(existingError);

                            alert(
                                "Load database failed"
                            );

                            return;

                        }

                        // ====================================
                        // CREATE MAP
                        // ====================================

                        const existingMap =
                            new Map();

                        existingData.forEach((row) => {

                            const key =
                                [

                                    normalizeText(
                                        row.equipment_no
                                    ),

                                    normalizeText(
                                        row.equipment_name
                                    )

                                ].join("_");

                            existingMap.set(
                                key,
                                row
                            );

                        });

                        // ====================================
                        // SPLIT INSERT / UPDATE
                        // ====================================

                        const insertData = [];
                        const updateData = [];

                        formatted.forEach((row) => {

                            const key =
                                [

                                    normalizeText(
                                        row.equipment_no
                                    ),

                                    normalizeText(
                                        row.equipment_name
                                    )

                                ].join("_");

                            const existing =
                                existingMap.get(key);

                            // ====================================
                            // UPDATE
                            // ====================================

                            if (existing) {

                                let changed =
                                    false;

                                Object.keys(row)
                                    .forEach((field) => {

                                        const oldVal =
                                            existing[field] ?? "";

                                        const newVal =
                                            row[field] ?? "";

                                        if (
                                            String(oldVal)
                                            !==
                                            String(newVal)
                                        ) {

                                            changed = true;

                                        }

                                    });

                                if (changed) {

                                    updateData.push({

                                        id: existing.id,
                                        ...row

                                    });

                                }

                            }

                            // ====================================
                            // INSERT
                            // ====================================

                            else {

                                insertData.push(row);

                            }

                        });

                        // ====================================
                        // INSERT
                        // ====================================

                        if (insertData.length > 0) {

                            const {
                                error: insertError
                            } = await supabase
                                .from("equipment_list")
                                .insert(insertData);

                            if (insertError) {

                                console.log(insertError);

                            }

                        }

                        // ====================================
                        // UPDATE
                        // ====================================

                        for (const row of updateData) {

                            const {
                                id,
                                ...payload
                            } = row;

                            const {
                                error: updateError
                            } = await supabase
                                .from("equipment_list")
                                .update(payload)
                                .eq("id", id);

                            if (updateError) {

                                console.log(updateError);

                            }

                        }

                        await loadEquipments();

                        alert(`
Import Success

Insert : ${insertData.length}
Update : ${updateData.length}
                        `);

                    }

                    catch (err) {

                        console.log(err);

                        alert(
                            "Import failed"
                        );

                    }

                };

            reader.readAsBinaryString(
                file
            );

        };

    // ========================================
    // EXPORT EXCEL
    // ========================================

    const handleExportExcel = () => {

        // ====================================
        // FORMAT DATE
        // ====================================

        const formatDate = (dateValue) => {

            if (!dateValue)
                return "";

            const d =
                new Date(dateValue);

            if (isNaN(d))
                return "";

            const day =
                String(d.getDate())
                    .padStart(2, "0");

            const month =
                String(d.getMonth() + 1)
                    .padStart(2, "0");

            const year =
                d.getFullYear();

            return `${day}/${month}/${year}`;

        };

        // ====================================
        // EXPORT DATA
        // ====================================

        const exportData =
            equipments.map((item) => ({

                "Equipment no.":
                    item["Equipment no."] || "",

                "inspection equipment Group":
                    item["inspection equipment Group"] || "",

                "Nominal value":
                    item["Nominal value"] || "",

                "Status":
                    item["Status"] || "",

                "Blocking reason":
                    item["Blocking reason"] || "",

                "In cal.":
                    item["In cal."] || "",

                "Last inspection":
                    formatDate(
                        item["Last inspection"]
                    ),

                "Next calibration":
                    formatDate(
                        item["Next calibration"]
                    ),

                "Company/Dept.":
                    item["Company/Dept."] || "",

                "Remark":
                    item["Remark"] || "",

                "Model":
                    item["Model"] || "",

                "Brand":
                    item["Brand"] || "",

                "s/n":
                    item["s/n"] || "",

                "Plant":
                    item["Plant"] || ""

            }));
        // ====================================
        // CREATE WORKSHEET
        // ====================================

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );

        // ====================================
        // COLUMN WIDTH
        // ====================================

        worksheet["!cols"] = [

            { wch: 15 }, // Equipment no.
            { wch: 38 }, // Group
            { wch: 15 }, // Nominal
            { wch: 12 }, // Status
            { wch: 18 }, // Blocking
            { wch: 10 }, // In cal
            { wch: 18 }, // Last inspection
            { wch: 18 }, // Next calibration
            { wch: 42 }, // Company
            { wch: 22 }, // Remark
            { wch: 18 }, // Model
            { wch: 15 }, // Brand
            { wch: 18 }, // s/n
            { wch: 10 }  // Plant

        ];

        // ====================================
        // CREATE WORKBOOK
        // ====================================

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(

            workbook,
            worksheet,
            "Equipment List"

        );

        // ====================================
        // EXPORT FILE
        // ====================================

        XLSX.writeFile(

            workbook,

            `Equipment_List_${new Date()
                .toISOString()
                .split("T")[0]}.xlsx`

        );

    };

    // ========================================
    // DELETE ALL
    // ========================================

    const handleDeleteAll =
        async () => {

            const confirmDelete =
                window.confirm(
                    "DELETE ALL EQUIPMENT ?"
                );

            if (!confirmDelete)
                return;

            const {
                error
            } = await supabase
                .from("equipment_list")
                .delete()
                .neq("id", 0);

            if (error) {

                console.log(error);

                alert(
                    "Delete failed"
                );

                return;

            }

            await loadEquipments();

        };

    // ========================================
    // DELETE
    // ========================================

    const handleDelete =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this equipment?"
                );

            if (!confirmDelete)
                return;

            const {
                error
            } = await supabase
                .from("equipment_list")
                .delete()
                .eq("id", id);

            if (error) {

                console.log(error);

                return;

            }

            await loadEquipments();

        };

    // ========================================
    // EDIT
    // ========================================

    const handleEdit =
        (item) => {

            setEditingItem(item);

            setEditForm({

                ["Equipment no."]:
                    item["Equipment no."] || "",

                ["inspection equipment Group"]:
                    item["inspection equipment Group"] || "",

                ["Plant"]:
                    item["Plant"] || "",

                ["Model"]:
                    item["Model"] || "",

                ["s/n"]:
                    item["s/n"] || "",

                ["Brand"]:
                    item["Brand"] || "",

                ["Company/Dept."]:
                    item["Company/Dept."] || "",

                ["Remark"]:
                    item["Remark"] || "",

                ["Last inspection"]:
                    item["Last inspection"] || "",

                ["Next calibration"]:
                    item["Next calibration"] || ""

            });

        };


    // ========================================
    // UPDATE CALIBRATION
    // ========================================

    const handleUpdateCalibration =
        async () => {

            if (!calibrationItem)
                return;

            let nextDate = "";

            // ====================================
            // AUTO NEXT DATE +1 YEAR
            // ====================================

            if (lastInspectionDate) {

                const last =
                    new Date(lastInspectionDate);

                const next =
                    new Date(last);

                next.setFullYear(
                    next.getFullYear() + 1
                );

                nextDate =
                    next.toISOString()
                        .split("T")[0];

            }

            const {
                error
            } = await supabase
                .from("equipment_list")
                .update({

                    "Last inspection":
                        lastInspectionDate,

                    "Next calibration":
                        nextDate

                })
                .eq(
                    "id",
                    calibrationItem.id
                );

            if (error) {

                console.log(error);

                alert(
                    "Update calibration failed"
                );

                return;

            }

            await loadEquipments();

            setCalibrationItem(null);

            setLastInspectionDate("");

            setNextCalibrationDate("");

        };

    const handleSaveEdit =
        async () => {

            const {
                error
            } = await supabase
                .from("equipment_list")
                .update(editForm)
                .eq(
                    "id",
                    editingItem.id
                );

            if (error) {

                console.log(error);

                return;

            }

            await loadEquipments();

            setEditingItem(null);

        };

    // ========================================
    // ADD
    // ========================================

    const handleAddEquipment =
        async () => {

            const duplicate =
                equipments.find(
                    (x) =>

                        normalizeText(
                            x.equipment_no
                        ) ===

                        normalizeText(
                            addForm.equipment_no
                        )

                        &&

                        normalizeText(
                            x.equipment_name
                        ) ===

                        normalizeText(
                            addForm.equipment_name
                        )
                );

            if (duplicate) {

                alert(
                    "Duplicate equipment"
                );

                return;

            }

            const {
                error
            } = await supabase
                .from("equipment_list")
                .insert([addForm]);

            if (error) {

                console.log(error);

                return;

            }

            await loadEquipments();

            setShowAddModal(false);

        };
    const getCalibrationStatus = (nextDate) => {

        if (!nextDate) {

            return {
                label: "No Date",
                bg: "bg-slate-500/20",
                text: "text-slate-300"
            };

        }

        const today = new Date();

        const next =
            new Date(nextDate);

        // reset time
        today.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);

        const diffTime =
            next - today;

        const diffDays =
            Math.ceil(
                diffTime / (1000 * 60 * 60 * 24)
            );

        // ====================================
        // OVERDUE
        // ====================================

        if (diffDays < 0) {

            return {

                label: "Overdue",
                bg: "bg-red-500/20",
                text: "text-red-300"

            };

        }

        // ====================================
        // DUE SOON
        // < 30 HARI
        // ====================================

        if (diffDays <= 30) {

            return {

                label: "Due Soon",
                bg: "bg-yellow-500/20",
                text: "text-yellow-300"

            };

        }

        // ====================================
        // CALIBRATED
        // ====================================

        return {

            label: "Calibrated",
            bg: "bg-emerald-500/20",
            text: "text-emerald-300"

        };

    };
    // ========================================
    // FILTER
    // ========================================

    const filteredEquipments =
        equipments.filter((item) => {

            const keyword =
                search.toLowerCase();

            const itemStatus =
                getCalibrationStatus(
                    item["Next calibration"]
                ).label;

            if (
                globalStatusFilter.length > 0
                &&
                !globalStatusFilter.includes(
                    itemStatus
                )
            ) {

                return false;

            }

            return (

                item["Equipment no."]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item["inspection equipment Group"]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item["Plant"]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.model
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item["s/n"]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item["Brand"]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.location
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item["Company/Dept."]
                    ?.toLowerCase()
                    .includes(keyword)

                ||

                item.pic
                    ?.toLowerCase()
                    .includes(keyword)

            );

        });



    const toggleGroupStatusFilter = (
        groupName,
        status
    ) => {

        setGroupFilters((prev) => {

            const current =
                prev[groupName] || [];

            const exists =
                current.includes(status);

            return {

                ...prev,

                [groupName]:
                    exists
                        ? current.filter(
                            x => x !== status
                        )
                        : [...current, status]

            };

        });

    };

    const groupedEquipments =
        filteredEquipments.reduce(
            (acc, item) => {

                const group =
                    item[
                    "inspection equipment Group"
                    ] || "NO GROUP";

                if (!acc[group]) {

                    acc[group] = [];

                }

                acc[group].push(item);

                return acc;

            },
            {}
        );
    // ========================================
    // SUMMARY
    // ========================================

    const totalEquipment =
        equipments.length;

    const calibratedEquipment =
        equipments.filter(
            x =>
                getCalibrationStatus(
                    x["Next calibration"]
                ).label === "Calibrated"
        ).length;

    const overdueEquipment =
        equipments.filter(
            x =>
                getCalibrationStatus(
                    x["Next calibration"]
                ).label === "Overdue"
        ).length;

    const dueSoonEquipment =
        equipments.filter(
            x =>
                getCalibrationStatus(
                    x["Next calibration"]
                ).label === "Due Soon"
        ).length;


    // ========================================
    // DELAY INFO
    // ========================================

    const getDelayInfo = (
        nextDate
    ) => {

        if (!nextDate) {

            return {
                text: "No Date",
                color: "text-slate-400"
            };

        }

        const today =
            new Date();

        const next =
            new Date(nextDate);

        today.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);

        const diffDays =
            Math.ceil(
                (next - today)
                /
                (1000 * 60 * 60 * 24)
            );

        // ====================================
        // OVERDUE
        // ====================================

        if (diffDays < 0) {

            return {

                text:
                    `+ ${Math.abs(diffDays)} Days`,

                color:
                    "text-red-400"

            };

        }

        // ====================================
        // DUE SOON
        // ====================================

        if (diffDays <= 30) {

            return {

                text:
                    `- ${diffDays} Days`,

                color:
                    "text-yellow-400"

            };

        }

        // ====================================
        // CALIBRATED
        // ====================================

        return {

            text:
                `${diffDays} Days Left`,

            color:
                "text-emerald-400"

        };

    };

    return (

        <div className="
            p-8
            text-white
            min-h-screen
            bg-gradient-to-br
            from-[#020617]
            via-[#03112b]
            to-[#020617]
        ">

            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}

            <div className="
                flex
                items-start
                justify-between
                mb-8
                rounded-[32px]
                border
                border-cyan-500/10
                bg-gradient-to-r
                from-cyan-500/5
                to-transparent
                backdrop-blur-xl
                p-8
                shadow-2xl
                shadow-cyan-500/5
            ">

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

                        EQUIPMENT CALIBRATION

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
                        Calibration Plan
                    </h1>

                    <p className="
                        text-slate-400
                        mt-3
                        text-lg
                    ">
                        Calibration & equipment monitoring system
                    </p>

                </div>

            </div>

            {/* SUMMARY */}

            <div className="
                grid
                grid-cols-4
                gap-4
                mb-6
            ">

                <SummaryCard
                    title="Total Equipment"
                    value={totalEquipment}
                    color="cyan"
                    icon={<Cpu />}
                />

                <SummaryCard
                    title="Calibrated"
                    active={globalStatusFilter.includes("Calibrated")}
                    onClick={() =>
                        toggleGlobalStatusFilter(
                            "Calibrated"
                        )
                    }
                    value={calibratedEquipment}
                    color="emerald"
                    icon={<CheckCircle2 />}
                />

                <SummaryCard
                    title="Overdue"
                    active={globalStatusFilter.includes("Overdue")}
                    onClick={() =>
                        toggleGlobalStatusFilter(
                            "Overdue"
                        )
                    }
                    value={overdueEquipment}
                    color="red"
                    icon={<AlertTriangle />}
                />

                <SummaryCard
                    title="Due Soon"
                    active={globalStatusFilter.includes("Due Soon")}
                    onClick={() =>
                        toggleGlobalStatusFilter(
                            "Due Soon"
                        )
                    }
                    value={dueSoonEquipment}
                    color="purple"
                    icon={<XCircle />}
                />

            </div>

            {/* SEARCH */}

            <div className="
                flex
                items-center
                gap-3
                mb-5
            ">

                <div className="
                    relative
                    flex-1
                ">

                    <Search
                        className="
                            absolute
                            left-4
                            top-4
                            text-slate-500
                        "
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder=" Search equipment..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            h-12
                            rounded-2xl
                            bg-slate-900/60
                            border
                            border-slate-800
                            pl-12
                            pr-4
                            outline-none
                            text-sm
                        "
                    />

                </div>

                <button
                    onClick={() =>
                        setShowAddModal(true)
                    }
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-cyan-500
                        flex
                        items-center
                        gap-2
                        font-bold
                    "
                >

                    <Plus size={18} />

                    Add Equipment

                </button>

                <label className="
                    h-12
                    px-5
                    rounded-2xl
                    bg-emerald-500
                    flex
                    items-center
                    gap-2
                    font-bold
                    cursor-pointer
                ">

                    <Upload size={18} />

                    Import Excel

                    <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={
                            handleImportExcel
                        }
                    />

                </label>

                <button
                    onClick={
                        handleExportExcel
                    }
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-blue-600
                        flex
                        items-center
                        gap-2
                        font-bold
                    "
                >

                    <Download size={18} />

                    Export Excel

                </button>

                <button
                    onClick={
                        handleDeleteAll
                    }
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-red-600
                        flex
                        items-center
                        gap-2
                        font-bold
                    "
                >

                    <Trash2 size={18} />

                    Delete All

                </button>

            </div>

            {/* TABLE */}

            <div className="
                grid
                grid-cols-1
                xl:grid-cols-2
                gap-5
            ">

                {
                    Object.entries(
                        groupedEquipments
                    ).map(

                        ([groupName, items]) => {
                            const localFilter =
                                groupFilters[groupName] || [];

                            const calibrated =
                                items.filter(
                                    x =>
                                        getCalibrationStatus(
                                            x["Next calibration"]
                                        ).label === "Calibrated"
                                ).length;

                            const overdue =
                                items.filter(
                                    x =>
                                        getCalibrationStatus(
                                            x["Next calibration"]
                                        ).label === "Overdue"
                                ).length;

                            const dueSoon =
                                items.filter(
                                    x =>
                                        getCalibrationStatus(
                                            x["Next calibration"]
                                        ).label === "Due Soon"
                                ).length;

                            return (

                                <div
                                    key={groupName}
                                    className="
                                    rounded-3xl
                                    border
                                    border-cyan-500/20
                                    bg-slate-900/50
                                    overflow-hidden
                                "
                                >

                                    {/* HEADER */}

                                    <div className="
                                        p-4
                                        border-b
                                        border-slate-800
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                        min-h-[110px]
                                    ">

                                        <div>

                                            <h1 className="
                                                text-[24px]
                                                leading-7
                                                font-black
                                                text-cyan-300
                                                line-clamp-2
                                                break-words
                                                min-h-[56px]
                                            ">
                                                {groupName}
                                            </h1>

                                            <p className="
                                                text-xs
                                                text-slate-500
                                                mt-2
                                            ">
                                                Total Equipment :
                                                {" "}
                                                {items.length}
                                            </p>

                                        </div>

                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                            shrink-0
                                        ">

                                            {/* CALIBRATED */}

                                            <button
                                                onClick={() =>
                                                    toggleGroupStatusFilter(
                                                        groupName,
                                                        "Calibrated"
                                                    )
                                                }
                                                className={`
                                                    min-w-[125px]
                                                    h-[40px]
                                                    rounded-xl
                                                    bg-emerald-500/15
                                                    border
                                                    border-emerald-500/20
                                                    text-emerald-300
                                                    text-xs
                                                    font-bold
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-1
                                                    px-4
                                                    transition-all
                                                    hover:scale-105

                                                    ${groupFilters[groupName]?.includes(
                                                    "Calibrated"
                                                )
                                                        ? `
                                                                ring-2
                                                                ring-emerald-400
                                                                scale-105
                                                                shadow-lg
                                                                shadow-emerald-500/20
                                                            `
                                                        : ""
                                                    }
                                                `}
                                            >

                                                Calibrated :
                                                {calibrated}

                                            </button>

                                            {/* OVERDUE */}

                                            <button
                                                onClick={() =>
                                                    toggleGroupStatusFilter(
                                                        groupName,
                                                        "Overdue"
                                                    )
                                                }
                                                className={`
                                                    min-w-[125px]
                                                    h-[40px]
                                                    rounded-xl
                                                    bg-red-500/15
                                                    border
                                                    border-red-500/20
                                                    text-red-300
                                                    text-xs
                                                    font-bold
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-1
                                                    px-4
                                                    transition-all
                                                    hover:scale-105

                                                    ${groupFilters[groupName]?.includes(
                                                    "Overdue"
                                                )
                                                        ? `
                                                                ring-2
                                                                ring-red-400
                                                                scale-105
                                                                shadow-lg
                                                                shadow-red-500/20
                                                            `
                                                        : ""
                                                    }
                                                `}
                                            >

                                                Overdue :
                                                {overdue}

                                            </button>

                                            {/* DUE SOON */}

                                            <button
                                                onClick={() =>
                                                    toggleGroupStatusFilter(
                                                        groupName,
                                                        "Due Soon"
                                                    )
                                                }
                                                className={`
                                                    min-w-[125px]
                                                    h-[40px]
                                                    rounded-xl
                                                    bg-yellow-500/15
                                                    border
                                                    border-yellow-500/20
                                                    text-yellow-300
                                                    text-xs
                                                    font-bold
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-1
                                                    px-4
                                                    transition-all
                                                    hover:scale-105

                                                    ${groupFilters[groupName]?.includes(
                                                    "Due Soon"
                                                )
                                                        ? `
                                                                ring-2
                                                                ring-yellow-400
                                                                scale-105
                                                                shadow-lg
                                                                shadow-yellow-500/20
                                                            `
                                                        : ""
                                                    }
                                                `}
                                            >

                                                Due Soon :
                                                {dueSoon}

                                            </button>

                                        </div>

                                    </div>

                                    {/* CONTENT */}

                                    <div className="
                                    max-h-[300px]
                                    overflow-auto
                                ">



                                        {
                                            items
                                                .filter((item) => {

                                                    const itemStatus =
                                                        getCalibrationStatus(
                                                            item["Next calibration"]
                                                        ).label;

                                                    // ====================================
                                                    // GLOBAL FILTER
                                                    // ====================================

                                                    if (
                                                        globalStatusFilter.length > 0
                                                        &&
                                                        !globalStatusFilter.includes(
                                                            itemStatus
                                                        )
                                                    ) {

                                                        return false;

                                                    }

                                                    // ====================================
                                                    // LOCAL FILTER
                                                    // ====================================

                                                    if (
                                                        localFilter.length > 0
                                                        &&
                                                        !localFilter.includes(
                                                            itemStatus
                                                        )
                                                    ) {

                                                        return false;

                                                    }

                                                    return true;

                                                })

                                                // ====================================
                                                // SORTING
                                                // ====================================

                                                .sort((a, b) => {

                                                    const today =
                                                        new Date();

                                                    const getDiff = (item) => {

                                                        if (
                                                            !item["Next calibration"]
                                                        ) {

                                                            return 999999999;

                                                        }

                                                        const next =
                                                            new Date(
                                                                item["Next calibration"]
                                                            );

                                                        return next - today;

                                                    };

                                                    const diffA =
                                                        getDiff(a);

                                                    const diffB =
                                                        getDiff(b);

                                                    // overdue paling atas

                                                    if (
                                                        diffA < 0 &&
                                                        diffB >= 0
                                                    ) {

                                                        return -1;

                                                    }

                                                    if (
                                                        diffB < 0 &&
                                                        diffA >= 0
                                                    ) {

                                                        return 1;

                                                    }

                                                    // paling dekat dulu

                                                    return diffA - diffB;

                                                })

                                                .map((item) => {

                                                    return (

                                                        <div
                                                            key={item.id}
                                                            className="
                                                        grid
                                                        grid-cols-[1.2fr_1fr_auto]
                                                        gap-4
                                                        items-center
                                                        px-4
                                                        py-3
                                                        border-b
                                                        border-slate-800/80
                                                        hover:bg-cyan-500/5
                                                        transition
                                                    "
                                                        >

                                                            {/* LEFT */}

                                                            <div className="
                                                        min-w-0
                                                    ">

                                                                <div className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            mb-1
                                                        ">

                                                                    <h1 className="
                                                                text-sm
                                                                font-bold
                                                                text-white
                                                                truncate
                                                            ">
                                                                        {item["Equipment no."]}
                                                                    </h1>

                                                                    <span className={`
                                                                    px-2
                                                                    py-[2px]
                                                                    rounded-full
                                                                    text-[10px]
                                                                    font-bold
                                                                    whitespace-nowrap

                                                                    ${getCalibrationStatus(
                                                                        item["Next calibration"]
                                                                    ).bg}

                                                                    ${getCalibrationStatus(
                                                                        item["Next calibration"]
                                                                    ).text}
                                                                `}>
                                                                        {
                                                                            getCalibrationStatus(
                                                                                item["Next calibration"]
                                                                            ).label
                                                                        }
                                                                    </span>

                                                                </div>

                                                                <p className="
                                                            text-xs
                                                            text-slate-300
                                                            truncate
                                                        ">
                                                                    {item["Model"] || "-"}
                                                                </p>

                                                                <p className="
                                                            text-[11px]
                                                            text-slate-500
                                                            truncate
                                                            mt-1
                                                        ">
                                                                    S/N :
                                                                    {" "}
                                                                    {item["s/n"] || "-"}
                                                                </p>

                                                                <p className="
                                                            text-[11px]
                                                            text-yellow-400
                                                            truncate
                                                        ">
                                                                    {item["Remark"] || "-"}
                                                                </p>

                                                            </div>

                                                            {/* CENTER */}

                                                            <div className="
                                                                text-xs
                                                                space-y-2
                                                            ">

                                                                {/* LAST */}

                                                                <div>

                                                                    <span className="
                                                                        text-cyan-400
                                                                        font-semibold
                                                                    ">
                                                                        Last :
                                                                    </span>

                                                                    <span className="
                                                                        text-slate-200
                                                                    ">
                                                                        {
                                                                            item["Last inspection"]
                                                                                ? new Date(
                                                                                    item["Last inspection"]
                                                                                ).toLocaleDateString("id-ID")
                                                                                : "-"
                                                                        }
                                                                    </span>

                                                                </div>

                                                                {/* NEXT */}

                                                                <div>

                                                                    <span className="
                                                                        text-yellow-400
                                                                        font-semibold
                                                                    ">
                                                                        Next :
                                                                    </span>

                                                                    <span className="
                                                                        text-slate-200
                                                                    ">
                                                                        {
                                                                            item["Next calibration"]
                                                                                ? new Date(
                                                                                    item["Next calibration"]
                                                                                ).toLocaleDateString("id-ID")
                                                                                : "-"
                                                                        }
                                                                    </span>

                                                                </div>

                                                                {/* DELAY INFO */}

                                                                <div className={`
                                                                    text-[11px]
                                                                    font-bold
                                                                    ${getDelayInfo(
                                                                    item["Next calibration"]
                                                                ).color}
                                                                `}>

                                                                    {
                                                                        getDelayInfo(
                                                                            item["Next calibration"]
                                                                        ).text
                                                                    }

                                                                </div>

                                                            </div>

                                                            {/* RIGHT */}

                                                            <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                    ">
                                                                <button
                                                                    onClick={() => {

                                                                        setCalibrationItem(item);

                                                                        setLastInspectionDate(
                                                                            item["Last inspection"] || ""
                                                                        );

                                                                    }}
                                                                    className="
                                                                w-8
                                                                h-8
                                                                rounded-lg
                                                                bg-cyan-500/10
                                                                border
                                                                border-cyan-500/20
                                                                flex
                                                                items-center
                                                                justify-center
                                                                hover:bg-cyan-500/20
                                                            "
                                                                >

                                                                    <CalendarCheck2
                                                                        size={14}
                                                                        className="
                                                                    text-cyan-400
                                                                "
                                                                    />

                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleEdit(item)
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
                                                                hover:bg-yellow-500/20
                                                            "
                                                                >

                                                                    <Pencil
                                                                        size={14}
                                                                        className="
                                                                    text-yellow-400
                                                                "
                                                                    />

                                                                </button>

                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(item.id)
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
                                                                hover:bg-red-500/20
                                                            "
                                                                >

                                                                    <Trash2
                                                                        size={14}
                                                                        className="
                                                                    text-red-400
                                                                "
                                                                    />

                                                                </button>

                                                            </div>

                                                        </div>

                                                    );

                                                })
                                        }

                                    </div>

                                </div>

                            );

                        }

                    )
                }

            </div>

            {/* EDIT MODAL */}

            {
                editingItem && (

                    <div className="
                        fixed
                        inset-0
                        bg-black/70
                        flex
                        items-center
                        justify-center
                        z-50
                    ">

                        <div className="
                            w-[650px]
                            rounded-3xl
                            bg-[#071227]
                            border
                            border-yellow-500/20
                            p-6
                        ">

                            <h1 className="
                                text-2xl
                                font-black
                                text-yellow-300
                                mb-6
                            ">
                                Edit Equipment
                            </h1>

                            <div className="
                                grid
                                grid-cols-2
                                gap-4
                            ">

                                <input
                                    placeholder="Equipment No"
                                    value={editForm["Equipment no."] || ""}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            ["Equipment no."]:
                                                e.target.value
                                        })
                                    }
                                    className="
                                        h-12
                                        rounded-xl
                                        bg-slate-900
                                        border
                                        border-slate-700
                                        px-4
                                    "
                                />

                                <input
                                    placeholder="Model"
                                    value={editForm["Model"] || ""}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            ["Model"]:
                                                e.target.value
                                        })
                                    }
                                    className="
                                        h-12
                                        rounded-xl
                                        bg-slate-900
                                        border
                                        border-slate-700
                                        px-4
                                    "
                                />

                                <input
                                    placeholder="S/N"
                                    value={editForm["s/n"] || ""}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            ["s/n"]:
                                                e.target.value
                                        })
                                    }
                                    className="
                                        h-12
                                        rounded-xl
                                        bg-slate-900
                                        border
                                        border-slate-700
                                        px-4
                                    "
                                />

                                <input
                                    placeholder="Brand"
                                    value={editForm["Brand"] || ""}
                                    onChange={(e) =>
                                        setEditForm({
                                            ...editForm,
                                            ["Brand"]:
                                                e.target.value
                                        })
                                    }
                                    className="
                                        h-12
                                        rounded-xl
                                        bg-slate-900
                                        border
                                        border-slate-700
                                        px-4
                                    "
                                />

                            </div>

                            <div className="
                                    grid
                                    grid-cols-2
                                    gap-4
                                    mt-4
                                ">

                                {/* LAST INSPECTION */}

                                <div>

                                    <label className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-cyan-300
                                            mb-2
                                        ">
                                        Last Inspection Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            editForm["Last inspection"] || ""
                                        }
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                ["Last inspection"]:
                                                    e.target.value
                                            })
                                        }
                                        className="
                                                w-full
                                                h-12
                                                rounded-xl
                                                bg-slate-900
                                                border
                                                border-slate-700
                                                px-4
                                                text-white
                                            "
                                    />

                                </div>

                                {/* NEXT CALIBRATION */}

                                <div>

                                    <label className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-yellow-300
                                            mb-2
                                        ">
                                        Next Calibration Schedule
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            editForm["Next calibration"] || ""
                                        }
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                ["Next calibration"]:
                                                    e.target.value
                                            })
                                        }
                                        className="
                                                w-full
                                                h-12
                                                rounded-xl
                                                bg-slate-900
                                                border
                                                border-slate-700
                                                px-4
                                                text-white
                                            "
                                    />

                                </div>

                            </div>

                            <textarea
                                placeholder="Remark"
                                value={editForm["Remark"] || ""}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        ["Remark"]:
                                            e.target.value
                                    })
                                }
                                className="
                                    w-full
                                    h-28
                                    rounded-2xl
                                    bg-slate-900
                                    border
                                    border-slate-700
                                    p-4
                                    mt-4
                                "
                            />

                            <div className="
                                flex
                                justify-end
                                gap-3
                                mt-6
                            ">

                                <button
                                    onClick={() =>
                                        setEditingItem(null)
                                    }
                                    className="
                                        h-11
                                        px-5
                                        rounded-xl
                                        bg-slate-700
                                        font-bold
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSaveEdit}
                                    className="
                                        h-11
                                        px-5
                                        rounded-xl
                                        bg-yellow-500
                                        text-black
                                        font-bold
                                    "
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
            {/* CALIBRATION MODAL */}

            {
                calibrationItem && (

                    <div className="
            fixed
            inset-0
            bg-black/70
            flex
            items-center
            justify-center
            z-50
        ">

                        <div className="
                w-[420px]
                rounded-3xl
                bg-[#071227]
                border
                border-cyan-500/20
                p-6
            ">

                            <h1 className="
                    text-2xl
                    font-black
                    mb-5
                    text-cyan-300
                ">
                                Update Calibration
                            </h1>

                            <div className="space-y-4">

                                <div>

                                    <p className="
                            text-sm
                            text-slate-400
                            mb-2
                        ">
                                        Last Inspection Date
                                    </p>

                                    <input
                                        type="date"
                                        value={lastInspectionDate}
                                        onChange={(e) =>
                                            setLastInspectionDate(
                                                e.target.value
                                            )
                                        }
                                        className="
                                w-full
                                h-12
                                rounded-xl
                                bg-slate-900
                                border
                                border-slate-700
                                px-4
                            "
                                    />

                                </div>

                                {
                                    lastInspectionDate && (

                                        <div className="
                                p-4
                                rounded-2xl
                                bg-cyan-500/10
                                border
                                border-cyan-500/20
                            ">

                                            <p className="
                                    text-sm
                                    text-slate-400
                                ">
                                                Next Calibration
                                            </p>

                                            <h1 className="
                                    text-xl
                                    font-bold
                                    text-cyan-300
                                    mt-1
                                ">

                                                {
                                                    (() => {

                                                        const d =
                                                            new Date(
                                                                lastInspectionDate
                                                            );

                                                        d.setFullYear(
                                                            d.getFullYear() + 1
                                                        );

                                                        return d
                                                            .toLocaleDateString(
                                                                "id-ID"
                                                            );

                                                    })()
                                                }

                                            </h1>

                                        </div>

                                    )
                                }

                            </div>

                            <div className="
                    flex
                    justify-end
                    gap-3
                    mt-6
                ">

                                <button
                                    onClick={() =>
                                        setCalibrationItem(null)
                                    }
                                    className="
                            h-11
                            px-5
                            rounded-xl
                            bg-slate-700
                            font-bold
                        "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleUpdateCalibration
                                    }
                                    className="
                            h-11
                            px-5
                            rounded-xl
                            bg-cyan-500
                            font-bold
                        "
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({
    title,
    value,
    icon,
    color,
    active,
    onClick
}) {

    return (

        <div
            onClick={onClick}
            className={`
                rounded-3xl
                border
                p-5
                cursor-pointer
                transition-all
                hover:scale-[1.02]

                ${active
                    ? `
                        ring-2
                        ring-white
                        scale-[1.02]
                    `
                    : ""
                }

                ${color === "cyan"
                    ? "border-cyan-500/30 bg-cyan-500/10"
                    : ""
                }

                ${color === "emerald"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : ""
                }

                ${color === "red"
                    ? "border-red-500/30 bg-red-500/10"
                    : ""
                }

                ${color === "purple"
                    ? "border-purple-500/30 bg-purple-500/10"
                    : ""
                }
            `}
        >

            <div className="
                flex
                items-center
                justify-between
            ">

                <div>

                    <p className="
                        text-sm
                        text-slate-300
                    ">
                        {title}
                    </p>

                    <h1 className="
                        text-4xl
                        font-black
                        mt-2
                    ">
                        {value}
                    </h1>

                </div>

                <div>
                    {icon}
                </div>

            </div>

        </div>

    );

}
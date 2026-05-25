import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Plus,
    Upload,
    Download,
    Pencil,
    Trash2,
    AlertTriangle,
    Clock3,
    CheckCircle2,
    XCircle,
    Wrench,
} from "lucide-react";

import * as XLSX from "xlsx";

import { supabase }
    from "../../supabase/supabase";


// ======================================================
// HELPERS
// ======================================================

const normalizeText = (
    value
) => {

    return String(value || "")
        .trim()
        .toLowerCase();

};

const excelDateToJSDate = (
    serial
) => {

    if (!serial)
        return "";

    if (
        typeof serial ===
        "string"
    ) {

        return serial;

    }

    const utc_days =
        Math.floor(
            serial - 25569
        );

    const utc_value =
        utc_days * 86400;

    const date_info =
        new Date(
            utc_value * 1000
        );

    return date_info
        .toISOString()
        .split("T")[0];

};

const getCurrentWeek = () => {

    const today =
        new Date();

    const firstDay =
        new Date(
            today.getFullYear(),
            0,
            1
        );

    const pastDays =
        (
            today - firstDay
        ) / 86400000;

    return Math.ceil(
        (pastDays + firstDay.getDay() + 1) / 7
    );

};

const getWeekFromDate = (dateString) => {

    if (!dateString)
        return null;

    const date =
        new Date(dateString);

    // COPY DATE
    const target =
        new Date(date.valueOf());

    // ISO WEEK DATE
    const dayNr =
        (date.getDay() + 6) % 7;

    target.setDate(
        target.getDate() - dayNr + 3
    );

    const firstThursday =
        new Date(
            target.getFullYear(),
            0,
            4
        );

    const diff =
        target - firstThursday;

    return (
        1 +
        Math.round(
            diff / 604800000
        )
    );

};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function MaintenancePlan() {

    // ======================================================
    // STATE
    // ======================================================

    const [pmData,
        setPmData] =
        useState([]);

    const [search,
        setSearch] =
        useState("");

    const [summaryFilter,
        setSummaryFilter] =
        useState([
            "ONGOING",
            "OVERDUE",
            "REJECT",
        ]);

    const [showAddModal,
        setShowAddModal] =
        useState(false);

    const [editingItem,
        setEditingItem] =
        useState(null);

    const [editForm,
        setEditForm] =
        useState({});

    const [showWeekDropdown,
        setShowWeekDropdown] =
        useState(false);

    const [
        showResponsibleDropdown,
        setShowResponsibleDropdown
    ] = useState(false);

    const [
        showEquipmentDropdown,
        setShowEquipmentDropdown
    ] = useState(false);

    const [
        equipmentTypeFilter,
        setEquipmentTypeFilter
    ] = useState([]);

    const [addForm,
        setAddForm] =
        useState({

            equipmentType: "",
            machine: "",
            item: "",
            criteria: "",
            actionTask: "",
            time: "",
            frequency: "",
            annualMaintenance: "",
            week: "",
            month: "",
            responsible: "",
            status: "Ongoing",
            closedAt: "",
            weekCompleted: "",
            pointSummary: "",

        });

    // ======================================================
    // LOAD DATA
    // ======================================================

    useEffect(() => {

        loadPMData();

    }, []);

    const loadPMData = async () => {

        const {
            data,
            error,
        } = await supabase
            .from("preventive-maintenance")
            .select(`
            id,
            equipmentType,
            machine,
            item,
            criteria,
            actionTask,
            time,
            frequency,
            annualMaintenance,
            week,
            month,
            responsible,
            status,
            closedAt,
            weekCompleted,
            pointSummary
        `)
            .order("id", {
                ascending: true,
            })

        if (error) {

            console.log(error);
            return;

        }

        console.log(data);

        setPmData(data || []);

    };

    // ======================================================
    // SUMMARY FILTER
    // ======================================================

    const handleSummaryFilter =
        (filter) => {

            setSummaryFilter(
                (prev) => {

                    if (
                        prev.includes(
                            filter
                        )
                    ) {

                        return prev.filter(
                            (x) =>
                                x !== filter
                        );

                    }

                    return [
                        ...prev,
                        filter,
                    ];

                }
            );

        };

    const [weekFilter, setWeekFilter] =
        useState([
            String(
                getCurrentWeek()
            )
        ]);

    const [responsibleFilter, setResponsibleFilter] =
        useState([]);

    const [monthFilter, setMonthFilter] =
        useState([]);
    // ======================================================
    // FILTER
    // ======================================================

    const filteredData =
        useMemo(() => {

            return pmData.filter(
                (item) => {

                    const keyword =
                        search.toLowerCase();

                    const searchMatch =

                        item.machine
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.equipmentType
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.item
                            ?.toLowerCase()
                            .includes(keyword)

                        ||

                        item.responsible
                            ?.toLowerCase()
                            .includes(keyword);

                    // =====================================
                    // SUMMARY FILTER
                    // =====================================

                    let summaryMatch =
                        true;

                    if (
                        summaryFilter.length > 0
                    ) {

                        summaryMatch =
                            false;

                        if (
                            summaryFilter.includes(
                                "OVERDUE"
                            ) &&
                            item.status ===
                            "Overdue"
                        ) {

                            summaryMatch =
                                true;

                        }

                        if (
                            summaryFilter.includes(
                                "ONGOING"
                            ) &&
                            item.status ===
                            "Ongoing"
                        ) {

                            summaryMatch =
                                true;

                        }

                        if (
                            summaryFilter.includes(
                                "DONE"
                            ) &&
                            item.status ===
                            "Done"
                        ) {

                            summaryMatch =
                                true;

                        }

                        if (
                            summaryFilter.includes(
                                "REJECT"
                            ) &&
                            item.status ===
                            "Reject"
                        ) {

                            summaryMatch =
                                true;

                        }

                    }

                    // =====================================
                    // WEEK FILTER
                    // =====================================

                    const weekMatch =
                        weekFilter.length === 0
                        ||
                        weekFilter.includes(
                            String(item.week)
                        );

                    // =====================================
                    // RESPONSIBLE FILTER
                    // =====================================

                    const responsibleMatch =
                        responsibleFilter.length === 0
                        ||
                        responsibleFilter.includes(
                            item.responsible
                        );

                    // =====================================
                    // EQUIPMENT TYPE FILTER
                    // =====================================

                    const equipmentMatch =
                        equipmentTypeFilter.length === 0
                        ||
                        equipmentTypeFilter.includes(
                            item.equipmentType
                        );

                    // =====================================
                    // MONTH FILTER
                    // =====================================

                    const monthMatch =
                        monthFilter.length === 0
                        ||
                        monthFilter.includes(
                            item.month
                        );

                    return (
                        searchMatch
                        &&
                        summaryMatch
                        &&
                        weekMatch
                        &&
                        responsibleMatch
                        &&
                        equipmentMatch
                        &&
                        monthMatch
                    );

                }
            );

        }, [
            pmData,
            search,
            summaryFilter,
            weekFilter,
            responsibleFilter,
            equipmentTypeFilter,
        ]);

    // ======================================================
    // KPI
    // ======================================================

    const overdueCount =
        filteredData.filter(
            (x) =>
                x.status ===
                "Overdue"
        ).length;

    const ongoingCount =
        filteredData.filter(
            (x) =>
                x.status ===
                "Ongoing"
        ).length;

    const doneCount =
        filteredData.filter(
            (x) =>
                x.status ===
                "Done"
        ).length;

    const rejectCount =
        filteredData.filter(
            (x) =>
                x.status ===
                "Reject"
        ).length;

    // ======================================================
    // FILTER OPTIONS
    // ======================================================

    const uniqueWeeks =
        [...new Set(
            pmData.map(
                x => x.week
            )
        )]
            .filter(Boolean)
            .sort((a, b) => a - b);

    const uniqueResponsibles =
        [...new Set(
            pmData.map(
                x => x.responsible
            )
        )]
            .filter(Boolean)
            .sort();

    const uniqueEquipmentTypes =
        [...new Set(
            pmData.map(
                x => x.equipmentType
            )
        )]
            .filter(Boolean)
            .sort();

    // ======================================================
    // IMPORT EXCEL
    // ======================================================

    const handleImportExcel =
        async (e) => {

            const file =
                e.target.files[0];

            if (!file)
                return;
            // FORCE SAME FILE RE-IMPORT
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
                                type:
                                    "binary",
                            });

                        const sheetName =
                            workbook
                                .SheetNames[0];

                        const sheet =
                            workbook
                                .Sheets[
                            sheetName
                            ];

                        const json =
                            XLSX.utils.sheet_to_json(
                                sheet
                            );

                        const formatted = json.map((item) => {

                            return {

                                equipmentType:
                                    item["Equipment Type"] || "",

                                machine:
                                    item["Machine"] || "",

                                item:
                                    item["Item"] || "",

                                criteria:
                                    item["Criteria"] || "",

                                actionTask:
                                    item["Action"] || "",

                                time:
                                    item["Time"]
                                        ? Number(item["Time"])
                                        : null,

                                frequency:
                                    item["Frequency"]
                                        ? Number(item["Frequency"])
                                        : null,

                                annualMaintenance:
                                    item["Annual Maintenance"] || "",

                                week:
                                    item["Week"]
                                        ? Number(item["Week"])
                                        : null,

                                month:
                                    item["Month"] || "",

                                responsible:
                                    item["Responsible"] || "",

                                status:
                                    item["Status"] || "Ongoing",

                                closedAt:
                                    excelDateToJSDate(
                                        item["Date completed"]
                                    ),

                                weekCompleted:
                                    item["Week Completed"]
                                        ? Number(item["Week Completed"])
                                        : (
                                            item["Date completed"]
                                                ? getWeekFromDate(
                                                    excelDateToJSDate(
                                                        item["Date completed"]
                                                    )
                                                )
                                                : null
                                        ),

                                pointSummary:
                                    item["Point Summary"]
                                        ? Number(item["Point Summary"])
                                        : 0,

                            };

                        });
                        console.log(formatted);
                        // =========================================
                        // LOAD EXISTING DATA
                        // =========================================

                        const {
                            data: existingData,
                            error: existingError
                        } = await supabase
                            .from("preventive-maintenance")
                            .select(`
                                id,
                                equipmentType,
                                machine,
                                item,
                                criteria,
                                actionTask,
                                week,
                                responsible,
                                month,
                                frequency,
                                closedAt,
                                status,
                                weekCompleted,
                                pointSummary
                            `);

                        if (existingError) {

                            console.log(existingError);

                            alert("Failed load existing data");

                            return;

                        }

                        // =========================================
                        // CREATE MAP EXISTING
                        // =========================================

                        const existingMap =
                            new Map();

                        existingData.forEach((row) => {

                            const key =
                                [
                                    normalizeText(row.equipmentType),
                                    normalizeText(row.machine),
                                    normalizeText(row.item),
                                    normalizeText(row.criteria),
                                    normalizeText(row.actionTask),
                                    row.week,
                                ].join("_");

                            existingMap.set(
                                key,
                                row
                            );

                        });

                        // =========================================
                        // SPLIT INSERT & UPDATE
                        // =========================================

                        const insertData = [];
                        const updateData = [];

                        formatted.forEach((row) => {

                            const key =
                                [
                                    normalizeText(row.equipmentType),
                                    normalizeText(row.machine),
                                    normalizeText(row.item),
                                    normalizeText(row.criteria),
                                    normalizeText(row.actionTask),
                                    row.week,
                                ].join("_");

                            const existing =
                                existingMap.get(key);

                            // =====================================
                            // AUTO WEEK COMPLETED
                            // =====================================

                            if (row.closedAt) {

                                row.weekCompleted =
                                    getWeekFromDate(
                                        row.closedAt
                                    );

                                if (
                                    Number(row.weekCompleted)
                                    ===
                                    Number(row.week)
                                ) {

                                    row.status =
                                        "Done";

                                    row.pointSummary = 1;

                                }

                                else {

                                    row.status =
                                        "Reject";

                                    row.pointSummary = 0;

                                }

                            }

                            else {

                                row.weekCompleted =
                                    null;

                                row.status =
                                    "Ongoing";

                                row.pointSummary =
                                    0;

                            }

                            // =====================================
                            // UPDATE EXISTING
                            // =====================================

                            if (existing) {

                                let changed =
                                    false;

                                Object.keys(row).forEach((field) => {

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
                                        ...row,
                                    });

                                }

                            }

                            // =====================================
                            // INSERT NEW
                            // =====================================

                            else {

                                insertData.push(row);

                            }

                        });

                        console.log("INSERT:", insertData.length);
                        console.log("UPDATE:", updateData.length);

                        // =========================================
                        // INSERT NEW DATA
                        // =========================================

                        if (insertData.length > 0) {

                            const {
                                error: insertError
                            } = await supabase
                                .from("preventive-maintenance")
                                .insert(insertData);

                            if (insertError) {

                                console.log(insertError);

                            }

                        }

                        // =========================================
                        // UPDATE EXISTING DATA
                        // =========================================

                        for (const row of updateData) {

                            const {
                                id,
                                ...updatePayload
                            } = row;

                            const {
                                error: updateError
                            } = await supabase
                                .from("preventive-maintenance")
                                .update(updatePayload)
                                .eq("id", id);

                            if (updateError) {

                                console.log(updateError);

                            }

                        }

                        if (error) {

                            console.log(
                                error
                            );

                            alert(
                                "Import failed"
                            );

                            return;

                        }

                        await loadPMData();

                        alert(
                            "Import success"
                        );
                        e.target.value = null;
                    }

                    catch (err) {

                        console.log(
                            err
                        );

                        alert(
                            "Excel read failed"
                        );
                        e.target.value = null;
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
        // FORMAT EXPORT
        // ====================================

        const exportData =
            filteredData.map((item) => {

                return {

                    "Equipment Type":
                        item.equipmentType || "",

                    "Machine":
                        item.machine || "",

                    "Item":
                        item.item || "",

                    "Criteria":
                        item.criteria || "",

                    "Action Task":
                        item.actionTask || "",

                    "Time":
                        item.time || "",

                    "Frequency":
                        item.frequency || "",

                    "Annual":
                        item.annualMaintenance || "",

                    "Week":
                        item.week || "",

                    "Month":
                        item.month || "",

                    "Responsible":
                        item.responsible || "",

                    "Status":
                        item.status || "",

                    "Date Completed":
                        item.closedAt || "",

                    "Week Completed":
                        item.weekCompleted || "",

                    "Point Summary":
                        item.pointsSummary || ""

                };

            });

        // ====================================
        // CREATE WORKBOOK
        // ====================================

        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Preventive Maintenance"
        );

        // ====================================
        // AUTO COLUMN WIDTH
        // ====================================

        worksheet["!cols"] = [

            { wch: 25 }, // Equipment Type
            { wch: 30 }, // Machine
            { wch: 25 }, // Item
            { wch: 20 }, // Criteria
            { wch: 60 }, // Action Task
            { wch: 10 }, // Time
            { wch: 12 }, // Frequency
            { wch: 12 }, // Annual
            { wch: 10 }, // Week
            { wch: 15 }, // Month
            { wch: 18 }, // Responsible
            { wch: 15 }, // Status
            { wch: 18 }, // Date Completed
            { wch: 18 }, // Week Completed
            { wch: 15 }  // Point Summary

        ];

        // ====================================
        // EXPORT FILE
        // ====================================

        XLSX.writeFile(

            workbook,

            `PREVENTIVE_MAINTENANCE_${new Date()
                .toISOString()
                .split("T")[0]
            }.xlsx`

        );

    };

    // ======================================================
    // DELETE
    // ======================================================

    const handleDelete =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Delete this PM data?"
                );

            if (
                !confirmDelete
            )
                return;

            const {
                error,
            } =
                await supabase
                    .from(
                        "preventive-maintenance"
                    )
                    .delete()
                    .eq(
                        "id",
                        id
                    );

            if (error) {

                console.log(error);

                return;

            }

            await loadPMData();

        };

    // ======================================================
    // EDIT
    // ======================================================

    const handleEdit =
        (item) => {

            setEditingItem(
                item
            );

            setEditForm({
                ...item,
            });

        };

    const handleSaveEdit =
        async () => {

            const currentWeek =
                getCurrentWeek();

            let updatedData =
            {
                ...editForm
            };

            // =========================================
            // AUTO WEEK COMPLETED
            // =========================================

            if (
                updatedData.closedAt
            ) {

                const completedWeek =
                    getWeekFromDate(
                        updatedData.closedAt
                    );

                updatedData.weekCompleted =
                    completedWeek;

                // =====================================
                // STATUS LOGIC
                // =====================================

                if (
                    completedWeek ===
                    Number(updatedData.week)
                ) {

                    updatedData.status =
                        "Done";

                    updatedData.pointSummary =
                        1;

                }

                else {

                    updatedData.status =
                        "Reject";

                    updatedData.pointSummary =
                        0;

                }

            }

            else {

                updatedData.weekCompleted =
                    null;

                updatedData.status =
                    "Ongoing";

                updatedData.pointSummary =
                    0;

            }

            const {
                error,
            } =
                await supabase
                    .from(
                        "preventive-maintenance"
                    )
                    .update(
                        updatedData
                    )
                    .eq(
                        "id",
                        editingItem.id
                    );

            if (error) {

                console.log(error);

                alert(
                    "Update failed"
                );

                return;

            }

            await loadPMData();

            setEditingItem(
                null
            );

        };

    // ======================================================
    // ADD
    // ======================================================

    const handleAddPM =
        async () => {

            const {
                error,
            } =
                await supabase
                    .from(
                        "preventive-maintenance"
                    )
                    .insert([
                        addForm,
                    ]);

            if (error) {

                console.log(error);

                alert(
                    "Add failed"
                );

                return;

            }

            await loadPMData();

            setShowAddModal(
                false
            );

            loadPMData();

        };

    // ======================================================
    // DELETE ALL PM DATA
    // ======================================================

    const handleDeleteAllPM =
        async () => {

            const confirmDelete =
                window.confirm(
                    "DELETE ALL preventive-maintenance data ?"
                );

            if (!confirmDelete)
                return;

            const secondConfirm =
                window.confirm(
                    "THIS ACTION CANNOT BE UNDONE !!!"
                );

            if (!secondConfirm)
                return;

            const {
                error
            } = await supabase
                .from("preventive-maintenance")
                .delete()
                .neq("id", 0);

            if (error) {

                console.log(error);

                alert(
                    "Delete all failed"
                );

                return;

            }

            alert(
                "All PM data deleted"
            );

            await loadPMData();

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

            {/* ====================================================== */}
            {/* HEADER */}
            {/* ====================================================== */}

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
            " />

                        PREVENTIVE MAINTENANCE

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
                        Maintenance Plan
                    </h1>

                    <p className="
            text-slate-400
            mt-3
            text-lg
          ">
                        PM monitoring & maintenance management system
                    </p>

                </div>

            </div>

            {/* ====================================================== */}
            {/* ADVANCED SUMMARY */}
            {/* ====================================================== */}

            <div className="
                w-full
                grid
                grid-cols-12
                gap-4
                mb-6
                items-stretch
            ">

                {/* ====================================================== */}
                {/* TECHNICIAN PERFORMANCE */}
                {/* ====================================================== */}

                <div className="
                    col-span-5
                    h-[320px]
                    rounded-3xl
                    border
                    border-emerald-500/20
                    bg-gradient-to-br
                    from-emerald-500/10
                    to-slate-900
                    p-5
                    overflow-hidden
                    flex
                    flex-col
                ">

                    {/* HEADER */}

                    <div className="
                        flex
                        items-center
                        justify-between
                        mb-4
                        shrink-0
                    ">

                        <h1 className="
                            text-lg
                            font-bold
                            text-white
                        ">
                            Technician Performance
                        </h1>

                        <Wrench
                            size={18}
                            className="text-emerald-400"
                        />

                    </div>

                    {/* SCROLL AREA */}

                    <div className="
                        flex-1
                        overflow-y-auto
                        pr-2
                    ">

                        {
                            uniqueResponsibles.map((person) => {

                                const currentWeek =
                                    getCurrentWeek();

                                // ======================================
                                // ALL DATA UNTIL CURRENT WEEK
                                // ======================================

                                const personData =
                                    pmData.filter(
                                        x =>
                                            x.responsible === person
                                            &&
                                            Number(x.week) <= currentWeek
                                    );

                                // ======================================
                                // TOTAL POINT SUMMARY
                                // ======================================

                                const totalPoint =
                                    personData.reduce(
                                        (sum, item) =>
                                            sum + Number(item.pointSummary || 0),
                                        0
                                    );

                                // ======================================
                                // TOTAL TASK
                                // ======================================

                                const totalTask =
                                    personData.length;

                                // ======================================
                                // PERFORMANCE
                                // ======================================

                                const percent =
                                    totalTask > 0
                                        ? Math.round(
                                            (totalPoint / totalTask) * 100
                                        )
                                        : 0;

                                return (

                                    <div
                                        key={person}
                                        className={`
                                    mb-4
                                    cursor-pointer
                                    transition
                                    rounded-2xl
                                    p-2

                                    ${responsibleFilter.includes(person)
                                                ? "bg-emerald-500/10 border border-emerald-400/40"
                                                : "hover:bg-white/5 border border-transparent"
                                            }
                                `}
                                        onClick={() => {

                                            const currentWeek =
                                                getCurrentWeek();

                                            // buka semua week sebelumnya
                                            const allWeeksUntilNow =
                                                uniqueWeeks
                                                    .filter(
                                                        w => Number(w) <= currentWeek
                                                    )
                                                    .map(String);

                                            setWeekFilter(
                                                allWeeksUntilNow
                                            );

                                            setResponsibleFilter(prev => {

                                                if (prev.includes(person)) {

                                                    // kalau semua unselect
                                                    const updated =
                                                        prev.filter(
                                                            x => x !== person
                                                        );

                                                    // balik default current week
                                                    if (
                                                        updated.length === 0
                                                        &&
                                                        monthFilter.length === 0
                                                    ) {

                                                        // balik default current week
                                                        setWeekFilter([
                                                            String(getCurrentWeek())
                                                        ]);

                                                    }

                                                    else {

                                                        // tetap buka semua week sebelumnya
                                                        const currentWeek =
                                                            getCurrentWeek();

                                                        const allWeeksUntilNow =
                                                            uniqueWeeks
                                                                .filter(
                                                                    w => Number(w) <= currentWeek
                                                                )
                                                                .map(String);

                                                        setWeekFilter(
                                                            allWeeksUntilNow
                                                        );

                                                    }

                                                    return updated;

                                                }

                                                return [
                                                    ...prev,
                                                    person
                                                ];

                                            });

                                        }}
                                    >

                                        <div className="
                                flex
                                justify-between
                                text-xs
                                mb-2
                            ">

                                            <span className="
                                    text-white
                                    font-medium
                                ">
                                                {person}
                                            </span>

                                            <span className="
                                    text-emerald-300
                                    font-bold
                                ">
                                                {percent}%
                                            </span>

                                        </div>

                                        <div className="
                                w-full
                                h-3
                                rounded-full
                                bg-slate-800
                                overflow-hidden
                            ">

                                            <div
                                                className="
                                        h-full
                                        rounded-full
                                        bg-gradient-to-r
                                        from-emerald-400
                                        to-yellow-400
                                    "
                                                style={{
                                                    width: `${percent}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                );

                            })
                        }

                    </div>

                </div>

                {/* ====================================================== */}
                {/* EXECUTION BY MONTH */}
                {/* ====================================================== */}

                <div className="
                    col-span-4
                    h-[320px]
                    rounded-3xl
                    border
                    border-cyan-500/20
                    bg-gradient-to-br
                    from-cyan-500/10
                    to-slate-900
                    p-5
                    overflow-hidden
                    flex
                    flex-col
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                        mb-5
                        shrink-0
                    ">

                        <h1 className="
                            text-lg
                            font-bold
                            text-white
                        ">
                            % Execution by Month
                        </h1>

                        <Clock3
                            size={18}
                            className="text-cyan-400"
                        />

                    </div>

                    <div className="
                        flex-1
                        flex
                        items-end
                        gap-2
                    ">

                        {
                            [
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
                            ].map((month) => {

                                const monthData =
                                    pmData.filter(
                                        x =>
                                            x.month === month
                                    );

                                // ======================================
                                // TOTAL POINT SUMMARY
                                // ======================================

                                const totalPoint =
                                    monthData.reduce(
                                        (sum, item) =>
                                            sum + Number(item.pointSummary || 0),
                                        0
                                    );

                                // ======================================
                                // TOTAL TASK
                                // ======================================

                                const totalTask =
                                    monthData.length;

                                // ======================================
                                // EXECUTION PERCENT
                                // ======================================

                                const percent =
                                    totalTask > 0
                                        ? Math.round(
                                            (totalPoint / totalTask) * 100
                                        )
                                        : 0;

                                return (

                                    <div
                                        key={month}
                                        onClick={() => {

                                            const currentWeek =
                                                getCurrentWeek();

                                            // buka semua week sebelumnya
                                            const allWeeksUntilNow =
                                                uniqueWeeks
                                                    .filter(
                                                        w => Number(w) <= currentWeek
                                                    )
                                                    .map(String);

                                            setWeekFilter(
                                                allWeeksUntilNow
                                            );

                                            setMonthFilter(prev => {

                                                if (prev.includes(month)) {

                                                    const updated =
                                                        prev.filter(
                                                            x => x !== month
                                                        );

                                                    // kalau semua unselect
                                                    if (
                                                        updated.length === 0
                                                        &&
                                                        responsibleFilter.length === 0
                                                    ) {

                                                        // balik default current week
                                                        setWeekFilter([
                                                            String(getCurrentWeek())
                                                        ]);

                                                    }

                                                    else {

                                                        // tetap buka semua week sebelumnya
                                                        const currentWeek =
                                                            getCurrentWeek();

                                                        const allWeeksUntilNow =
                                                            uniqueWeeks
                                                                .filter(
                                                                    w => Number(w) <= currentWeek
                                                                )
                                                                .map(String);

                                                        setWeekFilter(
                                                            allWeeksUntilNow
                                                        );

                                                    }

                                                    return updated;

                                                }

                                                return [
                                                    ...prev,
                                                    month
                                                ];

                                            });

                                        }}
                                        className={`
                                        flex-1
                                        flex
                                        flex-col
                                        items-center
                                        justify-end
                                        gap-2
                                        h-full
                                        cursor-pointer
                                        transition
                                        rounded-2xl
                                        p-1

                                        ${monthFilter.includes(month)
                                                ? "bg-cyan-500/10 ring-2 ring-cyan-400 scale-[1.03]"
                                                : "hover:bg-white/5 hover:scale-[1.03]"
                                            }
                                    `}
                                    >

                                        <span className="
                                            text-[10px]
                                            text-cyan-300
                                            font-bold
                                        ">
                                            {percent}%
                                        </span>

                                        <div
                                            className="
                                    w-full
                                    flex-1
                                    rounded-t-xl
                                    bg-cyan-500/10
                                    relative
                                    overflow-hidden
                                    flex
                                    items-end
                                "
                                        >

                                            <div
                                                className="
                                        w-full
                                        rounded-t-xl
                                        bg-gradient-to-t
                                        from-blue-500
                                        to-cyan-400
                                    "
                                                style={{
                                                    height: `${percent}%`
                                                }}
                                            />

                                        </div>

                                        <span className="
                                text-[9px]
                                text-slate-400
                            ">
                                            {month.slice(0, 3)}
                                        </span>

                                    </div>

                                );

                            })
                        }

                    </div>

                </div>

                {/* ====================================================== */}
                {/* STATUS CARD 2x2 */}
                {/* ====================================================== */}

                <div className="
                    col-span-3
                    h-[320px]
                    grid
                    grid-cols-2
                    gap-3
                ">

                    <SummaryCard
                        title="Overdue"
                        value={overdueCount}
                        color="red"
                        icon={<AlertTriangle />}
                        active={
                            summaryFilter.includes(
                                "OVERDUE"
                            )
                        }
                        onClick={() =>
                            handleSummaryFilter(
                                "OVERDUE"
                            )
                        }
                    />

                    <SummaryCard
                        title="Ongoing"
                        value={ongoingCount}
                        color="yellow"
                        icon={<Clock3 />}
                        active={
                            summaryFilter.includes(
                                "ONGOING"
                            )
                        }
                        onClick={() =>
                            handleSummaryFilter(
                                "ONGOING"
                            )
                        }
                    />

                    <SummaryCard
                        title="Done"
                        value={doneCount}
                        color="emerald"
                        icon={<CheckCircle2 />}
                        active={
                            summaryFilter.includes(
                                "DONE"
                            )
                        }
                        onClick={() =>
                            handleSummaryFilter(
                                "DONE"
                            )
                        }
                    />

                    <SummaryCard
                        title="Reject"
                        value={rejectCount}
                        color="purple"
                        icon={<XCircle />}
                        active={
                            summaryFilter.includes(
                                "REJECT"
                            )
                        }
                        onClick={() =>
                            handleSummaryFilter(
                                "REJECT"
                            )
                        }
                    />

                </div>

            </div>

            {/* ====================================================== */}
            {/* FILTER BAR */}
            {/* ====================================================== */}

            <div className="
    flex
    items-center
    gap-3
    mb-5
">

                {/* SEARCH */}

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
                        placeholder="Search machine, equipment, responsible..."
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

                {/* ====================================================== */}
                {/* WEEK DROPDOWN */}
                {/* ====================================================== */}

                <div className="relative">

                    <button
                        onClick={() =>
                            setShowWeekDropdown(
                                !showWeekDropdown
                            )
                        }
                        className="
            h-12
            px-4
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/70
            hover:border-cyan-500/40
            flex
            items-center
            gap-2
            min-w-[140px]
        "
                    >

                        <span className="
            text-sm
            text-white
            font-medium
        ">
                            Week
                        </span>

                        {
                            weekFilter.length > 0 && (

                                <span className="
                    px-2
                    py-0.5
                    rounded-full
                    bg-cyan-500
                    text-[11px]
                    font-bold
                ">
                                    {weekFilter.length}
                                </span>

                            )
                        }

                    </button>

                    {
                        showWeekDropdown && (

                            <div className="
                absolute
                top-14
                left-0
                w-[220px]
                rounded-2xl
                border
                border-slate-800
                bg-[#071226]
                shadow-2xl
                z-50
                p-2
                max-h-[320px]
                overflow-auto
            ">

                                {
                                    uniqueWeeks.map(
                                        (week) => {

                                            const selected =
                                                weekFilter.includes(
                                                    String(week)
                                                );

                                            return (

                                                <button
                                                    key={week}
                                                    onClick={() => {

                                                        if (selected) {

                                                            setWeekFilter(
                                                                prev =>
                                                                    prev.filter(
                                                                        x =>
                                                                            x !== String(week)
                                                                    )
                                                            );

                                                        }

                                                        else {

                                                            setWeekFilter(
                                                                prev => [
                                                                    ...prev,
                                                                    String(week)
                                                                ]
                                                            );

                                                        }

                                                    }}
                                                    className={`
                                        w-full
                                        px-4
                                        py-3
                                        rounded-xl
                                        text-left
                                        text-sm
                                        transition
                                        mb-1

                                        ${selected
                                                            ? "bg-cyan-500 text-white"
                                                            : "hover:bg-slate-800 text-slate-300"
                                                        }
                                    `}
                                                >

                                                    Week {week}

                                                </button>

                                            );

                                        }
                                    )
                                }

                            </div>

                        )
                    }

                </div>


                {/* ====================================================== */}
                {/* RESPONSIBLE DROPDOWN */}
                {/* ====================================================== */}

                <div className="relative">

                    <button
                        onClick={() =>
                            setShowResponsibleDropdown(
                                !showResponsibleDropdown
                            )
                        }
                        className="
            h-12
            px-4
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/70
            hover:border-cyan-500/40
            flex
            items-center
            gap-2
            min-w-[170px]
        "
                    >

                        <span className="
            text-sm
            text-white
            font-medium
        ">
                            Responsible
                        </span>

                        {
                            responsibleFilter.length > 0 && (

                                <span className="
                    px-2
                    py-0.5
                    rounded-full
                    bg-emerald-500
                    text-[11px]
                    font-bold
                ">
                                    {responsibleFilter.length}
                                </span>

                            )
                        }

                    </button>

                    {
                        showResponsibleDropdown && (

                            <div className="
                absolute
                top-14
                left-0
                w-[240px]
                rounded-2xl
                border
                border-slate-800
                bg-[#071226]
                shadow-2xl
                z-50
                p-2
                max-h-[320px]
                overflow-auto
            ">

                                {
                                    uniqueResponsibles.map(
                                        (person) => {

                                            const selected =
                                                responsibleFilter.includes(
                                                    person
                                                );

                                            return (

                                                <button
                                                    key={person}
                                                    onClick={() => {

                                                        if (selected) {

                                                            setResponsibleFilter(
                                                                prev =>
                                                                    prev.filter(
                                                                        x =>
                                                                            x !== person
                                                                    )
                                                            );

                                                        }

                                                        else {

                                                            setResponsibleFilter(
                                                                prev => [
                                                                    ...prev,
                                                                    person
                                                                ]
                                                            );

                                                        }

                                                    }}
                                                    className={`
                                        w-full
                                        px-4
                                        py-3
                                        rounded-xl
                                        text-left
                                        text-sm
                                        transition
                                        mb-1

                                        ${selected
                                                            ? "bg-emerald-500 text-white"
                                                            : "hover:bg-slate-800 text-slate-300"
                                                        }
                                    `}
                                                >

                                                    {person}

                                                </button>

                                            );

                                        }
                                    )
                                }

                            </div>

                        )
                    }

                </div>

                {/* ====================================================== */}
                {/* EQUIPMENT TYPE DROPDOWN */}
                {/* ====================================================== */}

                <div className="relative">

                    <button
                        onClick={() =>
                            setShowEquipmentDropdown(
                                !showEquipmentDropdown
                            )
                        }
                        className="
            h-12
            px-4
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/70
            hover:border-cyan-500/40
            flex
            items-center
            gap-2
            min-w-[190px]
        "
                    >

                        <span className="
            text-sm
            text-white
            font-medium
        ">
                            Equipment Type
                        </span>

                        {
                            equipmentTypeFilter.length > 0 && (

                                <span className="
                    px-2
                    py-0.5
                    rounded-full
                    bg-purple-500
                    text-[11px]
                    font-bold
                ">
                                    {equipmentTypeFilter.length}
                                </span>

                            )
                        }

                    </button>

                    {
                        showEquipmentDropdown && (

                            <div className="
                absolute
                top-14
                left-0
                w-[260px]
                rounded-2xl
                border
                border-slate-800
                bg-[#071226]
                shadow-2xl
                z-50
                p-2
                max-h-[320px]
                overflow-auto
            ">

                                {
                                    uniqueEquipmentTypes.map(
                                        (type) => {

                                            const selected =
                                                equipmentTypeFilter.includes(
                                                    type
                                                );

                                            return (

                                                <button
                                                    key={type}
                                                    onClick={() => {

                                                        if (selected) {

                                                            setEquipmentTypeFilter(
                                                                prev =>
                                                                    prev.filter(
                                                                        x =>
                                                                            x !== type
                                                                    )
                                                            );

                                                        }

                                                        else {

                                                            setEquipmentTypeFilter(
                                                                prev => [
                                                                    ...prev,
                                                                    type
                                                                ]
                                                            );

                                                        }

                                                    }}
                                                    className={`
                                        w-full
                                        px-4
                                        py-3
                                        rounded-xl
                                        text-left
                                        text-sm
                                        transition
                                        mb-1

                                        ${selected
                                                            ? "bg-purple-500 text-white"
                                                            : "hover:bg-slate-800 text-slate-300"
                                                        }
                                    `}
                                                >

                                                    {type}

                                                </button>

                                            );

                                        }
                                    )
                                }

                            </div>

                        )
                    }

                </div>

                {/* ADD BUTTON */}

                <button
                    onClick={() =>
                        setShowAddModal(
                            true
                        )
                    }
                    className="
            h-12
            px-5
            rounded-2xl
            bg-cyan-500
            hover:bg-cyan-400
            flex
            items-center
            gap-2
            font-bold
            whitespace-nowrap
        "
                >

                    <Plus size={18} />

                    Add PM

                </button>

                {/* IMPORT */}

                <label className="
                    h-12
                    px-5
                    rounded-2xl
                    bg-emerald-500
                    hover:bg-emerald-400
                    flex
                    items-center
                    gap-2
                    font-bold
                    cursor-pointer
                    whitespace-nowrap
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
                        hover:bg-blue-500
                        flex
                        items-center
                        gap-2
                        font-bold
                        whitespace-nowrap
                    "
                >

                    <Download size={18} />

                    Export Excel

                </button>

                {/* DELETE ALL */}

                <button
                    onClick={
                        handleDeleteAllPM
                    }
                    className="
                        h-12
                        px-5
                        rounded-2xl
                        bg-red-600
                        hover:bg-red-500
                        flex
                        items-center
                        gap-2
                        font-bold
                        whitespace-nowrap
                    "
                >

                    <Trash2 size={18} />

                    Delete All

                </button>
            </div>

            {/* ====================================================== */}
            {/* TABLE */}
            {/* ====================================================== */}

            <div className="
        overflow-auto
        rounded-3xl
        border
        border-slate-800
        max-h-[60vh]
      ">

                <table className="
          min-w-full
          text-sm
        ">

                    <thead className="
            sticky
            top-0
            z-20
            bg-slate-900
            text-cyan-300
          ">

                        <tr>

                            <th className="p-3">
                                No
                            </th>

                            <th className="p-3">
                                Equipment Type
                            </th>

                            <th className="p-3">
                                Machine
                            </th>

                            <th className="p-3">
                                Item
                            </th>

                            <th className="p-3">
                                Criteria
                            </th>

                            <th className="p-3">
                                actionTask
                            </th>

                            <th className="p-3">
                                Time
                            </th>

                            <th className="p-3">
                                Frequency
                            </th>

                            <th className="p-3">
                                Annual
                            </th>

                            <th className="p-3">
                                Week
                            </th>

                            <th className="p-3">
                                Month
                            </th>

                            <th className="p-3">
                                Responsible
                            </th>

                            <th className="p-3">
                                Status
                            </th>

                            <th className="p-3">
                                Date Completed
                            </th>

                            <th className="p-3">
                                Week Completed
                            </th>

                            <th className="p-3">
                                Point Summary
                            </th>

                            <th className="p-3">
                                actionTask
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            filteredData.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <tr
                                        key={item.id}
                                        className="
                      border-t
                      border-slate-800
                      hover:bg-cyan-500/5
                    "
                                    >

                                        <td className="p-3">
                                            {index + 1}
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.equipmentType
                                            }
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.machine
                                            }
                                        </td>

                                        <td className="p-3">
                                            {item.item}
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.criteria
                                            }
                                        </td>

                                        <td className="
                      p-3
                      min-w-[300px]
                    ">
                                            {
                                                item.actionTask
                                            }
                                        </td>

                                        <td className="p-3">
                                            {item.time}
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.frequency
                                            }
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.annualMaintenance
                                            }
                                        </td>

                                        <td className="p-3">
                                            {item.week}
                                        </td>

                                        <td className="p-3">
                                            {item.month}
                                        </td>

                                        <td className="p-3">
                                            {
                                                item.responsible
                                            }
                                        </td>

                                        <td className="p-3">

                                            <span className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-bold

                        ${item.status === "Done"
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : item.status === "Overdue"
                                                        ? "bg-red-500/20 text-red-400"
                                                        : item.status === "Reject"
                                                            ? "bg-purple-500/20 text-purple-400"
                                                            : "bg-yellow-500/20 text-yellow-400"
                                                }
                      `}>

                                                {
                                                    item.status
                                                }

                                            </span>

                                        </td>

                                        <td className="p-3">

                                            {
                                                item.closedAt
                                                    ? excelDateToJSDate(
                                                        item.closedAt
                                                    )
                                                    : "-"
                                            }

                                        </td>

                                        <td className="p-3">

                                            {
                                                item.weekCompleted || "-"
                                            }

                                        </td>

                                        <td className="p-3">

                                            {
                                                item.pointSummary || 0
                                            }

                                        </td>

                                        <td className="p-3">

                                            <div className="
                        flex
                        items-center
                        gap-2
                      ">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            item
                                                        )
                                                    }
                                                    className="
                            w-9
                            h-9
                            rounded-xl
                            border
                            border-yellow-500/30
                            bg-yellow-500/10
                            flex
                            items-center
                            justify-center
                          "
                                                >

                                                    <Pencil
                                                        size={16}
                                                        className="
                              text-yellow-400
                            "
                                                    />

                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id
                                                        )
                                                    }
                                                    className="
                            w-9
                            h-9
                            rounded-xl
                            border
                            border-red-500/30
                            bg-red-500/10
                            flex
                            items-center
                            justify-center
                          "
                                                >

                                                    <Trash2
                                                        size={16}
                                                        className="
                              text-red-400
                            "
                                                    />

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
            {/* ====================================================== */}
            {/* EDIT MODAL */}
            {/* ====================================================== */}

            {
                editingItem && (

                    <div className="
            fixed
            inset-0
            z-[999]
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-6
        ">

                        <div className="
                w-full
                max-w-4xl
                rounded-[32px]
                border
                border-cyan-500/20
                bg-[#071226]
                p-8
                max-h-[90vh]
                overflow-auto
            ">

                            {/* HEADER */}

                            <div className="
                    flex
                    items-center
                    justify-between
                    mb-8
                ">

                                <div>

                                    <h1 className="
                            text-3xl
                            font-black
                            text-white
                        ">
                                        Edit PM Data
                                    </h1>

                                    <p className="
                            text-slate-400
                            mt-1
                        ">
                                        Update preventive maintenance data
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setEditingItem(null)
                                    }
                                    className="
                            w-10
                            h-10
                            rounded-xl
                            bg-red-500/20
                            border
                            border-red-500/30
                            text-red-400
                            font-bold
                        "
                                >
                                    X
                                </button>

                            </div>

                            {/* FORM */}

                            <div className="
                    grid
                    grid-cols-2
                    gap-5
                ">

                                {
                                    [
                                        "equipmentType",
                                        "machine",
                                        "item",
                                        "criteria",
                                        "actionTask",
                                        "time",
                                        "frequency",
                                        "annualMaintenance",
                                        "week",
                                        "month",
                                        "responsible",
                                        "closedAt"
                                    ].map((field) => (

                                        <div
                                            key={field}
                                            className="
                                    flex
                                    flex-col
                                    gap-2
                                "
                                        >

                                            <label className="
                                    text-sm
                                    text-slate-300
                                    capitalize
                                ">
                                                {field}
                                            </label>

                                            <input
                                                type={
                                                    field === "closedAt"
                                                        ? "date"
                                                        : "text"
                                                }
                                                value={
                                                    editForm[field] || ""
                                                }
                                                onChange={(e) =>
                                                    setEditForm({
                                                        ...editForm,
                                                        [field]:
                                                            e.target.value
                                                    })
                                                }
                                                className="
                                        h-12
                                        rounded-2xl
                                        bg-slate-900/60
                                        border
                                        border-slate-700
                                        px-4
                                        outline-none
                                        text-white
                                    "
                                            />

                                        </div>

                                    ))
                                }

                            </div>

                            {/* ACTION */}

                            <div className="
                    flex
                    justify-end
                    gap-3
                    mt-8
                ">

                                <button
                                    onClick={() =>
                                        setEditingItem(null)
                                    }
                                    className="
                            h-12
                            px-6
                            rounded-2xl
                            border
                            border-slate-700
                            text-slate-300
                        "
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleSaveEdit
                                    }
                                    className="
                            h-12
                            px-6
                            rounded-2xl
                            bg-cyan-500
                            hover:bg-cyan-400
                            text-white
                            font-bold
                        "
                                >
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
        </div>

    );

}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({

    title,
    value,
    color,
    icon,
    onClick,
    active,

}) {

    return (

        <div
            onClick={onClick}
            className={`
        rounded-3xl
        border
        p-5
        cursor-pointer
        transition
        hover:scale-[1.02]

        ${active
                    ? "ring-2 ring-cyan-400"
                    : ""
                }

        ${color === "red"
                    ? "border-red-500/30 bg-red-500/10"
                    : ""
                }

        ${color === "yellow"
                    ? "border-yellow-500/30 bg-yellow-500/10"
                    : ""
                }

        ${color === "emerald"
                    ? "border-emerald-500/30 bg-emerald-500/10"
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

                <div className="
          text-white
        ">
                    {icon}
                </div>

            </div>
        </div>

    );

}